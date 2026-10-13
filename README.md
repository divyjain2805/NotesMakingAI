# NotesMaking AI

NotesMaking AI is a personal notes app with a conversational assistant. Create
an account to keep your notes private to your account, then use natural-language
requests to create, find, update, and delete notes.

## Features

- Email and password registration and sign-in.
- Notes stored in MongoDB and scoped to the signed-in account.
- Groq-powered assistant for working with notes using natural language.
- Responsive React interface.

## Technology

- Frontend: React, Vite, Tailwind CSS.
- Backend: Node.js, Express, Mongoose, Zod.
- Database: MongoDB.
- AI: Groq API.

## Requirements

- Node.js 20.19+ or 22.12+.
- npm.
- A MongoDB database.
- A Groq API key for assistant requests.

## Run locally

### 1. Configure the backend

Copy `backend/.env.example` to `backend/.env`, then set the values:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend HTTP port. The example uses `8000`. |
| `MONGO_URI` | MongoDB connection string for the application database. |
| `GROQ_API_KEY` | API key used by the notes assistant. |
| `AUTH_TOKEN_SECRET` | Private signing secret, at least 32 characters. |
| `FRONTEND_URL` | Frontend origin allowed by the backend. Locally, `http://localhost:5173`. |

Generate a strong auth secret with:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Do not commit `backend/.env` or share the auth secret, database URI, or Groq API
key. The backend `.gitignore` excludes environment files other than the
shareable `.env.example`.

Install dependencies and start the backend:

```sh
cd backend
npm install
npm run dev
```

The backend defaults to port `8000`. If you choose another port, make the
frontend's `VITE_DEV_API_TARGET` match it.

### 2. Configure and start the frontend

In another terminal:

```sh
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).
The frontend proxies `/api` requests to the backend during development.

Optional frontend environment variables are documented in
[`frontend/.env.example`](./frontend/.env.example):

- `VITE_DEV_API_TARGET`: local backend origin used by the Vite development
  proxy. Set it to `http://127.0.0.1:8000` for the default backend port.
- `VITE_API_URL`: backend origin for production builds. Leave it blank for
  local development.

Restart the Vite server after changing frontend environment variables.

## How accounts and notes work

- Register or sign in with an email address and password of at least 8
  characters.
- Passwords are stored as salted scrypt hashes, not as plain text.
- The backend issues a signed bearer token that expires after seven days. The
  frontend stores that token in the browser's local storage and sends it with
  authenticated requests.
- The backend derives the note owner from the verified token. A client cannot
  select another account by sending an owner ID.
- Each account can only list, search, read, update, or delete its own notes.
- Notes already in the database before account ownership was added have no
  owner and are not displayed to accounts. Assign them only through a deliberate
  migration that verifies the intended owner.

Password reset, email verification, and account deletion are not currently
implemented. Use HTTPS in production.

## API overview

All routes are served by the backend. Except for registration and login, the
routes below require an `Authorization: Bearer <token>` header.

| Method | Path | Purpose | Authentication |
| --- | --- | --- | --- |
| `GET` | `/` | Basic backend status response. | No |
| `POST` | `/api/auth/register` | Create an account; accepts `{ "email", "password" }`. | No |
| `POST` | `/api/auth/login` | Sign in; accepts `{ "email", "password" }`. | No |
| `GET` | `/api/auth/me` | Return the signed-in account. | Yes |
| `GET` | `/api/notes` | List the signed-in account's notes. | Yes |
| `POST` | `/api/assistant` | Process a natural-language notes request; accepts `{ "query" }`. | Yes |

## Tests and checks

Backend authentication unit tests:

```sh
cd backend
npm test
```

Frontend lint and production build:

```sh
cd frontend
npm run lint
npm run build
```

The frontend build output is written to `frontend/dist`.

## Deployment

The repository includes a [`render.yaml`](./render.yaml) Blueprint for the
backend. Deploy the frontend separately on Vercel. Create a MongoDB database
reachable from the backend host before deploying.

### Backend service

1. In Render, create a new **Blueprint** and connect this GitHub repository.
2. Render reads `render.yaml` and creates the backend web service using
   `backend` as its root directory. The Blueprint generates
   `AUTH_TOKEN_SECRET`; enter `MONGO_URI`, `GROQ_API_KEY`, and a temporary
   `FRONTEND_URL` when prompted.
3. `FRONTEND_URL` must be the exact deployed frontend origin, including the
   scheme (for example, `https://notesmakingai.vercel.app`) and without a
   trailing slash. After creating the Vercel project, update this value in the
   Render service's environment settings and redeploy.
4. Configure MongoDB network access so the backend host can connect. Avoid
   exposing the database to unrestricted public access.

The backend connects to MongoDB before it starts listening for requests. A
database connection failure prevents the service from starting. The Blueprint
uses Render's free web service plan; free services may spin down when idle and
take longer to respond on the first request after inactivity.

### Frontend static site

1. In Vercel, import this GitHub repository as a new project.
2. Set **Root Directory** to `frontend`.
3. Add `VITE_API_URL` with the Render backend's public origin (for example,
   `https://notesmakingai-api.onrender.com`). Do not add a trailing slash.
4. Vercel should detect Vite. Use `npm run build` as the build command and
   `dist` as the output directory, then deploy.
5. Copy the resulting Vercel production origin into `FRONTEND_URL` on Render,
   save the setting, and redeploy the backend.
6. Redeploy the Vercel project after changing `VITE_API_URL`.

`VITE_API_URL` is compiled into the browser bundle. Never put `GROQ_API_KEY`,
`MONGO_URI`, or `AUTH_TOKEN_SECRET` in a `VITE_*` variable.
