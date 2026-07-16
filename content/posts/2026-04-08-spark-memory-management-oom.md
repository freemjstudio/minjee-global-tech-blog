---
title: "Apache Spark Memory Management: Why Your Job OOMs and How to Fix It"
slug: "spark-memory-management-oom"
excerpt: "A practical look at Spark memory, execution pressure, and the knobs that actually matter."
category: "Data Engineering"
tags: ["spark", "python"]
publishedAt: "2026-04-08T09:00:00Z"
viewCount: 3412
likeCount: 134
---

## The Shape of Spark Memory

Spark memory issues usually look random from the outside. A job runs fine for days, then suddenly fails on one partition with an executor OOM.

The useful first step is to separate storage memory from execution memory. Caching, shuffles, joins, and aggregations all compete for space.

## Why OOM Happens

Most OOMs come from skew, large shuffles, or collecting too much data onto one executor.

```python
df.groupBy("customer_id").count()
```

This can be harmless or catastrophic depending on data distribution. One hot key can dominate the entire stage.

## What to Tune First

- Check partition sizes before increasing executor memory
- Look for skewed keys
- Avoid wide dependencies where possible
- Cache only when reuse justifies it
- Prefer explicit checkpointing for long lineage

## A Better Debugging Habit

Before tuning knobs, inspect the physical plan and stage metrics. Memory bugs become easier when you can see where data expands.
