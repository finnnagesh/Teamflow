# Teamflow – Fullstack Setup Guide

## Project Overview

**Teamflow** is a collaborative team management and communication platform designed for developers and small teams. It combines **real-time chat**, **project & task management**, and **GitHub integration** into a single system so users don’t need to switch between multiple tools.

The system is built as a **fullstack application** with a React frontend and a Django backend, supporting REST APIs and WebSockets for real-time features.

### Core Goals

* Centralize **team collaboration**
* Enable **real-time communication** using WebSockets
* Track **projects, tasks, and commits** in one place
* Integrate with **GitHub OAuth** for authentication
* Provide a lightweight **agent** for extended functionality

---

This repository contains a **fullstack application** with:

* **Backend**: Django + Django REST Framework + Django Channels (WebSockets)
* **Frontend**: React (Vite + TailwindCSS)
* **Agent**: Prebuilt binary (`agent.v1`)

This guide explains how to set up and run the project on a **new computer** from scratch.

---

## 1. Prerequisites

Make sure the following are installed on your system:

### System Requirements

* **Python** >= 3.10
* **Node.js** >= 18
* **npm** >= 9
* **Git**
* **PostgreSQL** (optional if using cloud DB like Neon)

Verify installations:

```bash
python --version
node --version
npm --version
git --version
```

---

## 2. Project Features

### 🔐 Authentication & Users

* Custom user system (Django)
* GitHub OAuth login
* Role-based access (members, owners)

### 💬 Real-time Chat

* WebSocket-based chat using **Django Channels**
* Custom middleware for WebSocket authentication
* Project-based chat rooms

### 📁 Project Management

* Create and manage projects
* Invite users via join requests
* Control access at project level

### ✅ Task Management

* Create, update, and assign tasks
* Track task status
* Link tasks with commits

### 🔗 GitHub Integration

* GitHub OAuth for secure login
* Track task-related commits
* Store commit history per task

### 🧠 Agent Support

* External agent binary (`agent.v1`)
* Downloadable from frontend
* Designed for future automation / background jobs

---

## 3. Project Structure Overview

```text
.
├── agent.v1                  # Desktop/CLI agent binary
├── backend                   # Django backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── backend/              # Core Django config
│   ├── chatapp/              # WebSocket + chat logic
│   ├── user/                 # Custom user module
│   ├── project/              # Project management
│   ├── task/                 # Tasks
│   ├── task_commit/          # GitHub commits
│   └── joinrequest           # Join requests
└── frontend                  # React (Vite) frontend
```

---

## 3. Backend Setup (Django)

### 3.1 Create Virtual Environment

```bash
cd backend
python -m venv venv
```

Activate it:

**Linux / macOS**

```bash
source venv/bin/activate
```

**Windows**

```bash
venv\Scripts\activate
```

---

### 3.2 Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 3.3 Backend Environment Variables

Create a file called **`.env`** inside the `backend/` directory.

#### `.env.example` (Dummy / Safe Version)

```env
# Django
DEBUG=True
SECRET_KEY=replace-this-secret-key
ALLOWED_HOSTS=127.0.0.1,localhost

# Database (PostgreSQL)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

👉 Copy it:

```bash
cp .env.example .env
```

Then fill in **real values**.

---

### 3.4 Database Setup

Apply migrations:

```bash
python manage.py migrate
```

(Optional) Create superuser:

```bash
python manage.py createsuperuser
```

---

### 3.5 Run Backend Server

```bash
python manage.py runserver
```

Backend will be available at:

```
http://127.0.0.1:8000/
```

WebSocket base:

```
ws://127.0.0.1:8000/
```

---

## 4. Frontend Setup (React + Vite)

### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

---

### 4.2 Frontend Environment Variables

Create a **`.env`** file inside the `frontend/` directory.

#### `.env.example`

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/
VITE_WS_BASE_URL=ws://127.0.0.1:8000
VITE_AGENT_DOWNLOAD_URL=https://github.com/your-org/your-repo/releases/download/tag/agent.v1
```

Copy it:

```bash
cp .env.example .env
```

---

### 4.3 Run Frontend Server

```bash
npm run dev
```

Frontend will be available at:

```
http://localhost:5173/
```

---

## 5. Running the Agent

The agent binary is provided as:

```text
agent.v1
```

### Linux / macOS

```bash
chmod +x agent.v1
./agent.v1
```

### Windows

```bash
agent.v1.exe
```

The frontend uses `VITE_AGENT_DOWNLOAD_URL` to fetch this binary.

---

## 6. Common Commands Summary

### Backend

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 7. Security Notes ⚠️

* ❌ **Never commit `.env` files**
* ✅ Always commit `.env.example`
* Rotate GitHub OAuth secrets if leaked
* Use strong `SECRET_KEY` in production

---

## 8. Production Notes (Optional)

For production deployment, consider:

* Dockerizing backend & frontend
* Using Nginx as reverse proxy
* Running Django with Gunicorn + Daphne
* Using Redis for Channels

---

## 9. Troubleshooting

### Port already in use

```bash
lsof -i :8000
kill -9 <PID>
```

### Node issues

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 10. Author

**Nagesh Arjariya**
Fullstack Developer (Django + React)

---

✅ Your system is now ready to run the complete Teamflow fullstack application.
