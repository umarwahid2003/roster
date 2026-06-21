-- Run this once in Supabase SQL Editor (Project > SQL Editor > New query > Run)

-- profiles: one row per signed-up user, extends Supabase's built-in auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  term text not null,
  created_at timestamptz not null default now()
);

create table public.course_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  item_type text not null check (item_type in ('assignment', 'quiz', 'exam', 'deadline', 'other')),
  due_at timestamptz not null,
  created_by uuid references public.profiles(id),
  notified_24h boolean not null default false,
  notified_1h boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- Lock every table down by default; the policies below are the only way in
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_memberships enable row level security;
alter table public.schedule_items enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Anyone signed in can view courses" on public.courses
  for select using (auth.uid() is not null);

create policy "Admins can manage courses" on public.courses
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Users can view their own memberships" on public.course_memberships
  for select using (auth.uid() = user_id);

create policy "Users can join courses" on public.course_memberships
  for insert with check (auth.uid() = user_id);

create policy "Users can leave courses" on public.course_memberships
  for delete using (auth.uid() = user_id);

create policy "Members can view items for their joined courses" on public.schedule_items
  for select using (
    exists (
      select 1 from public.course_memberships cm
      where cm.course_id = schedule_items.course_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Admins can manage schedule items" on public.schedule_items
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Users manage their own push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row whenever someone signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed your 3 courses
insert into public.courses (name, term) values
  ('Software Engineering', 'Summer 2026'),
  ('Multivariable Calculus', 'Summer 2026'),
  ('Civics and Community Engagement', 'Summer 2026');
