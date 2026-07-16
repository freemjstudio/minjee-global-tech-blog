# Minjee Global Tech Blog

Personal developer website built with React, Vite, Tailwind CSS, Markdown content, and optional Supabase-powered post stats.

## Writing Flow

```text
Obsidian
↓
Markdown
↓
Git
↓
Deploy
```

Write posts in `content/posts/*.md`.

## Post Frontmatter

```md
---
title: "Outbox Pattern"
slug: "outbox-pattern"
excerpt: "A short summary shown in lists."
category: "Distributed Systems"
tags: ["kafka", "spring-boot"]
publishedAt: "2026-07-16T09:00:00Z"
viewCount: 0
likeCount: 0
---
```

`publishedAt` controls the displayed date and sort order.

## Dynamic Views and Likes

Posts are Markdown/Git based. Views and likes can be stored dynamically in Supabase.

1. Create a Supabase project.
2. Run `supabase/post_stats.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Fill in:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Without these env vars, the site falls back to `viewCount` and `likeCount` from Markdown frontmatter.

Likes are limited per browser with `localStorage`. Views are counted once per browser tab session with `sessionStorage`.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Vercel

- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
