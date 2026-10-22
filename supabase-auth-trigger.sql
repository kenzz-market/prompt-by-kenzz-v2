-- Jalankan satu kali di Supabase SQL Editor setelah schema awal berhasil.
-- Profil baru selalu dibuat dengan role 'user'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Creator'),
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Jangan berikan pengguna izin untuk mengubah kolom role.
-- Untuk menetapkan admin, lakukan manual sebagai pemilik project setelah akun dibuat:
-- update public.profiles set role = 'admin' where id = 'UUID_PENGGUNA';
