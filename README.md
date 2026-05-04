# Campus Companion App

This is a full-stack starter implementation of the **Campus Companion App** based on the uploaded project brief. It includes:

- React + Vite frontend
- Express + Node.js backend
- MongoDB database
- JWT authentication
- Dashboard
- Timetable management
- Assignment tracking
- Event discovery
- Study group management
- Campus marketplace

## Project structure

- `frontend/` - React app
- `backend/` - Express API

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Required backend environment variables

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campus_companion
JWT_SECRET=change_this_to_a_strong_secret
CLIENT_URL=http://localhost:5173
```

## Required frontend environment variables

```env
VITE_API_URL=http://localhost:5000/api
```

## Suggested next improvements

1. Add OTP email verification.
2. Add role-based admin dashboard.
3. Add file uploads for marketplace images and resources.
4. Add notifications and reminders.
5. Add real-time chat for peer collaboration.
6. Add polished cards instead of raw JSON for records.
