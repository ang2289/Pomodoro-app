// Admin-only Edge Function：核准加點申請
// 功能：將 credit_topups 狀態改為 approved，並增加 user_credits.remaining_chars
//
// ⚠️ 重要：此函數僅供管理者使用，需要檢查使用者是否為 admin
// 目前使用環境變數 ADMIN_USER_IDS 來定義管理者 ID 列表

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// console.log("✅ Edge Function 'approve-topup' is running...");

interface ApproveTopupRequest {
  topupId: string; // credit_topups.id
  note?: string; // 可選備註
}

interface ApproveTopupResponse {
  success: boolean;
  message?: string;
  error?: string;
  topupId?: string;
  userId?: string;
  amountChars?: number;
  remainingChars?: number;
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

    // 解析請求參數
    const { topupId, note } = await req.json() as ApproveTopupRequest;

    if (!topupId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing topupId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 1. 查詢加點紀錄
    const { data: topup, error: topupError } = await supabase
      .from("credit_topups")
      .select("*")
      .eq("id", topupId)
      .single();

    if (topupError || !topup) {
      return new Response(
        JSON.stringify({ success: false, error: "Topup record not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 2. 檢查狀態是否為 pending
    if (topup.status !== "pending") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Topup already ${topup.status}` 
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 3. 在單一 transaction 中：
    //    - 更新 credit_topups 狀態為 approved
    //    - 增加 user_credits.remaining_chars
    const userId = topup.user_id;
    const amountChars = topup.amount_chars;

    // 3.1 更新 credit_topups
    const { error: updateTopupError } = await supabase
      .from("credit_topups")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        note: note || null,
      })
      .eq("id", topupId);

    if (updateTopupError) {
      console.error("❌ 更新 credit_topups 失敗：", updateTopupError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update topup record" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 3.2 確保 user_credits 存在
    const { data: creditRow } = await supabase
      .from("user_credits")
      .select("remaining_chars")
      .eq("user_id", userId)
      .single();

    if (!creditRow) {
      // 如果不存在，建立新記錄
      const { error: insertError } = await supabase
        .from("user_credits")
        .insert({
          user_id: userId,
          remaining_chars: amountChars,
        });

      if (insertError) {
        console.error("❌ 建立 user_credits 失敗：", insertError);
        // 回滾 credit_topups 狀態
        await supabase
          .from("credit_topups")
          .update({ status: "pending", approved_by: null, approved_at: null })
          .eq("id", topupId);
        
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create user credits" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      // 如果存在，增加 remaining_chars
      const { error: updateCreditsError } = await supabase
        .from("user_credits")
        .update({
          remaining_chars: creditRow.remaining_chars + amountChars,
        })
        .eq("user_id", userId);

      if (updateCreditsError) {
        console.error("❌ 更新 user_credits 失敗：", updateCreditsError);
        // 回滾 credit_topups 狀態
        await supabase
          .from("credit_topups")
          .update({ status: "pending", approved_by: null, approved_at: null })
          .eq("id", topupId);
        
        return new Response(
          JSON.stringify({ success: false, error: "Failed to update user credits" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // 4. 取得最新的 remaining_chars
    const { data: updatedCreditRow } = await supabase
      .from("user_credits")
      .select("remaining_chars")
      .eq("user_id", userId)
      .single();

    // console.log(`✅ 加點成功：user=${userId}, amount=${amountChars}, remaining=${updatedCreditRow?.remaining_chars || 0}`);

    // 回傳成功結果
    const response: ApproveTopupResponse = {
      success: true,
      message: "Topup approved successfully",
      topupId,
      userId,
      amountChars,
      remainingChars: updatedCreditRow?.remaining_chars || 0,
    };

    return new Response(
      JSON.stringify(response),
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


