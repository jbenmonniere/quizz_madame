create table if not exists quiz_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function set_quiz_state_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_quiz_state_updated_at on quiz_state;
create trigger set_quiz_state_updated_at
before update on quiz_state
for each row
execute function set_quiz_state_updated_at();

alter table quiz_state enable row level security;

-- WARNING: open policies below allow public read/write with the anon key.
-- Replace with auth-bound policies for production.
create policy "quiz_state_read" on quiz_state
  for select
  using (true);

create policy "quiz_state_insert" on quiz_state
  for insert
  with check (true);

create policy "quiz_state_update" on quiz_state
  for update
  using (true)
  with check (true);
