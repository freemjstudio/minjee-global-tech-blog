---
title: "Kotlin Coroutines Under the Hood: Suspension, Continuations, and the Event Loop"
slug: "kotlin-coroutines-under-the-hood"
excerpt: "Everyone uses suspend functions. Few understand what the compiler actually generates."
category: "Backend"
tags: ["kotlin", "coroutines"]
publishedAt: "2026-04-15T09:00:00Z"
viewCount: 2103
likeCount: 89
---

## What Is a Coroutine, Really?

A Kotlin coroutine is not a thread. It is a **suspendable computation**: a block of code that can pause execution, release the underlying thread, and resume later without blocking.

```kotlin
suspend fun fetchUser(id: Long): User {
    delay(100)
    return userRepository.findById(id)
}
```

When the compiler sees `suspend`, it transforms this function using **Continuation-Passing Style**.

## The CPS Transformation

The compiler rewrites your suspend function into something shaped like this:

```kotlin
// What you write
suspend fun fetchUser(id: Long): User

// What the compiler generates, simplified
fun fetchUser(id: Long, continuation: Continuation<User>): Any?
```

The `Continuation<T>` is a callback that knows how to resume execution after suspension. It carries the local state of the coroutine: variables, result, and the current position in the function.

## The State Machine

Every suspend function becomes a state machine with a `label` tracking progress:

```kotlin
fun fetchUser(id: Long, cont: Continuation<User>): Any? {
    val sm = cont as? FetchUserContinuation ?: FetchUserContinuation(id, cont)

    when (sm.label) {
        0 -> {
            sm.label = 1
            val result = delay(100, sm)
            if (result == COROUTINE_SUSPENDED) return COROUTINE_SUSPENDED
        }
        1 -> {
            // resumed after delay
        }
    }
    return userRepository.findById(id)
}
```

This explains why coroutines are cheaper than threads: no OS context switch and no separate stack allocation per coroutine.

## Practical Implications

Understanding the transformation explains why stack traces look unusual, why Java cannot naturally call `suspend`, and why `runBlocking` should be treated carefully.

```kotlin
withContext(Dispatchers.IO) { /* cheap context switch */ }

runBlocking { /* blocks the current thread */ }
```
