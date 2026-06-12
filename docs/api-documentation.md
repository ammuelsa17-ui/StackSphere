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
