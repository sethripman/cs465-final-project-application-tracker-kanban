# cs465-final-project-application-tracker-kanban

# Job Application Tracker (Full Stack Kanban App)

A full stack web application for tracking job applications through different stages of the hiring process using a Kanban-style interface.

Users can create an account, log in securely, and manage job applications by creating, editing, deleting, and updating their status across workflow columns such as **Saved**, **Applied**, **Interview**, **Offer**, and **Rejected**.

This project was built using **React + TypeScript on the frontend** and **Express + PostgreSQL on the backend**, with secure authentication using **JWT stored in httpOnly cookies**.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL

### Authentication & Security

- JWT authentication
- httpOnly cookie storage
- bcrypt password hashing
- CORS configured for credentialed requests

### Development Tooling

- Docker (Postgres container)
- Nodemon + tsx for backend dev server

---

## Features

- User registration and login
- Persistent authenticated sessions
- Protected API routes
- Create job applications
- Edit application details
- Delete applications
- Update application status
- Kanban board layout grouped by workflow stage
- SQL-backed data persistence

---

## Getting Started (Fork & Run Locally)

### 1. Fork the repository

On GitHub:

- Click **Fork** in the top-right corner of the repository page

---

### 2. Clone your fork

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

---

### 3. Start PostgreSQL using Docker

```bash
docker compose up -d
```

- This will start a container:

Postgres database name: job_tracker
Username: app
Password: app_password
Port: 5432

---

### 4. Configure backend env

```bash
cd server
```

- create a .env file

```
DATABASE_URL="postgresql://app:app_password@localhost:5432/job_tracker?schema=public"
JWT_SECRET="replace_this_with_a_long_random_string"
JWT_EXPIRES_IN="7d"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
```

- install dependencies

```bash
npm install
```

---

### 5. Run database migration

```bash
npx prisma migrate dev
```

---

### 6. Start backend server

```bash
npm run dev
```

- backend will run at http://localhost:4000
- verify with http://localhost:4000/health

---

### 7. Install front end dependencies and run

- In a new terminal, run

```bash
cd client
npm install
npm run dev
```

- frontend will run at http://localhost:5173

- You can now:
  Register a new account
  Log in
  Create job applications
  Move applications through workflow stages
  Edit or delete entries

---

### 5. Run database migration

```bash
npx prisma migrate dev
```

---

### Project Structure

root/
client/ → React + TypeScript frontend
server/ → Express + TypeScript backend
docker-compose.yml

---

### License

This project is intended for educational use.
