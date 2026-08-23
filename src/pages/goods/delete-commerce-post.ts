import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "ang2289@yahoo.com.tw";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const adminEmail = String(req.headers["x-rxv-admin-email"] || "").trim().toLowerCase();
  if (adminEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ ok: false, error: "沒有刪除權限" });
  }

  const slug = String(req.query.slug || req.body?.slug || "").trim();
  if (!slug) {
    return res.status(400).json({ ok: false, error: "缺少 slug" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(500).json({ ok: false, error: "缺少 Supabase 環境變數" });
  }

  const { data, error } = await supabase
    .from("shopee_video_posts")
    .delete()
    .eq("product_slug", slug)
    .select("id,product_slug");

  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.status(200).json({ ok: true, deletedCount: data?.length || 0 });
}
