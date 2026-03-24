import {
  ClosedCaptionEvent,
  CallSessionParticipantJoinedEvent,
  CallTranscriptionReadyEvent,
  CallSessionParticipantLeftEvent,
  CallSessionStartedEvent,
} from "@stream-io/node-sdk";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

function extractMeetingIdFromCallCid(callCid: string | undefined): string {
  if (!callCid) return "";
  const [, meetingId] = callCid.split(":");
  return meetingId ?? "";
}

async function startAgentForMeetingIfNeeded(meetingId: string) {
  if (!meetingId) {
    return { started: false, reason: "missing_meeting_id" };
  }

  // Atomic lock: only one webhook request can transition upcoming -> processing.
  const [lockedMeeting] = await db
    .update(meetings)
    .set({ status: "processing" })
    .where(and(eq(meetings.id, meetingId), eq(meetings.status, "upcoming")))
    .returning({ id: meetings.id, agentId: meetings.agentId });

  if (!lockedMeeting) {
    const [existingMeeting] = await db
      .select({ status: meetings.status })
      .from(meetings)
      .where(eq(meetings.id, meetingId));

    if (!existingMeeting) {
      console.warn("Ignoring AI startup for missing meeting", { meetingId });
      return { started: false, reason: "meeting_not_found" };
    }

    return {
      started: false,
      reason: `meeting_already_${existingMeeting.status}`,
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    await db
      .update(meetings)
      .set({ status: "upcoming" })
      .where(eq(meetings.id, meetingId));

    return { started: false, reason: "missing_openai_api_key" };
  }

  const [existingAgent] = await db
    .select()
    .from(agents)
    .where(eq(agents.id, lockedMeeting.agentId));

  if (!existingAgent) {
    await db
      .update(meetings)
      .set({ status: "upcoming" })
      .where(eq(meetings.id, meetingId));

    return { started: false, reason: "agent_not_found" };
  }

  const call = streamVideo.video.call("default", meetingId);

  try {
    const realtimeClient = await streamVideo.video.connectOpenAi({
      call,
      openAiApiKey: process.env.OPENAI_API_KEY,
      agentUserId: existingAgent.id,
      model:
        process.env.OPENAI_REALTIME_MODEL ||
        "gpt-4o-mini-realtime-preview",
    });

    realtimeClient.updateSession({
      instructions: `${existingAgent.instructions}\n\nSystem rule: Always respond in clear English only. Do not switch languages unless explicitly asked by the user.`,
      modalities: ["audio", "text"],
      turn_detection: {
        type: "server_vad",
      },
      input_audio_transcription: {
        model: "whisper-1",
      },
    });

    await db
      .update(meetings)
      .set({ status: "active", startedAt: new Date() })
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, "processing")));

    console.log(`[agent_start][${meetingId}] connected as ${existingAgent.id}`);
    return { started: true, reason: "connected" };
  } catch (error) {
    console.error(`[agent_start][${meetingId}] failed`, error);

    await db
      .update(meetings)
      .set({ status: "upcoming" })
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, "processing")));

    throw error;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-signature");
  const apiKey = request.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json(
      { error: "Missing signature or API key" },
      { status: 400 },
    );
  }

  const body = await request.text();

  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const eventType = (payload as Record<string, unknown>)?.type;

  console.log("Event type: ", eventType);

  if (eventType == "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId as string;

    if (!meetingId) {
      return NextResponse.json(
        { error: "Missing meetingId in call.custom" },
        { status: 400 },
      );
    }
    const result = await startAgentForMeetingIfNeeded(meetingId);
    return NextResponse.json({ status: "ok", startup: result });
  } else if (eventType === "call.session_participant_joined") {
    const event = payload as CallSessionParticipantJoinedEvent;
    const meetingId = extractMeetingIdFromCallCid(event.call_cid);
    const result = await startAgentForMeetingIfNeeded(meetingId);

    if (result.started) {
      console.log(
        `[agent_start][${meetingId}] trigger=session_participant_joined user=${event.participant.user?.id || "unknown"}`,
      );
    }

    return NextResponse.json({ status: "ok", startup: result });
  } else if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = extractMeetingIdFromCallCid(event.call_cid);

    if (!meetingId) {
      return NextResponse.json(
        { error: "Missing meetingId in call_cid" },
        { status: 400 },
      );
    }

    const call = streamVideo.video.call("default", meetingId);
    await call.end();
  } else if (eventType === "call.closed_caption") {
    const event = payload as ClosedCaptionEvent;
    const meetingId = extractMeetingIdFromCallCid(event.call_cid);
    const startupResult = await startAgentForMeetingIfNeeded(meetingId);

    if (startupResult.started) {
      console.log(`[agent_start][${meetingId}] trigger=closed_caption`);
    }

    const text = event.closed_caption?.text?.trim();

    if (!meetingId || !text) {
      return NextResponse.json({ status: "ignored", reason: "empty_caption" });
    }

    const speakerId =
      event.closed_caption.speaker_id ?? event.closed_caption.user?.id ?? "unknown";
    const speakerName = event.closed_caption.user?.name ?? speakerId;

    const [meeting] = await db
      .select({ userId: meetings.userId, agentId: meetings.agentId })
      .from(meetings)
      .where(eq(meetings.id, meetingId));

    const role =
      meeting?.agentId === speakerId
        ? "agent"
        : meeting?.userId === speakerId
          ? "user"
          : "participant";

    console.log(
      `[caption][${meetingId}] ${role.toUpperCase()} ${speakerName}: ${text}`,
    );
  } else if (eventType === "call.transcription_ready") {
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = extractMeetingIdFromCallCid(event.call_cid);
    const transcriptionUrl = event.call_transcription?.url;

    console.log(
      `[transcription_ready][${meetingId || "unknown"}] ${transcriptionUrl || "missing_url"}`,
    );
  } else if (eventType === "call.permissions_updated") {
    const data = payload as Record<string, unknown>;
    const callCid = data.call_cid as string | undefined;
    const meetingId = extractMeetingIdFromCallCid(callCid);
    console.log(`[permissions_updated][${meetingId || "unknown"}] received`);
  }

  return NextResponse.json({ status: "ok" });
}
