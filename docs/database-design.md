# StackSphere Database Design

This document details the MongoDB schemas and relationships designed for the StackSphere platform. We use Mongoose to define and enforce these collections.

---

## 1. Collections & Schemas

### 1.1 User Collection (`users`)
Tracks profiles, auth data, subscription tier, and reward points.
* `_id`: ObjectId
* `name`: String (Required)
* `email`: String (Required, Unique)
* `password`: String (Required, Hashed)
* `phoneNumber`: String
* `friends`: [ObjectId] (Ref: `users` - list of accepted friend IDs)
* `points`: Number (Default: 0)
* `subscription`: {
  * `plan`: String ("Free", "Bronze", "Silver", "Gold" - Default: "Free")
  * `paymentStatus`: String ("pending", "active", "expired" - Default: "active")
  * `startDate`: Date
  * `expiryDate`: Date
* }

### 1.2 Post Collection (`posts`)
Stores feed posts created within the Social Space.
* `_id`: ObjectId
* `author`: ObjectId (Ref: `users`, Required)
* `content`: String (Required)
* `mediaUrl`: String (Optional)
* `mediaType`: String ("image" | "video" | "none", Default: "none")
* `likes`: [ObjectId] (Ref: `users` - list of users who liked the post)
* `commentsCount`: Number (Default: 0)
* `sharesCount`: Number (Default: 0)
* `createdAt`: Date (Default: Date.now)

### 1.3 Comment Collection (`comments`)
Stores replies to social feed posts.
* `_id`: ObjectId
* `postId`: ObjectId (Ref: `posts`, Required)
* `author`: ObjectId (Ref: `users`, Required)
* `content`: String (Required)
* `createdAt`: Date (Default: Date.now)

### 1.4 Transaction Collection (`transactions`)
Stores transaction and invoice details for payments.
* `_id`: ObjectId
* `userId`: ObjectId (Ref: `users`, Required)
* `amount`: Number (Required)
* `currency`: String (Default: "INR")
* `paymentId`: String (Stripe/Razorpay transaction ID, Required)
* `planName`: String ("Bronze" | "Silver" | "Gold", Required)
* `status`: String ("success" | "failed", Required)
* `invoiceUrl`: String (Generated PDF invoice URL)
* `createdAt`: Date (Default: Date.now)

### 1.5 LoginHistory Collection (`login_histories`)
Logs access information for security transparency.
* `_id`: ObjectId
* `userId`: ObjectId (Ref: `users`, Required)
* `browser`: String (Required)
* `os`: String (Required)
* `device`: String (Required - "mobile" | "tablet" | "desktop")
* `ipAddress`: String (Required)
* `loginAt`: Date (Default: Date.now)

---

## 2. Key Database Relationships

```text
  ┌───────┐             ┌───────┐
  │ User  │ 1 ────────* │ Post  │
  └───────┘             └───────┘
    1   1                 1   *
    │   │                 │   │
    │   └────*            │   └────*
    │        │            │        │
    ▼        ▼            ▼        ▼
┌───────┐ ┌────────┐  ┌───────┐┌─────────┐
│History│ │Transact│  │Comment││  Likes  │
└───────┘ └────────┘  └───────┘└─────────┘
```
