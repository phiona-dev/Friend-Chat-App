Deployment notes — backend
=========================

This document contains quick instructions for deploying the backend (Express/Mongo) to common platforms.

Prerequisites
- Ensure `MONGODB_URI` (and any other secrets) are available as environment variables in the target platform.

1) Render (recommended for simplicity)
- Create a new Web Service on Render and connect your GitHub repository.
- Choose the `backend` folder as the root (or use Docker). If using the Dockerfile included here, select "Docker" and Render will use `backend/Dockerfile`.
- Set environment variables: `MONGODB_URI`, `FRONTEND_ORIGIN` (e.g. `https://friend-chat-app-77edb.web.app`), and `PORT` (optional).

2) Railway / Fly / Railway.app
- Create a new project and deploy from GitHub. Set the root to the `backend` folder and use the Docker option or Node build commands.
- Add environment variables in the project settings.

3) Google Cloud Run (container)
- Build and push the container (example using gcloud):
  ```bash
  docker build -t gcr.io/PROJECT_ID/friend-chat-backend:latest backend/
  docker push gcr.io/PROJECT_ID/friend-chat-backend:latest
  gcloud run deploy friend-chat-backend --image gcr.io/PROJECT_ID/friend-chat-backend:latest --platform managed --region us-central1 --allow-unauthenticated --set-env-vars MONGODB_URI=YOUR_URI,FRONTEND_ORIGIN=https://friend-chat-app-77edb.web.app
  ```

4) Heroku (not recommended for production)
- Add this repo (root) to Heroku, set the Procfile path to `backend/Procfile` or deploy by specifying the backend directory. Ensure env vars are set.

Notes
- Make sure CORS environment variable `FRONTEND_ORIGIN` includes your Firebase hosting domain.
- If you deploy under HTTPS and a custom domain, update `allowedOrigins` in `server.js` or set `FRONTEND_ORIGIN` accordingly.
