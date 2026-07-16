---
title: "PostgreSQL Query Planner: Reading EXPLAIN ANALYZE Like a Pro"
slug: "postgresql-explain-analyze"
excerpt: "EXPLAIN ANALYZE becomes less intimidating once you know which numbers tell the story."
category: "System Design"
tags: ["postgresql"]
publishedAt: "2026-03-17T09:00:00Z"
viewCount: 1654
likeCount: 61
---

## Why Query Plans Matter

Slow queries often hide behind simple SQL. The planner may choose a sequential scan, an expensive join order, or a sort that spills to disk.

`EXPLAIN ANALYZE` shows both the plan and what actually happened.

## Start With Actual Time

Look at actual time, rows, and loops. Estimated cost matters, but the difference between estimated rows and actual rows usually tells the more interesting story.

```sql
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE user_id = 42
ORDER BY created_at DESC;
```

## Common Signals

- Sequential scan on a large table
- Misestimated row count
- Nested loop over too many rows
- Sort spilling to disk
- Missing composite index

## A Practical Habit

Read plans from the most expensive node outward. Then ask what assumption the planner made and whether your schema, index, or query shape helped it make that assumption.
