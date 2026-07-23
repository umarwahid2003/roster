-- Run this script in your Supabase SQL Editor to add the materials feature

-- 1. Create the course_materials table
create table public.course_materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  file_path text not null,
  created_at timestamptz not null default now()
);

-- 2. Enable RLS on the new table
alter table public.course_materials enable row level security;

-- 2.5. Grant permissions to Supabase API roles
grant all on public.course_materials to anon, authenticated, service_role;

-- 3. Policy: Admins can manage materials
create policy "Admins can manage course materials" on public.course_materials
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 4. Policy: Members can view materials for their joined courses
create policy "Members can view materials for their joined courses" on public.course_materials
  for select using (
    exists (
      select 1 from public.course_memberships cm
      where cm.course_id = course_materials.course_id
      and cm.user_id = auth.uid()
    )
  );

-- 5. Create a Storage Bucket for materials
insert into storage.buckets (id, name, public) values ('materials', 'materials', true);

-- 6. Storage Policy: Admins can manage materials bucket
create policy "Admins can manage materials bucket"
  on storage.objects for all
  using ( bucket_id = 'materials' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') )
  with check ( bucket_id = 'materials' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );

-- 7. Storage Policy: Anyone can read materials bucket
create policy "Anyone can read materials bucket"
  on storage.objects for select
  using ( bucket_id = 'materials' );
