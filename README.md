# RacoAI — Project Marketplace

A full-stack marketplace platform where **Buyers** post technical problems and **Problem Solvers** apply to solve them. Solvers submit work as ZIP files, buyers review and accept or reject submissions.

---

## System Overview

RacoAI connects two types of users:

- **Buyers** create projects describing a problem they need solved, set a budget and deadline, review applications from solvers, assign one solver, then review their submitted work.
- **Problem Solvers** browse open projects, apply with a cover message and proposed budget, create tasks to break down their work, and submit ZIP files for buyer review.
- **Admins** manage users and can change roles across the platform.

### Lifecycle at a glance

```
Buyer posts project (OPEN)
  └── Solvers apply → Buyer picks one → project moves to ASSIGNED
        └── Solver creates tasks → works on them (IN_PROGRESS)
              └── Solver submits ZIP per task → SUBMITTED
                    └── Buyer accepts/rejects submission
                          └── All tasks done → UNDER_REVIEW → COMPLETED
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (Bearer token + cookie) |
| Password hashing | bcryptjs |
| File uploads | Multer (disk storage) |
| Cloud storage | Cloudinary v2 (via upload_stream) |
| Environment | Node.js 20.6+ native `--env-file` |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS |
| State management | Zustand (auth store) |
| Server state | TanStack React Query v5 |
| HTTP client | Axios |
| Notifications | Sonner |
| Auth cookies | js-cookie + native document.cookie |
| Font | Nunito (Google Fonts) |

---

## Setup Instructions

### Prerequisites
- Node.js v20.6 or higher
- MongoDB running locally or a MongoDB Atlas URI
- Cloudinary account (free tier works)

---

### Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/racoai
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create the uploads folder:
```bash
mkdir uploads
```

Start the server:
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

### Frontend

```bash
cd racoai-v2
npm install
```

Create `.env.local` in the `racoai-v2/` root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the dev server:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

---

### First time setup

1. Register an account — defaults to `PROBLEM_SOLVER` role
2. To get an `ADMIN` account, manually update in MongoDB:
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "ADMIN" } })
```
3. Log in as Admin → go to `/admin/users` → change other users to `BUYER` or `PROBLEM_SOLVER`

---

## API Route Summary

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

### Auth
```
POST   /auth/register          Create account (defaults to PROBLEM_SOLVER)
POST   /auth/login             Login, returns JWT token
POST   /auth/logout            Clear auth cookie
GET    /auth/me                Get current user (protected)
PATCH  /auth/change-password   Change password (protected)
```

### Users
```
GET    /users                  Get all users          (ADMIN only)
GET    /users/stats            Platform stats         (ADMIN only)
PATCH  /users/:id/role         Change user role       (ADMIN only)
PATCH  /users/:id/status       Toggle active status   (ADMIN only)
GET    /users/:id/profile      Get public profile
PATCH  /users/me/profile       Update own profile + avatar upload
```

### Projects
```
GET    /projects               List all projects (filterable by status, search)
POST   /projects               Create project     (BUYER only)
GET    /projects/:id           Get single project
PATCH  /projects/:id           Edit project       (BUYER, OPEN status only)
DELETE /projects/:id           Delete project     (BUYER, OPEN status only)
PATCH  /projects/:id/assign    Assign a solver    (BUYER — picks a request)
PATCH  /projects/:id/status    Transition status  (BUYER or ADMIN)
```

### Requests (Solver Applications)
```
POST   /projects/:projectId/requests    Apply to a project  (PROBLEM_SOLVER)
GET    /projects/:projectId/requests    List applications   (BUYER or ADMIN)
GET    /requests/mine                   My applications     (PROBLEM_SOLVER)
GET    /requests/:requestId             Single request
DELETE /requests/:requestId/withdraw    Withdraw application (PROBLEM_SOLVER)
```

### Tasks
```
POST   /projects/:projectId/tasks                    Create task        (PROBLEM_SOLVER)
GET    /projects/:projectId/tasks                    List project tasks
GET    /projects/:projectId/tasks/:taskId            Single task
PATCH  /projects/:projectId/tasks/:taskId            Update task
PATCH  /projects/:projectId/tasks/:taskId/status     Move task status
DELETE /projects/:projectId/tasks/:taskId            Delete task
```

### Submissions
```
POST   /submissions/tasks/:taskId/submit     Upload ZIP file    (PROBLEM_SOLVER)
GET    /submissions/tasks/:taskId            List submissions for a task
GET    /submissions/:submissionId            Single submission
PATCH  /submissions/:submissionId/review     Accept or reject   (BUYER)
```

