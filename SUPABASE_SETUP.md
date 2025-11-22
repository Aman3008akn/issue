# Supabase Setup Instructions

This document provides instructions for setting up Supabase for the WinShow gaming platform.

## Prerequisites

1. A Supabase account (you already have this with your project ID: ebbwgkchrcvtavasqbpx)
2. Supabase CLI installed (optional but recommended)

## Database Setup

### 1. Run the Migration

Connect to your Supabase database and run the SQL script located at `supabase/migrations/001_initial_schema.sql`:

```sql
-- Copy and paste the entire contents of 001_initial_schema.sql here
```

### 2. Set up Authentication

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Make sure "Enable email signup" is turned ON
4. Under "Email Templates", you can customize the signup confirmation email if desired

### 3. Configure Row Level Security (RLS)

The migration script already includes RLS policies, but you can verify them in the Supabase dashboard:

1. Go to Table Editor
2. For each table, check that RLS is enabled
3. Verify the policies match those in the migration script

## Environment Variables

Update your frontend `.env` file with the following variables:

```env
REACT_APP_SUPABASE_URL=https://ebbwgkchrcvtavasqbpx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYndna2NocmN2dGF2YXNxYnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Mjc4NDYsImV4cCI6MjA3OTMwMzg0Nn0.hzYcfLPA_Zv4wCnAmbS9TRJpX8X8PkwvfsQOFub3VsA
```

## Testing the Setup

1. Start your frontend application:
   ```bash
   cd frontend
   npm start
   ```

2. Try to register a new user
3. Verify that user data is stored in the `users` table
4. Test balance updates by playing games
5. Verify that game history and transaction history are recorded

## Admin Access

To access the admin dashboard:

1. Register or login with the email `admin@gmail.com` and any password
2. The application will automatically detect this as an admin user
3. You'll be redirected to the admin dashboard

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Make sure your Supabase URL and anon key are correct
2. **Database Connection Issues**: Verify that your Supabase project is active
3. **RLS Policy Errors**: Check that all policies are correctly applied

### Checking Database Tables

You can verify your database setup by running these queries in the Supabase SQL editor:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if the update_user_balance function exists
SELECT proname FROM pg_proc WHERE proname = 'update_user_balance';
```

## Security Notes

1. The anon key provided allows read/write access to the database through defined RLS policies
2. User data is protected by RLS policies that only allow users to access their own data
3. Admin access is restricted to the specific email `admin@gmail.com`
4. All passwords are handled securely by Supabase Auth

## Next Steps

1. Set up email templates in Supabase for better user experience
2. Configure custom domain if needed
3. Set up monitoring and analytics
4. Consider adding additional security measures like multi-factor authentication