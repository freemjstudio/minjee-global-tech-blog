---
title: "From Async APIs to the Outbox Pattern: Solving the Dual Write Problem"
description: "How a simple event-driven migration service exposed the Dual Write Problem and why we adopted the Outbox Pattern."
slug: "outbox-pattern-dual-write"
date: "2026-04-30"
tags:
  - Kafka
  - Event Driven Architecture
  - Outbox Pattern
  - CDC
  - Distributed Systems
---

# From Async APIs to the Outbox Pattern

When we migrated member data from a legacy system to a new platform, we decided to build the workflow around events.

The idea was straightforward.

When a user agreed to migrate their account, the Member Service published a `MemberMigrated` event.

Everything else happened asynchronously.

It looked like a good fit for an event-driven architecture.

Until we looked more closely at failure scenarios.

---

## The first design

Our initial flow looked like this.

```
MemberMigrated Event

↓

Kafka Consumer

↓

Migration API

↓

202 Accepted

↓

Async Migration

↓

MigrationCompleted Event
```

The consumer called an internal API.

The API immediately returned **202 Accepted**, while the actual migration continued in the background.

The advantages seemed obvious.

- Fast API responses
- Better throughput
- Less blocking
- Asynchronous processing

At the time, it felt like the right design.

---

## The hidden problem

The problem wasn't the API.

It was what happened **after** the API returned.

From Kafka's perspective, receiving a `202 Accepted` meant the event had been processed successfully.

The consumer committed its offset.

But the migration hadn't actually finished yet.

If the asynchronous task failed later, Kafka had no way of knowing.

That introduced several operational problems.

- Failed migrations were difficult to detect.
- Failed events couldn't be replayed automatically.
- The consumer couldn't send them to a Dead Letter Queue because, technically, the message had already succeeded.

The more we looked at it, the more it became clear that the consumer and the actual business outcome were no longer aligned.

---

## Making the migration synchronous

Our first attempt was simple.

Instead of returning immediately, the API performed the migration synchronously.

Only after the migration completed successfully did it publish the next event.

The flow became much easier to reason about.

The Kafka consumer now received a real success or failure instead of a placeholder response.

At first, this looked like the final solution.

It wasn't.

---

## We discovered another problem

Synchronizing the migration exposed a different issue.

Now the service had to perform two independent operations.

1. Save data into the database.
2. Publish an event to Kafka.

Those two systems don't share a transaction.

That means failures can happen between them.

### Scenario 1

```
Database Commit ✅

Kafka Publish ❌
```

The migration succeeded.

Other services never learned about it.

---

### Scenario 2

```
Database Commit ❌

Kafka Publish ✅
```

Other services believed the migration existed.

The database disagreed.

Both situations leave the system in an inconsistent state.

This is commonly known as the **Dual Write Problem**.

Retry logic alone can't solve it because the system has already reached an inconsistent state.

---

## Why we adopted the Outbox Pattern

The Outbox Pattern solves this problem by changing one simple idea.

Instead of publishing events directly to Kafka, the application first writes the event into an **Outbox table** as part of the same database transaction.

That means the migration record and the event are committed together.

Either both succeed.

Or both fail.

Later, another process is responsible for publishing the event to Kafka.

The application no longer needs to coordinate two independent systems inside the same request.

---

## The Outbox table

Our Outbox table stores enough information to reconstruct and publish an event later.

```sql
CREATE TABLE outbox (
    id BIGSERIAL PRIMARY KEY,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'READY',
    created_at TIMESTAMP DEFAULT NOW()
);
```

Each record represents a single event waiting to be published.

The `aggregate_id` also serves as a useful Kafka partition key, preserving ordering for events that belong to the same aggregate.

---

## Polling or CDC?

Once events exist inside the Outbox table, something still needs to publish them.

There are two common approaches.

### Polling

A background worker periodically queries the Outbox table.

After publishing an event, it updates its status.

This approach is simple and doesn't require additional infrastructure.

The downside is increased database traffic and slower event delivery.

---

### Change Data Capture (CDC)

Instead of polling the table, CDC reads the database's transaction log.

For PostgreSQL, that means reading the Write-Ahead Log (WAL).

Whenever a new Outbox record appears, the change is streamed directly into Kafka.

No polling.

No repeated database queries.

Because our infrastructure already included Debezium and Kafka Connect, CDC was the better choice.

It reduced database load while providing near real-time event delivery.

---

## Routing events

Publishing everything into a single Outbox topic wasn't the final step.

Different services care about different events.

After CDC publishes Outbox records, they are routed into domain-specific Kafka topics based on their event type.

For example:

```
Outbox Topic

↓

MemberMigrated

↓

member.migrated

↓

Migration Service
```

This keeps producers simple while allowing consumers to subscribe only to the events they actually need.

---

## What I learned

At first, I thought asynchronous APIs were the difficult part.

They weren't.

The real challenge was guaranteeing consistency between the database and Kafka.

Making the migration synchronous solved one problem.

It also exposed another.

The Outbox Pattern wasn't about making Kafka more reliable.

It was about making the entire workflow consistent.

Looking back, the most valuable lesson wasn't learning how the Outbox Pattern works.

It was understanding **why it exists in the first place**.
