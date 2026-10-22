// Supabase Edge Function: kenzz-ai
// Set GEMINI_API_KEY as a Supabase Function secret. Never put it in frontend files.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("Server belum dikonfigurasi: GEMINI_API_KEY belum disetel.");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Login diperlukan untuk memakai AI." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Sesi login tidak valid. Silakan login ulang." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const mode = String(body.mode || "generate");
    const input = String(body.input || "").trim().slice(0, 6000);
    const category = String(body.category || "Umum").slice(0, 80);
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12).map((m: any) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: String(m.content || "").slice(0, 3000) }] })) : [];
    if (!input && mode !== "chat") return new Response(JSON.stringify({ error: "Input tidak boleh kosong." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let instruction = "";
    if (mode === "generate") {
      instruction = `Kamu adalah Kenzz AI, ahli prompt engineering. Buat satu prompt yang spesifik, kreatif, terstruktur, siap disalin, dan sesuai kategori ${category}. Kembangkan ide pengguna tanpa mengubah maksud utamanya. Jika kategori gambar, pertimbangkan subjek, komposisi, pencahayaan, warna, gaya, detail, rasio aspek, dan negative constraints jika sesuai. Jawab dalam bahasa yang paling cocok dengan prompt tujuan (biasanya English untuk generator gambar), tanpa pembukaan panjang. Ide pengguna: ${input}`;
    } else if (mode === "enhance") {
      instruction = `Kamu adalah Kenzz AI, editor prompt profesional. Tingkatkan prompt berikut agar lebih jelas, terarah, kaya detail relevan, dan efektif. Pertahankan tujuan pengguna, hapus ambiguitas, jangan menambah klaim yang tidak diperlukan. Kembalikan prompt final saja, siap disalin. Prompt asli: ${input}`;
    } else if (mode === "chat") {
      instruction = "Kamu adalah Kenzz AI Assistant, ramah dan ahli menyusun serta memperbaiki prompt. Bantu pengguna mengembangkan ide dan jawab pertanyaan dengan jelas. Jika cocok, berikan prompt final yang siap disalin. Jangan mengaku melakukan aksi yang tidak kamu lakukan.";
    } else {
      return new Response(JSON.stringify({ error: "Mode AI tidak dikenal." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const chatMessages = messages.length && messages[messages.length - 1]?.parts?.[0]?.text === input
      ? messages
      : [...messages, { role: "user", parts: [{ text: input }] }];
    const contents = mode === "chat" && messages.length
      ? chatMessages
      : mode === "chat"
        ? [{ role: "user", parts: [{ text: instruction }] }]
        : [{ role: "user", parts: [{ text: instruction }] }];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: mode === "enhance" ? 0.45 : 0.75, maxOutputTokens: 1800 },
        systemInstruction: { parts: [{ text: "You are Kenzz AI for prompt creation. Be useful, safe, concise, and focused on the user's request." }] }
      })
    });
    const result = await response.json();
    if (!response.ok) {
      const msg = result?.error?.message || `Provider AI error (${response.status})`;
      return new Response(JSON.stringify({ error: msg }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const text = result?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("").trim();
    if (!text) throw new Error("Provider AI tidak mengembalikan teks.");
    return new Response(JSON.stringify({ text, mode, category }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Terjadi kesalahan pada AI." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
