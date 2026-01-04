// Admin-only Edge Function：查詢所有加點紀錄
// 功能：查詢所有 credit_topups 記錄，並包含使用者 email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// console.log("✅ Edge Function 'list-topups' is running...");

interface TopupRecord {
  id: string;
  user_id: string;
  amount_chars: number;
  amount_ntd: number;
  account_last_five: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

// 檢查是否為管理者（從環境變數讀取）
function isAdmin(userId: string): boolean {
  const adminUserIds = Deno.env.get("ADMIN_USER_IDS") || "";
  const adminList = adminUserIds.split(",").map(id => id.trim()).filter(id => id.length > 0);
  return adminList.includes(userId);
}

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // ✅ OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // 取得 Supabase 客戶端（使用 SERVICE_ROLE_KEY 以繞過 RLS）
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 取得請求者的使用者 ID（從 Authorization header）
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 使用 anon key 建立客戶端來驗證 token
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("VITE_SUPABASE_ANON_KEY");
    if (!supabaseAnonKey) {
      throw new Error("Supabase anon key not configured");
    }

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 檢查是否為管理者
    if (!isAdmin(user.id)) {
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden: Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 查詢所有加點紀錄
    const { data: topups, error: topupsError } = await supabase
      .from("credit_topups")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (topupsError) {
      console.error("❌ 查詢加點紀錄失敗：", topupsError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch topups" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 取得所有使用者 ID
    const userIds = [...new Set((topups || []).map(t => t.user_id))];

    // 批次查詢使用者 email
    const emailMap: Record<string, string> = {};
    for (const userId of userIds) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        if (userData?.user?.email) {
          emailMap[userId] = userData.user.email;
        }
      } catch (err) {
        // console.warn(`⚠️ 無法取得使用者 ${userId} 的 email：`, err);
      }
    }

    // 合併 email 資訊
    const topupsWithEmail: TopupRecord[] = (topups || []).map(t => ({
      ...t,
      user_email: emailMap[t.user_id] || '未知',
    }));

    return new Response(
      JSON.stringify({
        success: true,
        topups: topupsWithEmail,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("❌ 伺服器錯誤：", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "伺服器錯誤",
        message: error.message || "未知錯誤",
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});


