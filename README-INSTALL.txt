PROMPT BY KENZZ — ADMIN ADD-ON
Files:
- admin.html
- admin.js
- admin-setup.sql

INSTALL VIA ANDROID:
1. Make a backup/download ZIP of the current GitHub repository first.
2. Upload admin.html and admin.js into the SAME repository root as index.html and script.js.
3. Supabase Dashboard > SQL Editor > New query. Paste all of admin-setup.sql and Run.
4. Create/login to the account you want as Owner on the existing website.
5. Supabase > Authentication > Users: copy that account's UUID.
6. Supabase > SQL Editor > New query, run (replace UUID):
   update public.profiles set role = 'owner' where id = 'YOUR-UUID-HERE';
7. Open the website and login with that account, then visit /admin.html.
8. To make an Admin, create that person's account first, then Owner can set their role from Admin > Pengguna.

IMPORTANT:
- Never put service_role or Gemini API keys in frontend files.
- This add-on uses your existing supabase-config.js and ai_history table.
- Run the SQL only in the Supabase project already used by Prompt by Kenzz.
- Keep a backup. If profiles table already exists with a different schema, stop and send the SQL error rather than altering existing tables blindly.
- Role changes are protected by RLS; only owner role can update profiles. New users default to user.
