const cfg=window.KENZZ_SUPABASE_CONFIG||{};
const db=window.supabase?.createClient(cfg.url,cfg.publishableKey);
const $=id=>document.getElementById(id);
let role="user", currentUser=null;
const say=t=>$("notice").textContent=t;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function canManage(){return role==="owner"||role==="admin"}
async function init(){
 if(!db){say("Konfigurasi Supabase tidak ditemukan. Periksa supabase-config.js.");return}
 const {data:{session}}=await db.auth.getSession();
 if(!session){say("Silakan login terlebih dahulu di website utama, lalu buka panel ini.");return}
 currentUser=session.user;
 const {data:profile,error}=await db.from("profiles").select("display_name,role").eq("id",currentUser.id).maybeSingle();
 if(error){say("Tabel profiles belum siap. Jalankan admin-setup.sql di Supabase SQL Editor. Detail: "+error.message);return}
 role=profile?.role||"user";
 if(!["owner","admin"].includes(role)){say("Akses ditolak. Akun ini bukan Owner/Admin. Buat profil dulu lalu tetapkan role Owner lewat SQL Editor.");return}
 $("who").textContent=(profile?.display_name||currentUser.email)+" • "+role.toUpperCase();
 $("roleLabel").textContent=role.toUpperCase(); $("panel").hidden=false; say("Panel siap.");
 await Promise.all([loadStats(),loadUsers(),loadPrompts(),loadAI(),loadSettings()]);
}
async function loadStats(){
 const [u,a,p]=await Promise.all([
 db.from("profiles").select("id",{count:"exact",head:true}),
 db.from("ai_history").select("id",{count:"exact",head:true}),
 db.from("admin_prompts").select("id",{count:"exact",head:true})
 ]);
 $("usersCount").textContent=u.error?"—":u.count;
 $("aiCount").textContent=a.error?"—":a.count;
 $("promptCount").textContent=p.error?"—":p.count;
}
async function loadUsers(){
 const box=$("usersList");
 if(role!=="owner"){box.innerHTML="<p class='muted'>Daftar dan perubahan role hanya tersedia untuk Owner.</p>";return}
 const {data,error}=await db.from("profiles").select("id,display_name,role,created_at").order("created_at",{ascending:false}).limit(200);
 if(error){box.textContent=error.message;return}
 box.innerHTML=(data||[]).map(u=>`<div class="row"><div><strong>${esc(u.display_name)}</strong><small>${esc(u.id)} · ${esc(u.role)}</small></div><div><select id="role-${u.id}"><option value="user" ${u.role==="user"?"selected":""}>User</option><option value="admin" ${u.role==="admin"?"selected":""}>Admin</option><option value="owner" ${u.role==="owner"?"selected":""}>Owner</option></select><button onclick="changeRole('${u.id}')">Simpan role</button></div></div>`).join("")||"Belum ada pengguna.";
}
window.changeRole=async id=>{
 if(role!=="owner"){say("Hanya Owner yang boleh mengubah role.");return}
 const next=$("role-"+id).value;
 if(id===currentUser.id && next!=="owner"){say("Jangan turunkan role akun Owner yang sedang dipakai.");return}
 if(!confirm("Ubah role akun ini menjadi "+next+"?"))return;
 const {error}=await db.from("profiles").update({role:next}).eq("id",id);
 say(error?"Gagal mengubah role: "+error.message:"Role berhasil diperbarui.");
 await loadUsers(); await loadStats();
};
async function loadPrompts(){
 const {data,error}=await db.from("admin_prompts").select("*").order("created_at",{ascending:false}).limit(100);
 if(error){$("promptList").textContent=error.message;return}
 $("promptList").innerHTML=(data||[]).map(p=>`<div class="row"><div><strong>${esc(p.title)}</strong><small>${esc(p.category)} · ${p.is_published?"Publik":"Draft"}</small><p>${esc(p.prompt.slice(0,180))}</p></div><div><button onclick="editPrompt('${p.id}')">Edit</button> <button class="secondary" onclick="deletePrompt('${p.id}')">Hapus</button></div></div>`).join("")||"Belum ada prompt.";
}
window.editPrompt=async id=>{const {data,error}=await db.from("admin_prompts").select("*").eq("id",id).single();if(error){say(error.message);return}$("promptId").value=data.id;$("promptTitle").value=data.title;$("promptCategory").value=data.category;$("promptBody").value=data.prompt;$("promptPublished").checked=data.is_published;document.querySelector('[data-tab="prompts"]').click();window.scrollTo({top:0,behavior:"smooth"})};
window.deletePrompt=async id=>{if(!confirm("Hapus prompt ini?"))return;const {error}=await db.from("admin_prompts").delete().eq("id",id);say(error?error.message:"Prompt dihapus.");loadPrompts();loadStats()};
$("promptForm").addEventListener("submit",async e=>{e.preventDefault();const payload={title:$("promptTitle").value.trim(),category:$("promptCategory").value.trim()||"Umum",prompt:$("promptBody").value.trim(),is_published:$("promptPublished").checked,updated_at:new Date().toISOString()};const id=$("promptId").value;const result=id?await db.from("admin_prompts").update(payload).eq("id",id):await db.from("admin_prompts").insert(payload);if(result.error){say("Gagal menyimpan prompt: "+result.error.message);return}say("Prompt tersimpan.");$("promptForm").reset();$("promptId").value="";loadPrompts();loadStats()});
$("resetPrompt").onclick=()=>{$("promptForm").reset();$("promptId").value=""};
async function loadAI(){
 const {data,error}=await db.from("ai_history").select("mode,category,created_at,user_id").order("created_at",{ascending:false}).limit(50);
 if(error){$("aiList").textContent="Riwayat AI belum tersedia: "+error.message;return}
 $("aiList").innerHTML=(data||[]).map(a=>`<div class="row"><div><strong>${esc(a.mode)} · ${esc(a.category)}</strong><small>${esc(new Date(a.created_at).toLocaleString("id-ID"))} · akun ${esc(a.user_id.slice(0,8))}…</small></div></div>`).join("")||"Belum ada riwayat AI.";
}
async function loadSettings(){
 const {data,error}=await db.from("site_settings").select("key,value");
 if(error){$("settingsList").textContent=error.message;return}
 const m=Object.fromEntries((data||[]).map(x=>[x.key,x.value]));
 $("siteName").value=m.site_name||"Prompt by Kenzz";$("announcement").value=m.announcement||"";$("siteStatus").value=m.site_status||"online";
 $("settingsList").textContent="Pengaturan tersimpan: "+(data||[]).length;
 if(role!=="owner"){$("settingsForm").querySelectorAll("input,textarea,select,button").forEach(x=>x.disabled=true)}
}
$("settingsForm").addEventListener("submit",async e=>{e.preventDefault();if(role!=="owner"){say("Hanya Owner yang boleh mengubah pengaturan.");return}
 const rows=[{key:"site_name",value:$("siteName").value.trim()},{key:"announcement",value:$("announcement").value.trim()},{key:"site_status",value:$("siteStatus").value}];
 for(const item of rows){const {error}=await db.from("site_settings").upsert({...item,updated_at:new Date().toISOString()},{onConflict:"key"});if(error){say("Gagal menyimpan pengaturan: "+error.message);return}}
 say("Pengaturan website tersimpan.");loadSettings();
});
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll("section").forEach(x=>x.classList.toggle("active",x.id===b.dataset.tab))}));
$("home").onclick=()=>location.href="index.html";
$("logout").onclick=async()=>{await db?.auth.signOut();location.href="index.html"};
init();
