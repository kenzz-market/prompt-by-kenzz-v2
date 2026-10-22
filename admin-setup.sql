-- Prompt by Kenzz: role + admin tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Creator',
  role text not null default 'user' check (role in ('user','admin','owner')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.current_kenzz_role()
returns text language sql stable security definer
set search_path = '' as $$
  select coalesce((select p.role from public.profiles p where p.id = (select auth.uid())), 'user');
$$;
revoke all on function public.current_kenzz_role() from public;
grant execute on function public.current_kenzz_role() to authenticated;

drop policy if exists "profile self read" on public.profiles;
create policy "profile self read" on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.current_kenzz_role() in ('admin','owner'));
drop policy if exists "owner update profiles" on public.profiles;
create policy "owner update profiles" on public.profiles for update to authenticated
using (public.current_kenzz_role() = 'owner')
with check (role in ('user','admin','owner'));
-- users must not insert/update their own role from browser
drop policy if exists "profile self insert" on public.profiles;
create policy "profile self insert" on public.profiles for insert to authenticated
with check (id = (select auth.uid()) and role = 'user');

create or replace function public.kenzz_new_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id, display_name, role)
 values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name','Creator'), 'user')
 on conflict (id) do nothing;
 return new;
end; $$;
drop trigger if exists kenzz_new_profile_trigger on auth.users;
create trigger kenzz_new_profile_trigger after insert on auth.users
for each row execute procedure public.kenzz_new_profile();

create table if not exists public.admin_prompts (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 category text not null default 'Umum',
 prompt text not null,
 is_published boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.admin_prompts enable row level security;
drop policy if exists "published prompts public read" on public.admin_prompts;
create policy "published prompts public read" on public.admin_prompts for select to anon, authenticated
using (is_published = true or public.current_kenzz_role() in ('admin','owner'));
drop policy if exists "admin prompt insert" on public.admin_prompts;
create policy "admin prompt insert" on public.admin_prompts for insert to authenticated
with check (public.current_kenzz_role() in ('admin','owner'));
drop policy if exists "admin prompt update" on public.admin_prompts;
create policy "admin prompt update" on public.admin_prompts for update to authenticated
using (public.current_kenzz_role() in ('admin','owner'))
with check (public.current_kenzz_role() in ('admin','owner'));
drop policy if exists "admin prompt delete" on public.admin_prompts;
create policy "admin prompt delete" on public.admin_prompts for delete to authenticated
using (public.current_kenzz_role() in ('admin','owner'));

create table if not exists public.site_settings (
 key text primary key,
 value text not null default '',
 updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "owner settings insert" on public.site_settings;
create policy "owner settings insert" on public.site_settings for insert to authenticated
with check (public.current_kenzz_role() = 'owner');
drop policy if exists "owner settings update" on public.site_settings;
create policy "owner settings update" on public.site_settings for update to authenticated
using (public.current_kenzz_role() = 'owner') with check (public.current_kenzz_role() = 'owner');

grant select, insert, update, delete on public.admin_prompts to authenticated;
grant select on public.admin_prompts to anon;
grant select on public.profiles to authenticated;
grant insert on public.profiles to authenticated;
grant update on public.profiles to authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;

-- IMPORTANT: after signing up, set the real owner UUID manually in SQL Editor:
-- update public.profiles set role = 'owner' where id = 'YOUR-AUTH-USER-UUID';
-- Never let the browser decide who is owner.
