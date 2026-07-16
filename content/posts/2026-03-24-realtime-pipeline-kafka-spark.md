---
title: "Designing a Real-Time Data Pipeline with Kafka and Spark Streaming"
slug: "realtime-pipeline-kafka-spark"
excerpt: "A walkthrough of Kafka as the message bus, Spark Structured Streaming as the processor, and the tradeoffs in between."
category: "Distributed Systems"
tags: ["kafka", "spark", "data-pipeline"]
publishedAt: "2026-03-24T09:00:00Z"
viewCount: 2567
likeCount: 98
---

## Why Real-Time Pipelines Are Hard

Streaming systems are not just batch jobs that run faster. They introduce ordering, replay, backpressure, schema evolution, and operational recovery.

Kafka gives you a durable log. Spark Structured Streaming gives you a processing model. The architecture comes from how you connect the two.

## A Simple Shape

```text
source systems
  -> Kafka topics
  -> Spark Structured Streaming
  -> storage / serving layer
```

This shape is easy to draw and harder to operate.

## Production Questions

- What happens when a consumer falls behind?
- How do you replay a bad deploy?
- Where do malformed records go?
- Who owns schema compatibility?

## The Useful Mental Model

Treat every stream as a contract. If a downstream service cannot trust the shape, timing, or replay behavior of events, the pipeline will eventually become a debugging tax.
