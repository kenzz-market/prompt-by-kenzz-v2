const CATEGORIES = ["Gambar AI","Anime","Website","Coding","Banner & Desain","Menulis","Video","Bisnis"];
const seedPrompts = [
 {id:"p1",title:"Portrait Anime Cinematic",category:"Anime",icon:"✧",description:"Potret karakter anime dengan pencahayaan sinematik dan detail premium.",prompt:"Create a premium anime character portrait of [SUBJECT], expressive eyes, refined line art, cinematic rim lighting, atmospheric background, rich yet balanced colors, intricate hair details, professional anime key visual, beautiful composition, ultra-detailed, 4K quality. Avoid distorted anatomy, extra fingers, blurry details, and text artifacts."},
 {id:"p2",title:"Fantasy Character Art",category:"Gambar AI",icon:"✦",description:"Ilustrasi karakter fantasi dengan suasana epik dan dramatis.",prompt:"Create an epic fantasy character illustration of [SUBJECT], elegant costume design, magical particles, dramatic volumetric lighting, layered atmospheric depth, intricate materials, painterly detail, balanced composition, premium concept art, high detail, 16:9 aspect ratio."},
 {id:"p3",title:"Website Landing Page Premium",category:"Website",icon:"⌘",description:"Konsep landing page modern untuk produk atau brand digital.",prompt:"Design a premium, responsive landing page for [BRAND OR PRODUCT]. Use a clear visual hierarchy, elegant typography, generous spacing, accessible contrast, polished components, a compelling hero section, feature cards, social proof, and a strong call to action. Include mobile-first layouts, hover states, and consistent design tokens. Keep the interface fast, intuitive, and production-minded."},
 {id:"p4",title:"Clean JavaScript Helper",category:"Coding",icon:"{ }",description:"Bantu menyusun kode yang rapi, mudah dipahami, dan teruji.",prompt:"Act as a senior JavaScript developer. Build a clean, maintainable solution for [TASK]. Explain assumptions, provide complete working code, handle edge cases and errors, use clear naming, and include concise comments only where useful. Avoid unnecessary dependencies. Finish with a short test checklist and setup instructions."},
 {id:"p5",title:"Luxury Social Banner",category:"Banner & Desain",icon:"▧",description:"Banner sosial media yang mewah, rapi, dan tetap mudah dibaca.",prompt:"Create a luxury social media banner for [BRAND], headline: [HEADLINE], supporting text: [DESCRIPTION]. Preserve the supplied subject exactly if an image is provided. Use sophisticated art direction, premium typography, strong hierarchy, cinematic lighting, refined textures, carefully controlled highlights, clean negative space, and platform-ready composition. Output ratio: 16:9. No watermark, no extra text, no collage."},
 {id:"p6",title:"Aesthetic Product Photo",category:"Gambar AI",icon:"◈",description:"Foto produk estetik dengan komposisi editorial profesional.",prompt:"Create an editorial product photograph of [PRODUCT], premium studio setup, soft directional lighting, realistic material textures, subtle shadows, thoughtful color palette, crisp focus on the product, clean background, refined commercial art direction, natural reflections, high-end campaign quality. Keep the product shape and branding consistent; no watermark."},
 {id:"p7",title:"Story Writing Assistant",category:"Menulis",icon:"✎",description:"Kerangka cerita dengan karakter, konflik, dan alur yang kuat.",prompt:"Help me develop a compelling story about [IDEA]. First establish the protagonist's goal, motivation, flaw, and stakes. Build a clear conflict, meaningful character choices, escalating tension, and a satisfying resolution. Use vivid but economical prose, natural dialogue, and consistent point of view. Ask clarifying questions only if essential; otherwise state assumptions and draft an outline."},
 {id:"p8",title:"Short-Form Video Concept",category:"Video",icon:"▷",description:"Ide video pendek dengan hook dan alur visual yang jelas.",prompt:"Develop a short-form video concept about [TOPIC] for [AUDIENCE]. Provide a compelling first-2-second hook, a simple scene-by-scene plan, camera framing, motion, on-screen text, sound direction, pacing, and a clear ending or call to action. Keep it visually distinctive, feasible to produce, and optimized for vertical 9:16 viewing."},
 {id:"p9",title:"Cyberpunk Night City",category:"Gambar AI",icon:"⌁",description:"Kota futuristik dengan neon, kabut, dan nuansa malam.",prompt:"A cinematic cyberpunk night city featuring [SUBJECT], luminous violet and electric blue neon, rain-soaked reflective streets, atmospheric fog, layered signs, dramatic perspective, intricate architecture, controlled bloom, filmic contrast, realistic reflections, premium sci-fi concept art, high detail, 16:9 wide composition. No watermark or random lettering."},
 {id:"p10",title:"Brand Strategy Starter",category:"Bisnis",icon:"↗",description:"Susun strategi brand yang terarah dan mudah dieksekusi.",prompt:"Act as a practical brand strategist. Create a focused brand starter plan for [BUSINESS] targeting [AUDIENCE]. Include positioning, customer problem, value proposition, brand personality, three messaging pillars, differentiators, content ideas, and a 30-day action plan. Make recommendations specific, realistic, measurable, and suitable for a small team with limited budget."},
 {id:"p11",title:"Minimal Portfolio UI",category:"Website",icon:"▦",description:"Desain portfolio minimalis untuk kreator atau developer.",prompt:"Design a refined, minimalist portfolio website for [CREATOR NAME], showcasing [SPECIALTY]. Use a calm neutral palette with one accent color, excellent typography, spacious layouts, accessible navigation, selected project cards, concise biography, skills, contact section, responsive behavior, and subtle motion. Prioritize clarity, speed, and a memorable first impression."},
 {id:"p12",title:"Anime Birthday Poster",category:"Banner & Desain",icon:"♡",description:"Poster ulang tahun karakter anime yang elegan dan meriah.",prompt:"Create an elegant anime birthday poster featuring [CHARACTER], celebratory yet tasteful atmosphere, premium typography, delicate sparkles, layered lighting, coordinated colors, beautiful framing, refined decorative details, clear space for the birthday message, and polished composition. Aspect ratio 9:16. Keep the character recognizable, avoid clutter, avoid watermark, and do not create a collage."}
];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const store = {
 get(key, fallback){try{const v=localStorage.getItem("kenzz_"+key);return v?JSON.parse(v):fallback}catch{return fallback}},
 set(key,val){try{localStorage.setItem("kenzz_"+key,JSON.stringify(val))}catch{toast("Penyimpanan browser penuh. Ekspor backup atau hapus data lama.")}}
};
let userPrompts=store.get("userPrompts",[]), favorites=store.get("favorites",[]), userSession=store.get("session",null), showFavorites=false, generatedText="";

