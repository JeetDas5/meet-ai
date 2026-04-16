// src/inngest/functions.ts
import { inngest } from "./client";
import JSONL from "jsonl-parse-stringify";

export const meetingProcessing = inngest.createFunction(
  { id: "meetings/processing", triggers: { event: "meetings/processing" } },
  async ({ event, step }) => {
    const response = await step.fetch(event.data.transcriptUrl);

    const transcript = await step.run("parse-transcript", async () => {
      const text = await response.text();
      return JSONL.parse(text);
    });
  },
);
