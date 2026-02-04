create table if not exists quiz_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Auth + classes
create extension if not exists "pgcrypto";

create table if not exists teacher_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists teacher_content (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  level text,
  created_at timestamptz not null default now()
);

create table if not exists class_state (
  class_id uuid primary key references classes(id) on delete cascade,
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

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_teacher_content_updated_at on teacher_content;
create trigger set_teacher_content_updated_at
before update on teacher_content
for each row
execute function set_updated_at();

drop trigger if exists set_class_state_updated_at on class_state;
create trigger set_class_state_updated_at
before update on class_state
for each row
execute function set_updated_at();

alter table quiz_state enable row level security;
alter table teacher_profiles enable row level security;
alter table teacher_content enable row level security;
alter table classes enable row level security;
alter table class_state enable row level security;

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

create policy "teacher_profiles_select" on teacher_profiles
  for select
  using (id = auth.uid());

create policy "teacher_profiles_insert" on teacher_profiles
  for insert
  with check (id = auth.uid());

create policy "teacher_profiles_update" on teacher_profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "teacher_content_select" on teacher_content
  for select
  using (user_id = auth.uid());

create policy "teacher_content_insert" on teacher_content
  for insert
  with check (user_id = auth.uid());

create policy "teacher_content_update" on teacher_content
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "classes_select" on classes
  for select
  using (teacher_id = auth.uid());

create policy "classes_insert" on classes
  for insert
  with check (teacher_id = auth.uid());

create policy "classes_update" on classes
  for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "classes_delete" on classes
  for delete
  using (teacher_id = auth.uid());

create policy "class_state_select" on class_state
  for select
  using (
    exists (
      select 1 from classes c
      where c.id = class_state.class_id
      and c.teacher_id = auth.uid()
    )
  );

create policy "class_state_insert" on class_state
  for insert
  with check (
    exists (
      select 1 from classes c
      where c.id = class_state.class_id
      and c.teacher_id = auth.uid()
    )
  );

create policy "class_state_update" on class_state
  for update
  using (
    exists (
      select 1 from classes c
      where c.id = class_state.class_id
      and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from classes c
      where c.id = class_state.class_id
      and c.teacher_id = auth.uid()
    )
  );
