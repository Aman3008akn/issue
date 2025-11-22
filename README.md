# WinShow Gaming Platform

A modern online casino platform built with React and Supabase.

## Features

- Multiple casino games (Aviator, Color Prediction, Car Racing)
- User authentication and management
- Real-time balance updates
- Deposit and withdrawal system
- Referral program
- Admin dashboard for managing users and withdrawals
- Responsive design for all devices

## Tech Stack

- Frontend: React, Tailwind CSS
- Backend: Supabase (Database, Authentication, Storage)
- Deployment: Netlify (frontend), Supabase (backend)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Frontend Setup

```bash
cd frontend
npm install
```

### 2. Supabase Setup

1. Create a Supabase project at https://app.supabase.io/
2. Note your Project URL and anon key
3. Run the database migration script found in `supabase/migrations/001_initial_schema.sql`
4. Set up authentication in the Supabase dashboard

### 3. Environment Variables

Create a `.env` file in the `frontend` directory with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Application

```bash
cd frontend
npm start
```

## Deployment

### Frontend Deployment

The frontend can be deployed to Netlify:

1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify

### Supabase Deployment

The backend is hosted on Supabase. Make sure to:

1. Set up all database tables and functions
2. Configure authentication settings
3. Set up Row Level Security policies

## Admin Access

To access the admin dashboard:

1. Register or login with the email `admin@gmail.com`
2. Use any password
3. You'll be automatically redirected to the admin dashboard

## Security

- All user data is protected with Row Level Security
- Passwords are securely hashed by Supabase Auth
- Admin access is restricted to a specific email address
- Balance updates use atomic database operations to prevent race conditions

## Support

For support, contact the development team or check the documentation.