---

### Project Status Flow
```
OPEN → ASSIGNED → IN_PROGRESS → UNDER_REVIEW → COMPLETED
                                             → CANCELLED (any stage)
```

### Task Status Flow
```
PENDING → IN_PROGRESS → SUBMITTED → COMPLETED
                                  → REJECTED → IN_PROGRESS (resubmit)
```

---

## Key Architectural Decisions

### 1. Role-based access with a single user model
All three roles (`ADMIN`, `BUYER`, `PROBLEM_SOLVER`) live in one `User` collection with a `role` enum field. Route protection is handled by a single `protect` middleware (validates JWT) and an `authorize(...roles)` middleware (checks role). No separate tables or collections per role.

### 2. File uploads: disk → Cloudinary, not memory
Files are saved to a local `uploads/` folder first via Multer disk storage, then uploaded to Cloudinary using `cloudinary.uploader.upload(filePath)`, then the local file is deleted. This avoids the version incompatibility between `multer-storage-cloudinary` and `cloudinary` v2, and avoids holding large files in RAM (memory storage).

### 3. JWT in both cookie and Bearer header
The backend issues a JWT on login. The frontend stores it in a browser cookie (accessible to Next.js middleware) and also sends it as a `Bearer` token in the `Authorization` header for API calls. This gives the best of both: middleware can protect routes server-side from the cookie, and Axios sends it for all API requests.

### 4. Next.js middleware for route protection
`src/middleware.js` runs at the Edge before any page renders. It reads the `token` cookie and redirects unauthenticated users to `/login` and authenticated users away from auth pages. This means no protected page ever renders even briefly for unauthenticated users.

### 5. React Query for all server state
All API data (projects, tasks, submissions, requests) is managed by TanStack React Query. Zustand is used only for auth state (user + token). This keeps a clean separation: React Query handles caching, refetching, and invalidation; Zustand handles who is logged in.

### 6. Barrel exports for clean imports
Every component folder has an `index.js` that re-exports all components. This allows clean imports anywhere in the app:
```js
import { Button, Card, Badge } from "@/components/ui";
import { ProjectCard, ProjectForm } from "@/components/projects";
```

### 7. Async Mongoose pre-save hooks without `next`
The `User` model password hashing uses `async` pre-save without the `next` parameter. Calling `next()` in an async Mongoose hook causes a "next is not a function" error in Mongoose v7+. The `return` statement is used instead to short-circuit when the password hasn't changed.

### 8. Project auto-transitions
When a solver submits a task (`SUBMITTED` status), the backend automatically checks if all tasks in the project are done. If none remain `PENDING` or `IN_PROGRESS`, the project status advances to `UNDER_REVIEW` automatically — no manual trigger needed from the buyer.

---

## Folder Structure

```
racoai/
├── server/                        Backend
│   ├── src/
│   │   ├── index.js               Entry point
│   │   ├── config/
│   │   │   ├── db.js              MongoDB connection
│   │   │   └── cloudinary.js      Multer + Cloudinary setup
│   │   ├── models/                Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── ProjectRequest.js
│   │   │   ├── Task.js
│   │   │   └── Submission.js
│   │   ├── controllers/           Business logic
│   │   ├── middleware/            protect + authorize
│   │   ├── routes/                Express routers
│   │   └── utils/                 JWT helpers, error handlers
│   ├── uploads/                   Temp file storage (gitignored)
│   └── .env
│
└── racoai-v2/                     Frontend (Next.js)
    ├── src/
    │   ├── app/                   Pages (App Router)
    │   │   ├── (auth)/            Login + Register
    │   │   ├── admin/             Admin dashboard + users
    │   │   ├── buyer/             Buyer projects + requests
    │   │   └── solver/            Solver browse + tasks + profile
    │   ├── components/
    │   │   ├── ui/                Reusable UI primitives
    │   │   ├── layout/            Sidebar + DashboardLayout
    │   │   ├── projects/          Project-specific components
    │   │   ├── tasks/             Task components
    │   │   ├── requests/          Request components
    │   │   └── submissions/       Submission + file upload
    │   ├── hooks/                 React Query hooks
    │   ├── services/              Axios API calls
    │   ├── stores/                Zustand auth store
    │   ├── providers/             QueryProvider + AuthProvider
    │   ├── constants/             Roles, statuses, route map
    │   ├── lib/                   Utilities + QueryClient
    │   └── middleware.js          Edge route protection
    └── .env.local
```

---

## Environment Variables Reference

### Backend `.env`
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7d` |
| `CLIENT_URL` | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |

### Frontend `.env.local`
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
