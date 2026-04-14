# Markdown

A modern web application for creating and managing documents using Markdown. Built with Next.js, this project provides an intuitive markdown editor with live preview and PDF export capabilities.

## Features

- **Markdown Editor**: Write your documents in Markdown with real-time preview
- **🤖 AI Writing Assistant**: Get intelligent help with writing and improving your content (for logged-in users)
  - Context-aware suggestions based on your document content
  - Quick actions for common tasks
  - Direct text insertion into your document
  - Powered by Cloudflare AI Workers
- **Authentication**: Secure user authentication with NextAuth.js
- **Document Management**: Create, edit, and manage multiple documents
- **PDF Export**: Convert your markdown documents to PDF format
- **Modern UI**: Clean and responsive interface built with React and Tailwind CSS
- **Theme Support**: Light and dark mode theme toggle
- **Database Integration**: Persistent storage with Drizzle ORM

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) with App Router
- **Authentication**: NextAuth.js
- **Database**: Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Yarn, npm, pnpm, or Bun package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
yarn install
# or
npm install
# or
pnpm install
# or
bun install
```

3. Set up your environment variables

### Environment Configuration

#### Development Environment

Copy the example environment file to `.dev.vars`:

```bash
cp .env.example .dev.vars
```

Then update the values in `.dev.vars` with your development credentials.

#### Production Environment

1. Copy the example environment file to `.env`:

```bash
cp .env.example .env
```

2. Update the values in `.env` with your production credentials.

3. Upload the environment variables to Cloudflare:

```bash
wrangler secret bulk .env
```

### Database Migration

#### Local Development Migration

Run these 4 steps to set up your local database:

1. **Create a local D1 database**

```bash
npx wrangler d1 create markdown-pro
```

2. **Update your `wrangler.jsonc` with the database ID**

3. **Generate migration files** (if you've made schema changes)

```bash
yarn db:generate
```

4. **Apply migrations to your local database**

```bash
yarn db:migrate:local
```

#### Production Migration

Run these 4 steps to set up your production database:

1. **Create a production D1 database**

```bash
npx wrangler d1 create markdown-pro
```

2. **Update your `wrangler.jsonc` with the database ID**

3. **Generate migration files** (if you've made schema changes)

```bash
yarn db:generate
```

4. **Apply migrations to your remote database**

```bash
yarn db:migrate:remote
```

### Development

Run the development server:

```bash
yarn dev
# or
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - Reusable React components
- `/src/database` - Database schema and migrations
- `/src/lib` - Utility functions and helpers
- `/src/services` - Business logic and service layer
- `/src/types` - TypeScript type definitions

## AI Chatbox Feature

This application includes an AI-powered chatbox to assist users with writing. The AI assistant appears as a floating button in the editor and provides:

- Intelligent suggestions for improving content
- Help with writing professional documents
- Grammar and tone improvements
- Format and structure recommendations

### Setup AI Feature

The AI feature is automatically enabled when you deploy to Cloudflare. It uses Cloudflare AI Workers (Llama 3.1 8B model) which offers:

- 10,000 free requests per day
- Low latency edge inference
- No additional API keys required

For detailed information about the AI chatbox system, see:

- [AI_CHATBOX_GUIDE.md](./AI_CHATBOX_GUIDE.md) - Comprehensive setup and usage guide
- [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md) - System architecture and data flow
- [AI_UI_DESIGN.md](./AI_UI_DESIGN.md) - UI design specifications

## Deployment

This application is configured for deployment on [Cloudflare Pages](https://pages.cloudflare.com) with Cloudflare D1 database. Deployment to other platforms is not currently supported.
