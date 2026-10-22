-- Jalankan di Supabase SQL Editor.
create table if not exists public.ai_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('generate','enhance','chat')),
  category text not null default 'Umum',
  input_text text not null default '',
  output_text text not null,
  created_at timestamptz not null default now()
);
alter table public.ai_history enable row level security;
drop policy if exists "Users read own AI history" on public.ai_history;
create policy "Users read own AI history"
on public.ai_history for select to authenticated
using ((select auth.uid()) = user_id);
drop policy if exists "Users add own AI history" on public.ai_history;
create policy "Users add own AI history"
on public.ai_history for insert to authenticated
with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own AI history" on public.ai_history;
create policy "Users delete own AI history"
on public.ai_history for delete to authenticated
using ((select auth.uid()) = user_id);
grant select, insert, delete on public.ai_history to authenticated;
