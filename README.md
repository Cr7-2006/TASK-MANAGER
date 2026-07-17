# TaskMaster — Premium MERN Stack Task Manager

TaskMaster is a modern, responsive, and aesthetically stunning full-stack Task Management application built using the MERN stack (MongoDB, Express, React, Node.js). 

Featuring a premium dark theme, glassmorphic UI elements, smooth state-driven animations, JWT-based authentication, and a complete suite of task organization filters.

---

## ✨ Features

- 🔐 **Secure Authentication**: Register and login with secure passwords (hashed via bcrypt) and JWT authorization.
- ⚡ **Snappy Interactions**: Client-side filtering, searching, and status toggles for instant UI response times.
- 📊 **Interactive Statistics**: Real-time counter widgets tracking total, completed, in-progress, and to-do tasks.
- 🎨 **Visual Design**: High-fidelity dark mode styling, custom scrollbars, gradient glows, and card hover animations.
- 🛠️ **Full Task CRUD**: Create, view details, edit fields, delete, and instantly modify task status/priorities.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router DOM, Axios, React Icons, React Hot Toast
- **Backend**: Node.js, Express, Mongoose, JSON Web Tokens, bcryptjs
- **Database**: MongoDB (Local Instance)

---

## 📂 Folder Structure

```
TASK MANAGER FSD MERN/
├── server/                    # Backend API
│   ├── config/db.js           # Database Connection
│   ├── controllers/           # Auth and Task route controllers
│   ├── middleware/            # JWT validation middleware
│   ├── models/                # MongoDB Mongoose Schemas (User & Task)
│   ├── routes/                # Express Route handlers
│   └── server.js              # Server entry point
│
└── client/                    # Frontend SPA
    ├── src/
    │   ├── components/        # Reusable UI components (TaskCard, Navbar, etc.)
    │   ├── context/           # AuthContext provider
    │   ├── pages/             # Route-level pages (Dashboard, Login, Detail)
    │   ├── services/api.js    # Axios endpoints wrapper
    │   ├── index.css          # Design system & global styles
    │   └── App.jsx            # Routing & Root layout
    └── index.html
```

---

## 🚀 Getting Started

### Prerequisites
1. **Node.js** (Installed & added to system PATH)
2. **MongoDB Community Server** (Installed & running on localhost)

### Running the Project

#### Step 1: Start the MongoDB Server
Ensure the MongoDB local database service is started and running at `mongodb://127.0.0.1:27017`.

#### Step 2: Set Up and Run the Backend API
Navigate to the server directory, install dependencies, and start the development server:
```bash
cd server
npm install
npm run dev
```
The backend API will start on port `5000`.

#### Step 3: Set Up and Run the Frontend Client
Navigate to the client directory, install dependencies, and start the development server:
```bash
cd client
npm install
npm run dev
```
The React frontend application will launch (usually on `http://localhost:5173`).

---

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register` — Create a new user account
- `POST /api/auth/login` — Sign in and receive a JWT token
- `GET /api/auth/profile` — Fetch the logged-in user's profile (Protected)

### Tasks
- `GET /api/tasks` — Retrieve all tasks for the logged-in user (Protected)
- `POST /api/tasks` — Create a new task (Protected)
- `GET /api/tasks/:id` — Retrieve a single task's details (Protected)
- `PUT /api/tasks/:id` — Update an existing task (Protected)
- `DELETE /api/tasks/:id` — Delete a task (Protected)
