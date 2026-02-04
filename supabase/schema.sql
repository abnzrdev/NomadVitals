-- health_data table for storing daily health metrics
create table health_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  date date not null,
  steps integer not null check (steps >= 0),
  heart_rate integer not null check (heart_rate between 30 and 220),
  sleep_hours numeric(4,2) not null check (sleep_hours between 0 and 24),
  created_at timestamptz default now(),
  unique (user_id, date)
);

create index health_data_user_id_date_idx on health_data (user_id, date);

alter table health_data enable row level security;

create policy "Users can select own health data"
  on health_data for select
  using (user_id = auth.uid());

create policy "Users can insert own health data"
  on health_data for insert
  with check (user_id = auth.uid());
