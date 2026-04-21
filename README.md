# MeetAI

MeetAI is a full-stack AI meeting platform that runs realtime voice sessions with custom agents, then automatically generates transcript-based summaries and follow-up chat assistants. The project is built with Next.js 16, Stream Video and Chat, OpenAI, Inngest, Better Auth, and Polar for billing.

It supports authenticated workspaces, reusable AI agents, live video sessions, transcript processing, and post-meeting chat on top of the generated summary. We have payment integration with Polar(in sandbox mode in the current configuration) to demonstrate subscription management, but the core meeting assistant features do not require an active subscription to function.

## Deployed URL
[meetai.jeetdas.site](https://meetai.jeetdas.site)

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Directory Layout](#directory-layout)
6. [Local Development](#local-development)
7. [Environment Variables](#environment-variables)
8. [Database](#database)
9. [Event and Processing Flow](#event-and-processing-flow)
10. [Available Scripts](#available-scripts)
11. [Deployment Notes](#deployment-notes)
12. [Troubleshooting](#troubleshooting)

## Overview

The application combines realtime communication and asynchronous AI processing:

- Video calls and webhooks are handled through Stream Video.
- Meeting transcripts are summarized through Inngest + OpenAI.
- Meeting follow-up chat runs through Stream Chat and OpenAI.
- Authentication is provided by Better Auth with social and email/password login.
- Billing integration is provided by Polar.

The codebase follows a modular structure under `src/modules` for feature-specific UI and server logic.

## Core Features

- Authentication with GitHub, Google, and email/password.
- User-scoped AI agents with custom instructions.
- Meeting lifecycle management (`upcoming`, `active`, `processing`, `completed`, `cancelled`).
- Realtime agent participation in Stream calls.
- Automatic transcript retrieval and AI summary generation.
- Post-meeting assistant chat grounded in meeting summaries.
- Subscription flow via Polar checkout/portal integration.

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Radix UI + custom UI components
- TanStack Query
- tRPC

### Backend and Data

- Next.js Route Handlers (API)
- PostgreSQL
- Drizzle ORM + Drizzle Kit
- Better Auth

### AI and Realtime

- OpenAI API
- Stream Video + Stream realtime OpenAI bridge
- Stream Chat
- Inngest for background workflow orchestration

### Billing

- Polar (sandbox mode in current configuration)

## Architecture

Primary runtime boundaries:

- App routes and server rendering: `src/app`
- API endpoints: `src/app/api`
- Domain modules (feature slices): `src/modules`
- Data layer: `src/db`
- Realtime and service clients: `src/lib`
- Background jobs: `src/inngest`
- RPC layer: `src/trpc`

High-level interaction sequence:

1. A user creates and starts a meeting tied to an AI agent.
2. Stream Video emits lifecycle webhooks to `/api/webhook`.
3. The webhook handler updates meeting state, starts realtime assistant behavior, and stores transcript/recording URLs.
4. When transcript is ready, an Inngest event triggers summary generation.
5. The summary is stored in the `meetings` table and used later by chat follow-up flows.

## Directory Layout

```text
.
|- src/
|  |- app/                 # App Router layouts, pages, API route handlers
|  |- components/          # Shared UI and reusable controls
|  |- db/                  # Drizzle client and schema definitions
|  |- inngest/             # Inngest client and background functions
|  |- lib/                 # Service clients (auth, Stream, Polar, utilities)
|  |- modules/             # Feature-oriented domain modules
|  |- trpc/                # tRPC server/client wiring and routers
|  |- hooks/               # Shared React hooks
|  |- constants/           # Shared constants
|  |- types/               # Shared types
|- drizzle.config.ts       # Drizzle Kit configuration
|- auth-schema.ts          # Auth-related schema subset
|- package.json
```

## Local Development

### 1. Prerequisites

- Node.js 20+
- npm 10+ (or compatible package manager)
- PostgreSQL database
- Stream Video + Stream Chat apps/keys
- OpenAI API key
- Polar account and access token
- OAuth app credentials for GitHub and Google

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment

Create `.env.local` in the project root and set the values listed in [Environment Variables](#environment-variables).

### 4. Apply Database Schema

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.

### 6. Optional Local Services

Run Inngest local dev server:

```bash
npm run dev:inngest
```

Expose local webhook endpoint with ngrok (script currently includes a fixed public URL):

```bash
npm run dev:webhook
```

If you use a different ngrok setup, update the script in `package.json` accordingly.

## Environment Variables

The project reads environment variables directly via `process.env`.

### Application and Database

- `DATABASE_URL`: PostgreSQL connection string used by Drizzle.
- `NEXT_PUBLIC_APP_URL`: Public base URL used by server-side tRPC URL resolution (defaults to `http://localhost:3000`).

### Authentication

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### OpenAI

- `OPENAI_API_KEY`

### Stream Video

- `NEXT_PUBLIC_STREAM_VIDEO_API_KEY`
- `STREAM_VIDEO_SECRET_KEY`

### Stream Chat

- `NEXT_PUBLIC_STREAM_CHAT_API_KEY`
- `STREAM_CHAT_SECRET_KEY`

### Polar

- `POLAR_ACCESS_TOKEN`

## Database

Main schema is defined in `src/db/schema.ts`.

Primary domain tables:

- `agents`: AI assistant definitions created by users.
- `meetings`: Meeting records, lifecycle status, transcript URL, recording URL, and summary.

Auth-related tables:

- `user`
- `session`
- `account`
- `verification`

Meeting statuses are modeled with Postgres enum `meeting_status`:

- `upcoming`
- `active`
- `completed`
- `processing`
- `cancelled`

## Event and Processing Flow

### Stream webhook endpoint

Path: `/api/webhook`

Handled events include:

- `call.session_started`
- `call.session_participant_left`
- `call.session_ended`
- `call.transcription_ready`
- `call.recording_ready`
- `message.new`

Behavior summary:

- Validates webhook signatures with Stream SDK.
- Moves meetings through lifecycle states.
- Connects realtime assistant for active calls.
- Stores transcript and recording URLs.
- Emits `meetings/processing` to Inngest when transcript is available.
- Responds in Stream Chat for completed meetings using meeting summary context.

### Inngest processing

Route: `/api/inngest`

Current function: `meetings/processing`

Pipeline:

1. Fetch JSONL transcript.
2. Parse transcript items.
3. Resolve speaker names from users and agents.
4. Generate a structured summary with OpenAI.
5. Persist summary and set meeting status to `completed`.

## Available Scripts

- `npm run dev`: Start Next.js dev server.
- `npm run build`: Build production artifacts.
- `npm run start`: Run production server.
- `npm run lint`: Run ESLint.
- `npm run db:push`: Push Drizzle schema to database.
- `npm run db:studio`: Open Drizzle Studio.
- `npm run dev:webhook`: Start ngrok tunnel using configured URL.
- `npm run dev:inngest`: Start Inngest local dev process.

## Deployment Notes

- Set all environment variables in your hosting provider.
- Ensure webhook URLs (Stream and other providers) point to deployed `/api/webhook`.
- Ensure Inngest endpoint is reachable at deployed `/api/inngest`.
- Run `npm run build` during CI and `npm run db:push` as part of migration strategy when appropriate.

## Troubleshooting

- If DB connection fails, verify `DATABASE_URL` and network access from your runtime.
- If OAuth login fails, verify callback URLs and provider credentials.
- If call assistant does not join, verify Stream API and secret keys and webhook delivery.
- If summaries are not generated, verify Inngest dev/prod setup and `OPENAI_API_KEY`.
- If post-meeting chat does not respond, verify Stream Chat credentials and meeting status is `completed`.

Built with ❤️ by Jeet Das.
