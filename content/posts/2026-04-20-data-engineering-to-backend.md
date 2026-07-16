---
title: "Why I Moved from Data Engineering to Backend — and What I Took With Me"
slug: "data-engineering-to-backend"
excerpt: "Two years of wrangling Spark jobs and building ETL pipelines taught me more about distributed systems than any backend course."
category: "Backend"
tags: ["kotlin", "data-pipeline"]
publishedAt: "2026-04-20T09:00:00Z"
viewCount: 1284
likeCount: 47
---

## Why Data Engineering Changes How You Think About Systems

When I joined my first company as a data engineer, I expected to spend most of my time writing SQL. I ended up spending most of my time thinking about **fault tolerance**, **idempotency**, and **backpressure**.

These aren't data problems. They're distributed systems problems. And that's exactly why a background in data engineering translates so cleanly into backend work.

> Reliable systems are usually built from ordinary decisions made consistently: retries with limits, writes that can be replayed, and logs that tell the truth.

<div class="callout">
The useful question is not "Will this fail?" but "What state will the system be in after it fails, and can we explain it quickly?"
</div>

## The Mental Model Shift

Backend engineers think about individual requests. Data engineers think about **batches of millions of records** — and what happens when 0.01% of them are malformed, or when the upstream system sends duplicates, or when your job fails halfway through.

```python
# This looks simple but hides failure modes most backend devs don't think about
def process_partition(records):
    for record in records:
        result = transform(record)
        write_to_sink(result)  # What if this fails on record 500,000?
```

The answer isn't to wrap everything in a try-catch. The answer is to make your writes **idempotent** so rerunning from any checkpoint gives the same result.

## What Transfers Directly

**Thinking in terms of throughput, not latency**

Data pipelines care about throughput: how many records per second can you process? Backend APIs care about latency: how fast does a single request return?

Large-scale backend systems care about both. If you've ever tuned Spark executors and partitions, optimizing a connection pool or a bulk insert comes naturally.

**Schema evolution discipline**

Data engineers live and die by schema compatibility. You can't just add a `NOT NULL` column to a table with 500 million rows. You think in terms of backward-compatible changes before anyone asks you to.

**Observability as a first principle**

When a Spark job fails, you have logs across 50 executor nodes. You learn quickly to emit structured metrics everywhere, because you can't attach a debugger to a distributed job.

```kotlin
logger.info("Processing order",
    mapOf("orderId" to order.id, "userId" to order.userId, "amount" to order.amount)
)
```

## What Doesn't Transfer

Data pipelines are stateless at the job level. Backend APIs carry auth context, rate limits, user state, and much sharper consistency expectations.

I spent my first month in backend consistently over-engineering bulk operations and under-engineering single-record edge cases. Old habits.

## The Intersection Is Where It Gets Interesting

The most interesting backend problems sit at the intersection of the two worlds:

- APIs that serve ML predictions while ingesting training data in batch
- Event-driven architectures where Kafka supports both analytics and transactional flows
- PostgreSQL queries over partitioned tables that hold years of time-series data

If you're a backend engineer who has never touched data engineering, learn it. If you're a data engineer considering backend, the mental models compound.
