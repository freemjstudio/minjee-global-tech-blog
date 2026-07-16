---
title: "A Dead Letter Queue Isn't Recovery"
description: "What I learned after building a Kafka consumer that failed in production."
slug: "kafka-dlq-recovery"
date: "2026-05-31"
tags:
  - Kafka
  - Distributed Systems
  - Event Driven Architecture
  - Backend
---

# A Dead Letter Queue Isn't Recovery

When I first added a Dead Letter Queue (DLQ) to one of our Kafka consumers, I thought the problem was solved.

Failed messages were no longer blocking the consumer, and the rest of the events kept flowing.

Everything looked healthy.

Until I had to recover one of those failed events.

That's when I realized a DLQ doesn't actually recover anything. It only moves the problem somewhere else.

This post is about that realization and how I ended up redesigning our recovery flow.

---

## The first version

The service itself was fairly simple.

A Kafka consumer processed an event, updated the database, and published another event.

During local testing everything worked as expected.

Production was a different story.

Occasionally we saw failures caused by things like:

- temporary database maintenance
- timeouts between internal services
- short network interruptions

When processing failed, the event was sent to a DLQ.

The consumer committed its offset and continued processing the next message.

At first glance, this seemed like the right trade-off.

The rest of the system kept working.

---

## But recovering the event felt... wrong

Our recovery process looked something like this.

An operator would call an internal API.

That API executed the business logic again and published the missing event.

It worked.

But after looking at it more carefully, I wasn't comfortable with the design anymore.

A few questions kept coming back.

- Has this event already been recovered?
- Does the recovery API execute exactly the same logic as the Kafka consumer?
- What happens if someone retries the same event twice?
- Why is recovery using a completely different code path?

The more I thought about it, the more I realized the problem wasn't Kafka.

It was our architecture.

---

## What a DLQ actually gives you

A common misconception is that a DLQ exists to recover failed events.

It doesn't.

A DLQ isolates failures.

That's all.

Imagine a partition where one message always fails because of malformed data.

Without a DLQ, the consumer keeps retrying that single message forever.

Everything behind it is blocked.

With a DLQ, that failed message is moved aside and the consumer continues processing the rest of the partition.

The system stays available.

The failed event still exists.

Nothing has been recovered yet.

---

## Retry first, DLQ later

Not every failure deserves the same treatment.

Some failures are temporary.

A database timeout.

A network hiccup.

An external API returning 503.

Retrying those often works.

Other failures never will.

Missing required fields.

Invalid payloads.

Broken schemas.

Retrying them only wastes time.

In our consumer, transient failures are retried first.

Permanent failures go directly to the DLQ.

---

## The design I actually wanted

After looking at the recovery process, I realized something simple.

Recovering an event shouldn't require different business logic.

It should execute exactly the same code as a normal Kafka consumer.

Instead of calling a dedicated recovery service, the recovery flow simply loads the original event and passes it back into the same event handler.

That means:

- the same validation
- the same business rules
- the same event publishing
- the same error handling

No duplicated logic.

No separate implementation to maintain.

---

## Making replay safe

Of course, replaying events introduces another problem.

Duplicates.

Every event now carries a stable `eventId`.

Before doing any work, the consumer records that identifier in a `processed_event` table.

If the event already exists, processing stops immediately.

The business tables also enforce uniqueness, providing another layer of protection against duplicate side effects.

That means replay becomes something we can do confidently instead of something we avoid.

---

## Recovery becomes boring

The recovery API no longer performs business logic.

Its only responsibility is:

1. Load the failed event.
2. Deserialize it.
3. Pass it into the existing event handler.
4. Mark the recovery as successful.

That's it.

Once both paths share the same handler, there's almost nothing special about recovery anymore.

And that's exactly what I wanted.

---

## What I learned

Looking back, adding a DLQ wasn't the interesting part.

Designing the recovery flow was.

A Dead Letter Queue helps your consumer stay alive.

It doesn't tell you how failed events should come back.

That part is still your responsibility.

For me, the biggest improvement wasn't introducing a DLQ.

It was removing the difference between normal processing and recovery.

Once those two paths became the same, the whole system became much easier to understand, maintain, and trust.