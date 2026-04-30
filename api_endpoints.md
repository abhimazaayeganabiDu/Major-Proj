# Leetlab API

Leetlab is a **LeetCode-like competitive coding platform** that allows users to register, solve coding problems, execute and test code, manage submissions, and organize problems into playlists. This collection covers all available REST API endpoints grouped by feature area.

---

## 🌐 Base URL

All endpoints are relative to:

```
{{baseUrl}}

 ```

Set the `baseUrl` variable in your active environment to point to your server (e.g., `http://localhost:3000`).

---

## 🔐 Authentication

> Endpoints marked **🔒 Auth Required** expect a valid session cookie or bearer token.  
Endpoints marked **🛡️ Admin Only** are restricted to users with an admin role. 
  

---

## 📁 Auth

Handles user registration, login, logout, email verification, password management, and profile updates.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register a new user account. Sends a verification email upon successful registration. |
| `GET` | `/api/v1/auth/verify-email/:token` | Verify a user's email address using the token sent to their email. |
| `POST` | `/api/v1/auth/resend-verify-email` | Resend the email verification link to the user's registered email address. |
| `POST` | `/api/v1/auth/login` | Authenticate a user and start a session. Returns user details on success. |
| `POST` | `/api/v1/auth/reset-password-request` | Request a password reset email. Sends a reset link to the user's email. |
| `POST` | `/api/v1/auth/reset-password/:token` | Reset the user's password using the token received via email. |
| `POST` | `/api/v1/auth/change-password` | 🔒 Change the currently authenticated user's password. |
| `POST` | `/api/v1/auth/change-user-detail` | 🔒 Update the authenticated user's profile details (e.g., name, avatar). |
| `DELETE` | `/api/v1/auth/logout` | 🔒 Log out the current user and invalidate their session. |
| `GET` | `/api/v1/auth/get-my-profile` | 🔒 Retrieve the full profile of the currently authenticated user. |
| `GET` | `/api/v1/auth/check` | 🔒 Check whether the current user is authenticated. Useful for session validation. |

---

## 📁 Problem

Manage coding problems on the platform. Admins can create, update, and delete problems; all authenticated users can browse and retrieve them.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/problem/create-problem` | 🔒 🛡️ Create a new coding problem. Requires admin privileges. |
| `GET` | `/api/v1/problem/get-problem/:id` | 🔒 Retrieve a specific problem by its ID, including description, constraints, and test cases. |
| `GET` | `/api/v1/problem/get-all-problem` | 🔒 Retrieve a list of all available coding problems on the platform. |
| `PUT` | `/api/v1/problem/update-problem/:id` | 🔒 🛡️ Update an existing problem by its ID. Requires admin privileges. |
| `DELETE` | `/api/v1/problem/delete-problem/:id` | 🔒 🛡️ Delete a problem by its ID. Requires admin privileges. |
| `GET` | `/api/v1/problem/get-solved-problem` | 🔒 Get all problems that the currently authenticated user has successfully solved. |

---

## 📁 Execute Code

Submit or test code against a problem's test cases using the code execution engine.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/executeCode/execute-code` | 🔒 Execute code and **submit** it as a solution. Records the submission result against the problem. |
| `POST` | `/api/v1/executeCode/run-code` | 🔒 Run code against test cases **without submitting**. Useful for testing logic before a final submission. |

---

## 📁 Submissions

View and track code submission history for problems.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/submission/get-all-submissions` | 🔒 🛡️ Retrieve all submissions across all users and problems. Requires admin privileges. |
| `GET` | `/api/v1/submission/get-submissions/:problemId` | 🔒 Get all submissions made by the current user for a specific problem. |
| `GET` | `/api/v1/submission/get-submission/:submissionId` | 🔒 Retrieve the details of a specific submission by its ID, including code, result, and runtime. |
| `GET` | `/api/v1/submission/get-submission-count/:problemId` | 🔒 Get the total number of submissions for a specific problem. |

---

## 📁 Playlist

Organize problems into custom playlists for study or practice sessions.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/playlist/` | 🔒 Retrieve all playlists created by the currently authenticated user. |
| `GET` | `/api/v1/playlist/:id` | 🔒 Get the details of a specific playlist by its ID, including all problems in it. |
| `POST` | `/api/v1/playlist/create-playlist` | 🔒 Create a new playlist with a name and optional description. |
| `POST` | `/api/v1/playlist/:id/add-problem` | 🔒 Add a problem to an existing playlist by playlist ID. |
| `DELETE` | `/api/v1/playlist/:id` | 🔒 Delete a playlist by its ID. Only the owner can delete their playlist. |
| `DELETE` | `/api/v1/playlist/:id/remove-problem` | 🔒 Remove a specific problem from a playlist by playlist ID. |

---

## 🔑 Legend

| Badge | Meaning |
| --- | --- |
| 🔒 Auth Required | Must be logged in with a valid session |
| 🛡️ Admin Only | Restricted to users with admin role |