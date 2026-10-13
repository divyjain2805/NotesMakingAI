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

Deploy the backend and frontend as separate services, and create a MongoDB
database reachable from the backend host.

### Backend service

1. Deploy the `backend` directory as a Node.js service.
2. Install dependencies with `npm install` and use `npm start` to run it.
3. Configure these variables in the hosting provider's backend environment:
   `PORT` (if required by the host), `MONGO_URI`, `GROQ_API_KEY`,
   `AUTH_TOKEN_SECRET`, and `FRONTEND_URL`.
4. Set `FRONTEND_URL` to the exact public origin of the deployed frontend,
   including the scheme (for example, `https://notes.example.com`) and without
   a trailing slash.
5. Use a unique, randomly generated `AUTH_TOKEN_SECRET` of at least 32
   characters. Keep all backend secrets out of the frontend and source control.
6. Configure MongoDB network access so the backend host can connect. Avoid
   exposing the database to unrestricted public access.

The backend connects to MongoDB before it starts listening for requests. A
database connection failure prevents the service from starting.

### Frontend static site

1. Deploy the `frontend` directory as a static Vite site.
2. Set `VITE_API_URL` to the public backend origin (for example,
   `https://api.example.com`) in the frontend build environment.
3. Build with `npm run build` and publish the generated `dist` directory.
4. If the frontend host supports a custom domain, set the backend's
   `FRONTEND_URL` to that final origin and redeploy/restart the backend.

`VITE_API_URL` is compiled into the browser bundle. Never put `GROQ_API_KEY`,
`MONGO_URI`, or `AUTH_TOKEN_SECRET` in a `VITE_*` variable.
