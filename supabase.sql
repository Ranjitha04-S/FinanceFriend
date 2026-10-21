-- Run this once in Supabase > SQL Editor
create table collections (
  id uuid primary key default gen_random_uuid(),
  collected_on date not null,
  name text not null,
  amount numeric not null,
  created_at timestamptz default now()
);
create index on collections (collected_on);
alter table collections enable row level security;
-- Single-user app: open policy. Add Supabase Auth + user_id later if the URL is shared.
create policy "open" on collections for all using (true) with check (true);
