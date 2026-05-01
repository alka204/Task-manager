# Team Task Manager (Full-Stack)

Full-stack web application where users can create projects, assign tasks, and track progress with role-based access (`admin` / `member`).

## Assignment Submission

- Live URL: `ADD_YOUR_RAILWAY_URL_HERE`
- GitHub Repo: `ADD_YOUR_GITHUB_REPO_URL_HERE`
- Demo Video (2-5 min): `ADD_YOUR_VIDEO_LINK_HERE`

## Features Implemented

- Authentication
  - Signup
  - Login
  - JWT-based protected APIs
- Role-based access control
  - Admin: create/delete projects and tasks, manage team and project members
  - Member: view assigned tasks, update own task status
- Project and team management
  - Create projects
  - Add/remove project members
  - List team members (admin view)
- Task management
  - Create tasks with assignment, priority, deadline, status
  - Task status tracking (`Pending`, `In Progress`, `Completed`)
  - Task deletion (admin)
- Dashboard
  - Total tasks
  - Pending, In Progress, Completed
  - Overdue tasks

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript, Bootstrap
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Auth: JWT + bcrypt
- Validation: express-validator

## Database Models and Relationships

- `User`
  - `name`, `email`, `password`, `role`
- `Project`
  - `name`, `description`, `createdBy -> User`, `members -> User[]`
- `Task`
  - `title`, `description`, `status`, `priority`, `deadline`
  - `assignedTo -> User`
  - `project -> Project`
  - `createdBy -> User`

## API Overview

Base URL: `/api`

- Auth
  - `POST /auth/register`
  - `POST /auth/login`
- Dashboard
  - `GET /dashboard/stats`
- Users
  - `GET /users/members` (admin)
- Projects
  - `POST /projects` (admin)
  - `GET /projects`
  - `GET /projects/:id`
  - `PATCH /projects/:id/members/add` (admin)
  - `PATCH /projects/:id/members/remove` (admin)
  - `DELETE /projects/:id` (admin)
- Tasks
  - `POST /tasks` (admin)
  - `GET /tasks`
  - `GET /tasks/assigned`
  - `PUT /tasks/:id` (admin)
  - `PATCH /tasks/:id/status`
  - `DELETE /tasks/:id` (admin)

## Local Setup

### 1) Clone

```bash
git clone <YOUR_REPO_URL>
cd Task-manager-main
```

### 2) Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://127.0.0.1:5500
```

Start backend:

```bash
npm start
```

### 3) Frontend setup

Open `frontend/login.html` (or `frontend/register.html`) using Live Server or any static server.

By default frontend uses:

`http://localhost:5000/api`

You can also change API Base URL from login/register form.

## Railway Deployment (Mandatory)

### Backend on Railway

1. Push project to GitHub.
2. Create a new Railway project from that repository.
3. Set root directory to `backend`.
4. Add environment variables:
   - `PORT` = `5000`
   - `MONGO_URI` = `<your_mongodb_uri>`
   - `JWT_SECRET` = `<your_secret>`
   - `CLIENT_URL` = `<your_frontend_url>`
5. Deploy and copy the generated Railway backend URL.

### Frontend hosting

Host the `frontend` folder (Netlify, Vercel static, or GitHub Pages).  
In login/register page, set API Base URL to your Railway backend URL + `/api`.

## Quick Test Flow

1. Register one admin and one member user.
2. Login as admin:
   - create project
   - create tasks assigned to member
3. Login as member:
   - view assigned tasks
   - update status
4. Open dashboard and confirm overdue/status counters update.

## Security Notes

- Never commit real credentials in `.env`.
- Keep `.env` excluded in `.gitignore`.

## License

For internship assessment/demo use.
