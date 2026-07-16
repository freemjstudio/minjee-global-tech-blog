# Content

Use this folder as the local writing source for the blog.

Recommended workflow:

```text
Obsidian
↓
Markdown
↓
Git
↓
Deploy
```

Write posts in `content/posts`.

Each post needs frontmatter:

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

## Start writing here
```

Supported categories:

- Backend
- Distributed Systems
- Data Engineering
- Architecture
- System Design
