-- Run this entire file in Supabase SQL Editor.
-- It creates Auth-linked registration data, a private photo bucket, RLS,
-- and policies that let each signed-in registrant modify only their own row/file.

create table if not exists public.registrations (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 100),
  gender text not null check (gender in ('Male','Female','Non-binary','Prefer not to say')),
  date_of_birth date not null,
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  preferred_branch text not null check (preferred_branch in ('Mechanical Engineering','Computer Science')),
  message text check (message is null or char_length(message) <= 1000),
  photo_path text,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

revoke all on public.registrations from anon;
grant select, insert, update on public.registrations to authenticated;

drop policy if exists "registrants can read their own registration" on public.registrations;
create policy "registrants can read their own registration"
on public.registrations for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "registrants can update their own registration" on public.registrations;
create policy "registrants can update their own registration"
on public.registrations for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- The trigger copies registration metadata from Auth into the app table.
create or replace function public.handle_new_registration()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.registrations (
    id, full_name, gender, date_of_birth, phone, preferred_branch
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'gender', 'Prefer not to say'),
    (new.raw_user_meta_data ->> 'date_of_birth')::date,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'preferred_branch', 'Computer Science')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_registration on auth.users;
create trigger on_auth_user_created_registration
after insert on auth.users
for each row execute procedure public.handle_new_registration();

-- Private bucket for registration pictures.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'registration-photos',
  'registration-photos',
  false,
  15728640,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 15728640,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "registrants can upload their own photo" on storage.objects;
create policy "registrants can upload their own photo"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'registration-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "registrants can view their own photo" on storage.objects;
create policy "registrants can view their own photo"
on storage.objects for select
to authenticated
using (
  bucket_id = 'registration-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "registrants can delete their own photo" on storage.objects;
create policy "registrants can delete their own photo"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'registration-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
