# Friend Chat App

This repository contains a basic frontend (React) and backend (Node.js + Express + MongoDB) for the Friend Chat App. This iteration adds the Lost & Found module as an MVP feature.

Lost & Found helps USIU-A students quickly report, browse, and match lost or found items on campus.

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)

### Backend
1. Configure environment variables in `backend/.env` (see `backend/.env.example`):
	 - `MONGODB_URI=mongodb://127.0.0.1:27017/friendchat`
- `PORT=5001`
- `FRONTEND_ORIGIN=http://localhost:3000`
2. Install and run:
```bash
cd backend
npm install
npm run dev
```

The API runs on `http://localhost:5001`.

### Frontend
1. Install and run:

```bash
cd frontend
npm install
npm start
```

The app runs on `http://localhost:3000`.

## Lost & Found API

Base path: `/api/lostfound` on `http://localhost:5001`

- GET `/` — list items. Optional query: `q`, `status` (`lost|found|claimed`), `category`.
- GET `/:id` — fetch single item.
- POST `/` — create report.
	- body: `{ title, description, category, status?, location?, imageUrl?, reporterName?, reporterEmail? }`
- PATCH `/:id/status` — update status.
	- body: `{ status: 'lost'|'found'|'claimed' }`

## Frontend (Lost & Found)

- Navigate to `Lost & Found` from the top nav.
- Create a report via `Report Item`.
- View an item and update status in its detail page.

## Notes
- Authentication/email verification is not wired yet; routes are public for MVP.
- Image uploads are URL-based for now; file uploads can be added later.
