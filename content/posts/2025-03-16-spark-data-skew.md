---
title: "How I Diagnose and Fix Data Skew in Apache Spark"
description: "Understanding why Spark jobs become slow, how to identify data skew, and practical techniques to improve performance."
date: 2025-03-16
slug: spark-data-skew
tags:
  - Apache Spark
  - Data Engineering
  - Performance
  - Distributed Systems
published: true
---

# How I Diagnose and Fix Data Skew in Apache Spark

One of the most common reasons a Spark job becomes unexpectedly slow is **data skew**.

Everything starts normally.

Most tasks finish within a few seconds.

Then one task keeps running while every other executor sits idle.

If you've ever seen a Spark stage stuck at **99%**, there's a good chance data skew is the reason.

In this article, I'll explain what data skew is, why it happens, and the techniques I commonly use to reduce its impact.

---

# What Is Data Skew?

Spark processes data in parallel by splitting it into **partitions**.

Ideally, each partition contains a similar amount of work.

Data skew occurs when a disproportionate amount of data ends up in a single partition or when one key dominates operations such as:

- Join
- Group By
- Aggregation

Instead of all executors sharing the workload evenly, one executor receives significantly more data than the others.

That executor becomes the bottleneck for the entire stage.

---

# Why Data Skew Matters

Data skew affects much more than execution time.

### Out of Memory (OOM)

A skewed partition may become so large that a single executor cannot process it within its available JVM heap.

When this happens, the Spark application may fail with an OutOfMemoryError.

### Slow Spark Jobs

Spark cannot move to the next stage until every task finishes.

Even if 199 tasks complete quickly, one skewed task can delay the entire application.

### Disk Spilling

Spark prefers to keep intermediate data in memory.

If memory becomes insufficient, Spark spills data to disk.

Disk I/O is significantly slower than memory access, which further increases execution time.

---

# Why Data Skew Happens

Data skew usually comes from one of three causes.

## Uneven Data Distribution

Real-world datasets are rarely evenly distributed.

Some users, products, or regions naturally contain far more records than others.

This imbalance often exists before Spark even starts processing the data.

---

## Shuffle Operations

Operations such as:

- Join
- Group By
- Aggregation

require a shuffle.

If one key appears much more frequently than others, Spark sends a disproportionate amount of data to the same partition.

---

## Default Partitioning

Spark uses hash partitioning by default.

Although hash partitioning works well in many situations, it cannot guarantee perfectly balanced partitions when the underlying data itself is skewed.

---

# How I Detect Data Skew

Before optimizing anything, I first verify whether skew actually exists.

## 1. Check the Key Distribution

A simple aggregation usually reveals whether one key dominates the dataset.

```python
from pyspark.sql.functions import count, col

df.groupBy("skewed_column") \
    .agg(count("*").alias("count")) \
    .orderBy(col("count").desc()) \
    .show()
```

Example:

```
+--------------+------+
|skewed_column |count |
+--------------+------+
|A             |5     |
|B             |1     |
|C             |1     |
|D             |1     |
|E             |1     |
+--------------+------+
```

If one value appears significantly more often than others, there's a high chance it will create skew during shuffle operations.

---

## 2. Check Partition Sizes

I also inspect how data is distributed across partitions.

```python
df = df.repartition(4, "skewed_column")

df.rdd \
    .mapPartitions(lambda p: [len(list(p))]) \
    .collect()
```

Example:

```
[1, 1, 1, 5]
```

One partition clearly contains much more work than the others.

---

# Techniques I Use to Handle Data Skew

There isn't a single solution that works for every workload.

The appropriate optimization depends on why the skew occurs.

---

## 1. Adaptive Query Execution (AQE)

Since Spark 3.x, Adaptive Query Execution has become one of the easiest ways to reduce skew.

```python
spark.conf.set("spark.sql.adaptive.enabled", True)
```

AQE dynamically optimizes execution after shuffle stages complete.

Some of its most useful features include:

- Skew Join Optimization
- Dynamic Partition Coalescing
- Runtime Query Optimization

In many workloads, simply enabling AQE significantly improves performance without requiring code changes.

---

## 2. Repartitioning

Sometimes the default partitioning strategy simply isn't appropriate.

In those cases, repartitioning the DataFrame using a more evenly distributed column helps balance the workload.

```python
df = df.repartition(100, "column_a")
```

Choosing a column with good cardinality usually produces much better partition balance.

---

## 3. Salting

When a single join key dominates the dataset, repartitioning alone isn't enough.

A common technique is **salting**.

The idea is to add an additional column containing randomly distributed values, allowing Spark to spread records with the same key across multiple partitions.

```python
from pyspark.sql.functions import monotonically_increasing_id

def add_salt(df, salt_range=10):
    return df.withColumn(
        "salt",
        monotonically_increasing_id() % salt_range
    )

fact_df = add_salt(fact_df)
dim_df = add_salt(dim_df)

joined = fact_df.join(
    dim_df,
    ["join_key", "salt"]
)
```

Although salting increases implementation complexity, it's often one of the most effective solutions for heavily skewed joins.

---

## 4. Broadcast Join

If one side of the join is relatively small, a broadcast join completely avoids shuffle.

```python
from pyspark.sql.functions import broadcast

joined_df = fact_df.join(
    broadcast(dim_df),
    "join_key"
)
```

Spark sends the smaller table to every executor, allowing joins to happen locally instead of redistributing both datasets across the cluster.

Broadcast joins are especially effective for dimension tables.

---

# Final Thoughts

Data skew is one of the most common performance bottlenecks in Apache Spark.

Fortunately, Spark provides several techniques to mitigate it.

In practice, I usually follow this order:

1. Inspect the data distribution.
2. Check partition sizes.
3. Enable AQE.
4. Repartition if necessary.
5. Apply salting for heavily skewed joins.
6. Use broadcast joins whenever possible.

The important lesson isn't memorizing every optimization technique.

It's understanding **why one partition becomes the bottleneck** in the first place.

Once you identify the source of the imbalance, choosing the right optimization becomes much easier.
