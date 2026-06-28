# StackSphere API Documentation

This document logs the endpoints, requests, and response models of the StackSphere platform.

---

## 1. Authentication APIs

### 1.1 User Registration
* **Endpoint:** `POST /api/auth/register`
* **Purpose:** Create a new user account.
* **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully."
  }
  ```
* **Error Cases:**
  * `400 Bad Request`: Validation errors (e.g. email already registered).

### 1.2 User Login
* **Endpoint:** `POST /api/auth/login`
* **Purpose:** Log in and start session.
* **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "userId",
      "email": "jane@example.com",
      "name": "Jane Doe"
    }
  }
  ```
* **Error Cases:**
  * `401 Unauthorized`: Invalid credentials.

### 1.3 Update User Profile
* **Endpoint:** `POST /api/user/update`
* **Purpose:** Update the authenticated user's profile details (Name and Phone Number).
* **Headers:** Required NextAuth session cookies.
* **Request Body:**
  ```json
  {
    "name": "Jane Updated",
    "phoneNumber": "+91 98765 43210"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "message": "Profile updated successfully.",
    "user": {
      "id": "userId",
      "name": "Jane Updated",
      "email": "jane@example.com",
      "phoneNumber": "+91 98765 43210",
      "avatarUrl": ""
    }
  }
  ```
* **Error Cases:**
  * `401 Unauthorized`: Session missing or expired.
  * `400 Bad Request`: Empty name validation failed.

### 1.4 E2E Authentication Test Suite
* **Endpoint:** `GET /api/test-auth`
* **Purpose:** Programmatically runs 12 authentication integration and validation assertions against the MongoDB test database.
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "timestamp": "2026-06-20T15:25:20.117Z",
    "results": [
      {
        "name": "Database Connection",
        "status": "PASS",
        "message": "Successfully connected to MongoDB."
      },
      ...
    ]
  }
  ```

---

## 2. Social APIs

### 2.1 Create Social Post
* **Endpoint:** `POST /api/posts/create`
* **Purpose:** Publish a new post to the social space feed.
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "content": "This is a text post!",
    "mediaUrl": "https://url.com/image.png",
    "mediaType": "image"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "post": {
      "id": "postId",
      "content": "This is a text post!",
      "mediaUrl": "https://url.com/image.png"
    }
  }
  ```
* **Error Cases:**
  * `403 Forbidden`: Friend-based post limit exceeded.

### 2.2 Retrieve Social Posts Feed
* **Endpoint:** `GET /api/posts`
* **Purpose:** Retrieve chronological feed posts with support for pagination.
* **Headers:** Required NextAuth session cookies.
* **Query Parameters:**
  - `page`: Page index (default: `1`)
  - `limit`: Number of posts per page (default: `10`, maximum: `50`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "posts": [
      {
        "id": "postId",
        "content": "This is a text post!",
        "mediaUrl": "https://url.com/image.png",
        "mediaType": "image",
        "author": {
          "name": "Sarah Connor",
          "email": "sarah@example.com",
          "avatarUrl": "",
          "subscription": {
            "plan": "Gold"
          }
        },
        "likes": [],
        "commentsCount": 0,
        "sharesCount": 0,
        "createdAt": "2026-06-25T12:00:00.000Z"
      }
    ]
  }
  ```
* **Error Cases:**
  * `401 Unauthorized`: Session missing or expired.

### 2.3 Like/Unlike Social Post
* **Endpoint:** `POST /api/posts/like`
* **Purpose:** Toggle liking and unliking a social space feed post.
* **Headers:** Required NextAuth session cookies.
* **Request Body:**
  ```json
  {
    "postId": "postId"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "liked": true,
    "likesCount": 1
  }
  ```
* **Error Cases:**
  * `401 Unauthorized`: Session missing or expired.
  * `400 Bad Request`: Post ID is missing.
  * `404 Not Found`: Post could not be found.


