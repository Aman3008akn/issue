// Script to help set up Supabase database tables and functions
// This script is for reference only - you should run the SQL directly in Supabase

const supabaseSetup = `
-- Create users table
create table if not exists users (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  email text not null,
  balance numeric(10,2) not null default 5000.00,
  referred_by uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create game_history table
create table if not exists game_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  game_type text not null,
  bet_amount numeric(10,2) not null,
  result text,
  payout numeric(10,2),
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transaction_history table
create table if not exists transaction_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  type text not null, -- deposit, withdrawal, referral_bonus
  amount numeric(10,2) not null,
  description text,
  balance_after numeric(10,2) not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create withdrawal_requests table
create table if not exists withdrawal_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  username text not null,
  amount numeric(10,2) not null,
  method text not null, -- upi, imps, crypto
  upi_id text,
  bank_account text,
  ifsc_code text,
  crypto_wallet text,
  status text not null default 'pending', -- pending, processed
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  processed_at timestamp with time zone
);

-- Create referral_bonuses table
create table if not exists referral_bonuses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  referred_user_id uuid references users(id) not null,
  bonus_amount numeric(10,2) not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, referred_user_id)
);

-- Create function to update user balance atomically
create or replace function update_user_balance(user_id uuid, amount numeric)
returns users as $$
declare
  updated_user users;
begin
  update users 
  set balance = balance + amount 
  where id = user_id
  returning * into updated_user;
  
  return updated_user;
end;
$$ language plpgsql;

-- Enable RLS (Row Level Security) on all tables
alter table users enable row level security;
alter table game_history enable row level security;
alter table transaction_history enable row level security;
alter table withdrawal_requests enable row level security;
alter table referral_bonuses enable row level security;

-- Create policies for users table
create policy "Users can view their own data" on users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on users
  for update using (auth.uid() = id);

-- Create policies for game_history table
create policy "Users can view their own game history" on game_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own game history" on game_history
  for insert with check (auth.uid() = user_id);

-- Create policies for transaction_history table
create policy "Users can view their own transaction history" on transaction_history
  for select using (auth.uid() = user_id);

-- Create policies for withdrawal_requests table
create policy "Users can view their own withdrawal requests" on withdrawal_requests
  for select using (auth.uid() = user_id);

create policy "Users can insert their own withdrawal requests" on withdrawal_requests
  for insert with check (auth.uid() = user_id);

create policy "Admins can view all withdrawal requests" on withdrawal_requests
  for select using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.email = 'admin@gmail.com'
    )
  );

create policy "Admins can update withdrawal requests" on withdrawal_requests
  for update using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.email = 'admin@gmail.com'
    )
  );

-- Create policies for referral_bonuses table
create policy "Users can view their own referral bonuses" on referral_bonuses
  for select using (auth.uid() = user_id);

-- Grant permissions
grant usage on schema public to authenticated;
grant all on table users to authenticated;
grant all on table game_history to authenticated;
grant all on table transaction_history to authenticated;
grant all on table withdrawal_requests to authenticated;
grant all on table referral_bonuses to authenticated;
grant execute on function update_user_balance(uuid, numeric) to authenticated;
`;

console.log("Copy the following SQL to your Supabase SQL editor and run it:");
console.log(supabaseSetup);