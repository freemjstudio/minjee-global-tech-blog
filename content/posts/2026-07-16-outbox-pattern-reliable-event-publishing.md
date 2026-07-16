---
title: "Outbox Pattern for Reliable Event Publishing"
slug: "outbox-pattern-reliable-event-publishing"
excerpt: "A practical note on keeping database writes and Kafka event publishing consistent."
category: "Distributed Systems"
tags: ["kafka", "spring-boot", "transaction", "architecture"]
related: ["beyond-dead-letter-queues"]
publishedAt: "2026-07-16T09:00:00Z"
viewCount: 0
likeCount: 0
---

## The Gap Between Writes and Events

When a service writes data to a database and publishes an event to Kafka, there is a small but important failure window.

The database transaction can commit successfully while event publishing fails. When that happens, other services never hear about a state change that already happened.

## The Outbox Shape

The Outbox Pattern stores the business record and the event record in the same database transaction.

```kotlin
@Transactional
fun createOrder(command: CreateOrderCommand) {
    val order = orderRepository.save(command.toOrder())

    outboxRepository.save(
        OutboxEvent(
            aggregateId = order.id,
            eventType = "OrderCreated",
            payload = objectMapper.writeValueAsString(order),
        ),
    )
}
```

Another worker reads unpublished outbox rows and publishes them to Kafka. If publishing fails, the row remains retryable.

## Why It Connects to DLQ Recovery

A DLQ helps after event handling fails. An outbox helps before event publishing becomes inconsistent.

Together, they make the event lifecycle easier to reason about: write safely, publish retryably, and recover failed consumers deliberately.
