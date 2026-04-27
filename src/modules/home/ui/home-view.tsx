"use client";

import Link from "next/link";
import {
  BotIcon,
  VideoIcon,
  ZapIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  RocketIcon,
  PlayCircleIcon,
  MicIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GeneratedAvatar } from "@/components/generated-avatar";
import {
  MAX_FREE_AGENTS,
  MAX_FREE_MEETINGS,
} from "@/modules/premium/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface QuickActionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: string;
  iconColor: string;
}

const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  href,
  cta,
  accent,
  iconColor,
}: QuickActionProps) => (
  <Link
    href={href}
    className="group relative bg-white rounded-xl border border-border/60 p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    <div
      className={cn(
        "size-12 rounded-xl flex items-center justify-center",
        accent
      )}
    >
      <Icon className={cn("size-6", iconColor)} />
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="font-semibold text-base">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all duration-200">
      {cta}
      <ArrowRightIcon className="size-3.5" />
    </span>
  </Link>
);

interface FeatureProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureProps) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-border/50 hover:border-primary/20 transition-colors duration-200">
    <div className="size-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
      <Icon className="size-4 text-primary" />
    </div>
    <div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const StatTile = ({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: StatProps) => (
  <div className="bg-white rounded-xl border border-border/60 p-5 flex items-center gap-4">
    <div
      className={cn(
        "size-11 rounded-xl flex items-center justify-center shrink-0",
        iconBg
      )}
    >
      <Icon className={cn("size-5", iconColor)} />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground truncate">{label}</p>
      {sub && (
        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>
      )}
    </div>
  </div>
);

export const HomeView = () => {
  const { data: session } = authClient.useSession();
  const trpc = useTRPC();
  const { data: usage } = useQuery(trpc.premium.getFreeUsage.queryOptions());

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const agentUsagePct = usage ? (usage.agentCount / MAX_FREE_AGENTS) * 100 : 0;
  const meetingUsagePct = usage
    ? (usage.meetingCount / MAX_FREE_MEETINGS) * 100
    : 0;

  return (
    <div className="flex-1 overflow-y-auto pb-10">
      <div className="relative overflow-hidden bg-linear-to-br/oklch from-[oklch(0.2_0.0283_174.92)] via-[oklch(0.27_0.055_165)] to-[oklch(0.34_0.0601_171.21)] px-6 md:px-10 py-10 rounded-xs">
        <div className="pointer-events-none absolute -top-16 -right-20 size-72 rounded-full bg-primary/15 blur-3xl opacity-60" />
        <div className="pointer-events-none absolute bottom-0 left-40 size-48 rounded-full bg-emerald-400/10 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={48}
                height={48}
                className="rounded-full ring-2 ring-white/20 shrink-0"
              />
            ) : (
              <GeneratedAvatar
                seed={session?.user?.name ?? "User"}
                variant="initials"
                className="size-14 ring-2 ring-white/20 shrink-0"
              />
            )}
            <div>
              <p className="text-white/60 text-sm font-medium">Welcome back</p>
              <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight mt-0.5">
                Hey, {firstName}
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Your AI-powered meeting workspace is ready.
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              asChild
              size="sm"
              className="bg-white text-[oklch(0.2_0.0283_174.92)] hover:bg-white/90 font-semibold shadow"
            >
              <Link href="/meetings">
                <PlusIcon className="size-4" />
                New Meeting
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
            >
              <Link href="/agents">
                <BotIcon className="size-4" />
                Manage Agents
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 mt-8 flex flex-col gap-8">
        {usage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              label="Meetings created"
              value={usage.meetingCount}
              sub={`of ${MAX_FREE_MEETINGS} free`}
              icon={VideoIcon}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatTile
              label="Agents configured"
              value={usage.agentCount}
              sub={`of ${MAX_FREE_AGENTS} free`}
              icon={BotIcon}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
            />
            <StatTile
              label="Plan"
              value="Free Trial"
              sub="Upgrade for unlimited"
              icon={RocketIcon}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />
            <StatTile
              label="AI powered"
              value="Always on"
              icon={SparklesIcon}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
          </div>
        )}

        <section>
          <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              icon={VideoIcon}
              title="Schedule a Meeting"
              description="Set up a new AI-assisted meeting and invite participants to collaborate in real-time."
              href="/meetings"
              cta="Go to Meetings"
              accent="bg-blue-50"
              iconColor="text-blue-600"
            />
            <QuickActionCard
              icon={BotIcon}
              title="Configure an Agent"
              description="Create or manage your AI agents - define their personas and instructions for your calls."
              href="/agents"
              cta="Go to Agents"
              accent="bg-violet-50"
              iconColor="text-violet-600"
            />
            <QuickActionCard
              icon={RocketIcon}
              title="Upgrade Your Plan"
              description="Unlock unlimited meetings, agents, and premium AI features for your team."
              href="/upgrade"
              cta="View Plans"
              accent="bg-amber-50"
              iconColor="text-amber-600"
            />
          </div>
        </section>

        {usage && (
          <section className="bg-white rounded-xl border border-border/60 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <RocketIcon className="size-4 text-primary" />
                <h2 className="font-semibold text-sm">Free Trial Usage</h2>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-8 text-xs"
              >
                <Link href="/upgrade">Upgrade</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <BotIcon className="size-3.5 text-violet-500" />
                    <span className="text-muted-foreground">Agents</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-0 h-5",
                      agentUsagePct >= 100
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-violet-50 text-violet-700 border-violet-200"
                    )}
                  >
                    {usage.agentCount} / {MAX_FREE_AGENTS}
                  </Badge>
                </div>
                <Progress
                  value={agentUsagePct}
                  className="h-2 [&>div]:bg-violet-500"
                />
                {agentUsagePct >= 100 && (
                  <p className="text-[11px] text-rose-500">
                    Agent limit reached — upgrade to add more.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <VideoIcon className="size-3.5 text-blue-500" />
                    <span className="text-muted-foreground">Meetings</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-0 h-5",
                      meetingUsagePct >= 100
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    )}
                  >
                    {usage.meetingCount} / {MAX_FREE_MEETINGS}
                  </Badge>
                </div>
                <Progress
                  value={meetingUsagePct}
                  className="h-2 [&>div]:bg-blue-500"
                />
                {meetingUsagePct >= 100 && (
                  <p className="text-[11px] text-rose-500">
                    Meeting limit reached — upgrade to continue.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-base font-semibold mb-4">What Meet.AI Can Do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FeatureCard
              icon={MicIcon}
              title="Live AI Agent"
              description="An AI agent joins your call, listens, and responds to participants in real-time - just like a human."
            />
            <FeatureCard
              icon={SparklesIcon}
              title="Auto Summaries"
              description="Every completed meeting is automatically summarised so you never lose track of key decisions."
            />
            <FeatureCard
              icon={ClockIcon}
              title="Full Transcripts"
              description="Word-for-word transcripts are generated after every meeting for easy reference."
            />
            <FeatureCard
              icon={PlayCircleIcon}
              title="Meeting Recordings"
              description="Cloud recordings are attached to each completed meeting so you can replay any moment."
            />
            <FeatureCard
              icon={UsersIcon}
              title="Post Meet Chat"
              description="Chat with your AI agent after the meeting to get more insights and information."
            />
            <FeatureCard
              icon={ShieldCheckIcon}
              title="Secure & Private"
              description="All sessions are authenticated and your data is never shared with third parties."
            />
          </div>
        </section>

        <section className="relative overflow-hidden rounded-xl bg-linear-to-r/oklch from-[oklch(0.55_0.14_149)] to-[oklch(0.45_0.12_165)] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full bg-white/5 blur-2xl" />
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
              <ZapIcon className="size-4 text-yellow-300" />
              <span className="text-sm font-medium text-white/80">
                Get started in seconds
              </span>
            </div>
            <h3 className="text-xl font-bold">
              Ready to run your first AI meeting?
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Create an agent, schedule a meeting, and let AI do the rest.
            </p>
          </div>
          <div className="flex gap-3 shrink-0 flex-wrap">
            <Button
              asChild
              size="default"
              className="bg-white text-[oklch(0.25_0.08_155)] hover:bg-white/90 font-semibold shadow-lg"
            >
              <Link href="/agents">
                <BotIcon className="size-4" />
                Create Agent
              </Link>
            </Button>
            <Button
              asChild
              size="default"
              variant="outline"
              className="border-white/25 text-white hover:bg-white/10 hover:text-white bg-transparent"
            >
              <Link href="/meetings">
                <VideoIcon className="size-4" />
                New Meeting
              </Link>
            </Button>
          </div>
        </section>
      </div>
      <footer className="mt-2">
        <p className="text-center text-sm text-muted-foreground">
          © 2026 Meet.AI. All rights reserved.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Made with ❤️ by{" "}
          <a href="https://github.com/JeetDas5">
            {" "}
            <span className="text-primary">Jeet Das</span>
          </a>
        </p>
      </footer>
    </div>
  );
};
