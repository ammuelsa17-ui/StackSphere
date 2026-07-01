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

### 2.4 Create Post Comment
* **Endpoint:** `POST /api/comments/create`
* **Purpose:** Publish a reply to a post.
* **Headers:** Required NextAuth session cookies.
* **Request Body:**
  ```json
  {
    "postId": "postId",
    "content": "This is a comment!"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "comment": {
      "id": "commentId",
      "postId": "postId",
      "content": "This is a comment!",
      "author": {
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "avatarUrl": "",
        "subscription": {
          "plan": "Gold"
        }
      },
      "createdAt": "2026-06-25T12:00:00.000Z"
    }
  }
  ```
* **Error Cases:**
  * `401 Unauthorized`: Session missing or expired.
  * `400 Bad Request`: Empty content or missing Post ID.
  * `404 Not Found`: Target post could not be found.

### 2.5 Retrieve Post Comments
* **Endpoint:** `GET /api/comments`
* **Purpose:** Retrieve all comments for a post in chronological order (oldest first).
* **Headers:** Required NextAuth session cookies.
* **Query Parameters:**
  - `postId`: The post ID to load comments for (Required)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "comments": [
      {
        "id": "commentId",
        "postId": "postId",
        "content": "This is a comment!",
        "author": {
          "name": "Sarah Connor",
          "email": "sarah@example.com",
          "avatarUrl": "",
          "subscription": {
            "plan": "Gold"
          }
        },
        "createdAt": "2026-06-25T12:00:00.000Z"
      }
    ]
  }
  ```
* **Error Cases:**
  * `401 Unauthorized`: Session missing or expired.
  * `400 Bad Request`: postId query parameter missing.

### 2.6 Share Social Post
* **Endpoint:** `POST /api/posts/share`
* **Purpose:** Increment the share count statistics when a post is shared.
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
    "sharesCount": 1
  }
  ```
* **Error Cases:**
  * `401 Unauthorized`: Session missing or expired.
  * `400 Bad Request`: Post ID is missing.
  * `404 Not Found`: Post could not be found.

## 3. Friends & Social Connection APIs

### 3.1 Search Members
* **Endpoint:** `GET /api/users/search`
* **Purpose:** Find platform members by name/email and check connection relationships.
* **Headers:** Required NextAuth session cookies.
* **Query Parameters:**
  - `q`: Search keyword query (string, required)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "users": [
      {
        "id": "userId",
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "avatarUrl": "",
        "subscription": {
          "plan": "Gold"
        },
        "relationship": "none",
        "requestId": ""
      }
    ]
  }
  ```

### 3.2 Send Friend Request
* **Endpoint:** `POST /api/friends/request`
* **Purpose:** Send a pending friend invitation to another user.
* **Headers:** Required NextAuth session cookies.
* **Request Body:**
  ```json
  {
    "receiverId": "receiverUserId"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Friend request sent successfully.",
    "request": {
      "id": "requestId",
      "sender": "senderUserId",
      "receiver": "receiverUserId",
      "status": "pending"
    }
  }
  ```
* **Error Cases:**
  * `400 Bad Request`: Self requests, duplicate requests, or already friends.
  * `404 Not Found`: Target user does not exist.

### 3.3 Respond to Friend Request
* **Endpoint:** `POST /api/friends/request/respond`
* **Purpose:** Accept or reject a pending incoming invitation.
* **Headers:** Required NextAuth session cookies.
* **Request Body:**
  ```json
  {
    "requestId": "requestId",
    "action": "accept"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Friend request accepted successfully.",
    "status": "accepted"
  }
  ```

### 3.4 Retrieve Friends or Requests List
* **Endpoint:** `GET /api/friends`
* **Purpose:** Load active friends or incoming pending invites.
* **Headers:** Required NextAuth session cookies.
* **Query Parameters:**
  - `type`: Either `"list"` (default, accepted friends) or `"requests"` (pending requests)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "friends": [
      {
        "id": "friendUserId",
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "avatarUrl": "",
        "subscription": {
          "plan": "Gold"
        }
      }
    ]
  }
  ```

### 3.5 Remove Mutual Connection
* **Endpoint:** `DELETE /api/friends`
* **Purpose:** Break friendship bond mutually between two accounts.
* **Headers:** Required NextAuth session cookies.
* **Request Body:**
  ```json
  {
    "friendId": "friendUserId"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Friend removed successfully."
  }
  ```