let supabaseClient=null;
const supaCfg=window.KENZZ_SUPABASE_CONFIG||{};
if(window.supabase && supaCfg.url && supaCfg.publishableKey && !supaCfg.url.includes("PASTE_") && !supaCfg.publishableKey.includes("PASTE_")) {
  supabaseClient=window.supabase.createClient(supaCfg.url,supaCfg.publishableKey);
}
let aiMode="generate", aiResultText="", aiChatHistory=[];
const allPrompts=()=>[...seedPrompts,...userPrompts];

function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2300)}
function saveUserData(){store.set("userPrompts",userPrompts);store.set("favorites",favorites)}
function populateCategories(){const sel=$("#categoryFilter");CATEGORIES.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;sel.appendChild(o)});$("#categoryChips").innerHTML=["Semua",...CATEGORIES].map(c=>`<button class="chip ${c==="Semua"?"active":""}" data-cat="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join("")}
function renderPrompts(){const query=$("#searchInput").value.toLowerCase().trim(),cat=$("#categoryFilter").value;const filtered=allPrompts().filter(p=>(cat==="Semua"||p.category===cat)&&(!showFavorites||favorites.includes(p.id))&&[p.title,p.description,p.prompt,p.category].join(" ").toLowerCase().includes(query));$("#promptGrid").innerHTML=filtered.map(p=>`<article class="prompt-card"><div class="card-top"><span class="category-tag">${escapeHTML(p.category)}</span><button class="favorite-button ${favorites.includes(p.id)?"is-favorite":""}" data-fav="${escapeHTML(p.id)}" aria-label="Toggle favorit">${favorites.includes(p.id)?"♥":"♡"}</button></div><div class="card-icon">${escapeHTML(p.icon||"✦")}</div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description||p.prompt)}</p><div class="card-footer"><span>${p.prompt.trim().split(/\s+/).length} kata · prompt</span><button class="copy-button" data-copy="${escapeHTML(p.id)}">▣ Salin prompt</button></div></article>`).join("");$("#resultCount").textContent=filtered.length;$("#statPrompts").textContent=allPrompts().length;$("#emptyLibrary").classList.toggle("hidden",filtered.length>0);$("#promptGrid").classList.toggle("hidden",filtered.length===0);$$(".chip").forEach(b=>b.classList.toggle("active",b.dataset.cat===cat));if(cat==="Semua")$$(".chip").forEach(b=>b.classList.toggle("active",b.dataset.cat==="Semua"));else $$(".chip").forEach(b=>b.classList.toggle("active",b.dataset.cat===cat))}
function renderPersonal(){const favs=allPrompts().filter(p=>favorites.includes(p.id));$("#favoriteList").innerHTML=favs.length?favs.map(p=>compactItem(p,"favorite")).join(""):'<p class="muted">Belum ada favorit. Tekan ikon ♡ pada kartu prompt.</p>';$("#userPromptList").innerHTML=userPrompts.length?userPrompts.map(p=>compactItem(p,"user")).join(""):'<p class="muted">Belum ada prompt buatanmu.</p>';$("#adminStatus").textContent=userSession?`Masuk sebagai ${userSession.name} · ${userSession.role==="admin"?"Admin demo":"Pengguna"}`:"Mode pengunjung · login demo tersedia";$("#loginOpen").textContent=userSession?userSession.name:"Login";$("#adminLogin").textContent=userSession?.role==="admin"?"Keluar dari mode admin":"Login admin demo"}
function compactItem(p,type){return `<div class="compact-item"><div><strong>${escapeHTML(p.title)}</strong><small>${escapeHTML(p.category)}</small></div><button data-openprompt="${escapeHTML(p.id)}">Lihat ↗</button>${type==="user"?`<button data-deleteprompt="${escapeHTML(p.id)}" aria-label="Hapus prompt">×</button>`:""}</div>`}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast("Prompt berhasil disalin!")}catch{const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");toast("Prompt berhasil disalin!")}catch{toast("Tidak bisa menyalin otomatis. Pilih teks dan salin manual.")}ta.remove()}}
function openModal(id){$("#"+id).classList.remove("hidden")}
function closeModal(id){$("#"+id).classList.add("hidden")}
async function addUserPrompt(title,category,prompt){if(supabaseClient&&userSession){const {data,error}=await supabaseClient.from("prompts").insert({user_id:userSession.id,title,category,content:prompt,description:prompt.slice(0,130),is_public:false}).select().single();if(error){toast("Gagal menyimpan online: "+error.message);return}userPrompts.unshift({id:"cloud_"+data.id,cloudId:data.id,title,category,prompt,description:prompt.slice(0,130),icon:"✎"});toast("Prompt tersimpan online.")}else{userPrompts.unshift({id:"u"+Date.now().toString(36),title,category,prompt,description:prompt.slice(0,130),icon:"✎",createdAt:new Date().toISOString()});toast("Prompt tersimpan di perangkat. Login untuk sinkronisasi online.")}saveUserData();renderPrompts();renderPersonal()}
function makePrompt(){const category=$("#genCategory").value,subject=$("#genSubject").value.trim(),style=$("#genStyle").value,detail=$("#genDetail").value,mood=$("#genMood").value.trim(),extra=$("#genExtra").value.trim();if(!subject){$("#genSubject").focus();toast("Isi subjek utama terlebih dahulu.");return}const detailText=detail==="Sangat detail"?"Include rich detail, deliberate composition, coherent visual hierarchy, polished execution, and carefully considered finishing touches.":detail==="Ringkas"?"Keep the result concise, clear, and focused on the most important details.":"Balance useful detail with clarity and a clean result.";generatedText=`Create a ${style.toLowerCase()} ${category.toLowerCase()} based on: ${subject}.\n${mood?`Mood or objective: ${mood}.\n`:""}${extra?`Additional requirements: ${extra}.\n`:""}${detailText}\nMake the result cohesive, high quality, purposeful, and suitable for its intended use. Avoid unnecessary clutter, low-quality details, and unintended artifacts.`;$("#outputCategory").textContent=category;$("#outputWords").textContent=generatedText.trim().split(/\s+/).length+" kata";$("#generatedPrompt").value=generatedText;$("#outputPlaceholder").classList.add("hidden");$("#outputContent").classList.remove("hidden");toast("Prompt berhasil dibuat.")}
function downloadText(filename,text){const blob=new Blob([text],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)}
function exportData(){const data={app:"Prompt by Kenzz",version:1,exportedAt:new Date().toISOString(),userPrompts,favorites};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="prompt-by-kenzz-backup.json";a.click();URL.revokeObjectURL(url);toast("Backup JSON siap diunduh.")}
populateCategories();renderPrompts();renderPersonal();
$("#searchInput").addEventListener("input",renderPrompts);$("#categoryFilter").addEventListener("change",renderPrompts);
$("#categoryChips").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;$("#categoryFilter").value=b.dataset.cat;renderPrompts()});
$("#favoritesOnly").addEventListener("click",()=>{showFavorites=!showFavorites;$("#favoritesOnly").textContent=showFavorites?"♥ Favorit aktif":"♡ Favorit";$("#favoritesOnly").classList.toggle("button-primary",showFavorites);renderPrompts();$("#library").scrollIntoView({behavior:"smooth"})});
$("#promptGrid").addEventListener("click",e=>{const fav=e.target.closest("[data-fav]"),copy=e.target.closest("[data-copy]");if(fav){const id=fav.dataset.fav;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];store.set("favorites",favorites);renderPrompts();renderPersonal()}if(copy){const p=allPrompts().find(x=>x.id===copy.dataset.copy);if(p)copyText(p.prompt)}});
$("#generatorForm").addEventListener("submit",e=>{e.preventDefault();makePrompt()});
$("#copyGenerated").addEventListener("click",()=>copyText($("#generatedPrompt").value));
$("#saveGenerated").addEventListener("click",()=>{if(!generatedText){toast("Buat prompt terlebih dahulu.");return}addUserPrompt($("#genSubject").value.trim().slice(0,55)||"Prompt Generator",$("#genCategory").value,generatedText);toast("Prompt tersimpan di Prompt Saya.")});
$("#downloadGenerated").addEventListener("click",()=>{if(!generatedText){toast("Buat prompt terlebih dahulu.");return}downloadText("prompt-by-kenzz.txt",$("#generatedPrompt").value)});
$("#addPromptOpen").addEventListener("click",()=>openModal("addPromptModal"));
$("#addPromptForm").addEventListener("submit",e=>{e.preventDefault();addUserPrompt($("#customTitle").value.trim(),$("#customCategory").value,$("#customText").value.trim());e.target.reset();closeModal("addPromptModal");toast("Prompt buatanmu berhasil disimpan.")});
$("#loginOpen").addEventListener("click",()=>openModal("loginModal"));
async function refreshAuth(){if(!supabaseClient){userSession=null;renderPersonal();return}const {data:{session},error}=await supabaseClient.auth.getSession();if(error){toast(error.message);return}userSession=session?.user?{id:session.user.id,email:session.user.email,name:session.user.user_metadata?.display_name||session.user.email}:null;renderPersonal()}
async function signInAccount(){if(!supabaseClient){toast("Konfigurasi Supabase belum benar.");return}const {data,error}=await supabaseClient.auth.signInWithPassword({email:$("#loginEmail").value.trim(),password:$("#loginPassword").value});if(error){toast(error.message);return}userSession={id:data.user.id,email:data.user.email,name:data.user.user_metadata?.display_name||data.user.email};closeModal("loginModal");renderPersonal();toast("Berhasil login.")}
async function signUpAccount(){if(!supabaseClient){toast("Konfigurasi Supabase belum benar.");return}const {data,error}=await supabaseClient.auth.signUp({email:$("#loginEmail").value.trim(),password:$("#loginPassword").value,options:{data:{display_name:$("#loginName").value.trim()||"Creator"}}});if(error){toast(error.message);return}if(data.session){userSession={id:data.user.id,email:data.user.email,name:$("#loginName").value.trim()||data.user.email};closeModal("loginModal");renderPersonal();toast("Akun berhasil dibuat.")}else toast("Akun dibuat. Periksa email konfirmasi lalu login.")}
$("#loginForm").addEventListener("submit",e=>{e.preventDefault();signInAccount()});
$("#signupSubmit").addEventListener("click",signUpAccount);
$("#logoutButton").addEventListener("click",async()=>{if(supabaseClient)await supabaseClient.auth.signOut();userSession=null;renderPersonal();closeModal("loginModal");toast("Keluar dari akun.")});
$("#adminLogin").addEventListener("click",()=>toast("Hak admin harus diatur aman di database, bukan lewat login publik."));
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
$$(".modal-backdrop").forEach(bg=>bg.addEventListener("click",e=>{if(e.target===bg)closeModal(bg.id)}));
$("#exportData").addEventListener("click",exportData);
$("#importData").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.userPrompts)||!Array.isArray(data.favorites))throw new Error("Format backup tidak cocok");userPrompts=data.userPrompts.filter(p=>p&&p.id&&p.title&&p.prompt);favorites=data.favorites.filter(id=>typeof id==="string");saveUserData();renderPrompts();renderPersonal();toast("Backup berhasil diimpor.")}catch(err){toast("File backup tidak valid atau rusak.")}e.target.value=""});
$("#clearUserData").addEventListener("click",()=>{if(!confirm("Hapus prompt buatan sendiri, favorit, dan sesi login dari browser ini? Prompt bawaan tidak akan dihapus."))return;userPrompts=[];favorites=[];userSession=null;saveUserData();store.set("session",null);renderPrompts();renderPersonal();toast("Data lokal sudah dihapus.")});
document.addEventListener("click",e=>{const open=e.target.closest("[data-openprompt]"),del=e.target.closest("[data-deleteprompt]");if(open){const p=allPrompts().find(x=>x.id===open.dataset.openprompt);if(p){$("#genCategory").value=p.category;$("#genSubject").value=p.title;$("#generatedPrompt").value=p.prompt;generatedText=p.prompt;$("#outputCategory").textContent=p.category;$("#outputWords").textContent=p.prompt.trim().split(/\s+/).length+" kata";$("#outputPlaceholder").classList.add("hidden");$("#outputContent").classList.remove("hidden");$("#generator").scrollIntoView({behavior:"smooth"})}}if(del){if(!confirm("Hapus prompt ini dari koleksi pribadi?"))return;userPrompts=userPrompts.filter(p=>p.id!==del.dataset.deleteprompt);favorites=favorites.filter(id=>id!==del.dataset.deleteprompt);saveUserData();renderPrompts();renderPersonal();toast("Prompt dihapus.")}});
$("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
$("#mainNav").addEventListener("click",e=>{if(e.target.closest("a"))$("#mainNav").classList.remove("open")});


// --- Kenzz AI Studio: calls a Supabase Edge Function; provider key stays server-side ---
const aiTitles={generate:["AI Prompt Generator","Ubah ide singkat menjadi prompt profesional.","Ide kamu","✦ Generate dengan AI"],enhance:["Prompt Enhancer","Tempel prompt lama untuk ditingkatkan.","Prompt yang ingin diperbaiki","↗ Enhance Prompt"],chat:["AI Assistant","Diskusikan ide dan prompt bersama AI.","Mulai percakapan dengan konteks atau pertanyaan","◉ Tanya AI"],history:["Riwayat AI","Riwayat tersimpan di akun Supabase kamu.","Riwayat tidak memerlukan input","◷ Muat Riwayat"]};
function setAiMode(mode){
  aiMode=mode;
  $$(".ai-tab").forEach(b=>b.classList.toggle("active",b.dataset.aiMode===mode));
  const t=aiTitles[mode];$("#aiModeTitle").textContent=t[0];$("#aiModeDesc").textContent=t[1];$("#aiInputLabel").firstChild.textContent=t[2];
  $("#aiCategoryWrap").classList.toggle("hidden",mode!=="generate");
  $("#aiInputLabel").classList.toggle("hidden",mode==="history");
  $("#aiSubmit").classList.toggle("hidden",mode==="chat"||mode==="history");
  $("#aiChatWrap").classList.toggle("hidden",mode!=="chat");
  $("#aiHistoryWrap").classList.toggle("hidden",mode!=="history");
  $("#aiResultWrap").classList.toggle("hidden",mode==="chat"||mode==="history"||!aiResultText);
  $("#aiResultEmpty").classList.toggle("hidden",mode==="chat"||mode==="history"||!!aiResultText);
  $("#aiSubmit").textContent=t[3];
  $("#aiResultTitle").textContent=mode==="enhance"?"Prompt yang disempurnakan":"Hasil AI";
  if(mode==="history")loadAiHistory();
  if(mode==="chat")renderChat();
}
async function invokeKenzzAI(mode,input,category="Umum",messages=[]){
  if(!supabaseClient){toast("Supabase belum dikonfigurasi. Periksa supabase-config.js.");return null}
  const {data:{session}}=await supabaseClient.auth.getSession();
  if(!session?.user){toast("Login atau buat akun terlebih dahulu untuk memakai AI.");openModal("loginModal");return null}
  $("#aiStatus").textContent="AI sedang memproses... Mohon tunggu.";
  $("#aiSubmit").disabled=true;
  try{
    const {data,error}=await supabaseClient.functions.invoke("kenzz-ai",{body:{mode,input,category,messages}});
    if(error)throw error;
    if(!data?.text)throw new Error(data?.error||"Respons AI kosong.");
    aiResultText=data.text;
    $("#aiResult").value=data.text;
    $("#aiResultWrap").classList.remove("hidden");$("#aiResultEmpty").classList.add("hidden");
    $("#aiStatus").textContent="Selesai. Hasil dibuat oleh AI sungguhan.";
    await saveAiHistory(mode,input,data.text,category);
    return data.text;
  }catch(err){
    $("#aiStatus").textContent="AI belum siap: "+(err.message||"periksa Edge Function dan provider key.");
    toast("AI gagal: "+(err.message||"periksa konfigurasi"));
    return null;
  }finally{$("#aiSubmit").disabled=false}
}
async function saveAiHistory(mode,input,output,category){
  if(!supabaseClient)return;
  const {data:{session}}=await supabaseClient.auth.getSession();if(!session?.user)return;
  const {error}=await supabaseClient.from("ai_history").insert({user_id:session.user.id,mode,category,input_text:input,output_text:output});
  if(error)console.warn("Riwayat AI tidak tersimpan:",error.message);
}
async function loadAiHistory(){
  const box=$("#aiHistoryList");
  if(!supabaseClient){box.innerHTML='<p class="muted">Konfigurasikan Supabase terlebih dahulu.</p>';return}
  const {data:{session}}=await supabaseClient.auth.getSession();
  if(!session?.user){box.innerHTML='<p class="muted">Login untuk melihat riwayat AI.</p>';return}
  box.innerHTML='<p class="muted">Memuat riwayat...</p>';
  const {data,error}=await supabaseClient.from("ai_history").select("id,mode,category,input_text,output_text,created_at").eq("user_id",session.user.id).order("created_at",{ascending:false}).limit(30);
  if(error){box.innerHTML='<p class="muted">Tabel riwayat belum siap. Jalankan ai-history.sql di Supabase SQL Editor.</p>';return}
  box.innerHTML=data.length?data.map(x=>`<div class="ai-history-row"><strong>${escapeHTML(x.mode.toUpperCase())} · ${escapeHTML(x.category||"Umum")}</strong><small>${escapeHTML(new Date(x.created_at).toLocaleString())}</small><p>${escapeHTML(x.output_text)}</p><button class="copy-button" data-history-copy="${escapeHTML(x.id)}">Salin hasil</button></div>`).join(""):'<p class="muted">Belum ada riwayat AI.</p>';
  window.__kenzzHistory=data;
}
function renderChat(){const box=$("#aiChatMessages");box.innerHTML=aiChatHistory.map(m=>`<div class="ai-chat-message ${m.role==="user"?"user":"assistant"}">${escapeHTML(m.content)}</div>`).join("");box.scrollTop=box.scrollHeight}
async function sendChat(){
  const input=$("#aiChatInput").value.trim();if(!input)return;
  aiChatHistory.push({role:"user",content:input});$("#aiChatInput").value="";renderChat();
  const reply=await invokeKenzzAI("chat",input,"Assistant",aiChatHistory.slice(-12));
  if(reply){aiChatHistory.push({role:"assistant",content:reply});renderChat()}
}
$$(".ai-tab").forEach(b=>b.addEventListener("click",()=>setAiMode(b.dataset.aiMode)));
$("#aiSubmit").addEventListener("click",async()=>{
  if(aiMode==="history"){await loadAiHistory();return}
  const input=$("#aiInput").value.trim();if(!input){toast("Isi ide atau prompt terlebih dahulu.");return}
  const category=$("#aiCategory").value;
  const text=await invokeKenzzAI(aiMode,input,category,[]);
  if(text)$("#aiResultTitle").textContent=aiMode==="enhance"?"Prompt yang disempurnakan":"Hasil AI";
});
$("#aiCopy").addEventListener("click",()=>copyText($("#aiResult").value));
$("#aiSave").addEventListener("click",()=>{if(!aiResultText){toast("Belum ada hasil AI.");return}addUserPrompt($("#aiCategory").value+" · AI",$("#aiCategory").value,aiResultText)});
$("#aiChatSend").addEventListener("click",sendChat);
$("#aiChatInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat()}});
document.addEventListener("click",e=>{const b=e.target.closest("[data-history-copy]");if(!b)return;const item=(window.__kenzzHistory||[]).find(x=>x.id===b.dataset.historyCopy);if(item)copyText(item.output_text)});

setAiMode('generate');

refreshAuth();
