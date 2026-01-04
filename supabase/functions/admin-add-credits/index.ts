// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 解析請求參數：支援 targetUserId 或 email
    const { targetUserId, email, addCredits, note } = await req.json();

    // 驗證必要參數
    if (!addCredits || typeof addCredits !== 'number' || addCredits <= 0) {
      return json({ error: "Missing or invalid addCredits. Must be a positive number." }, 400);
    }

    // 驗證至少提供 targetUserId 或 email 其中一個
    if (!targetUserId && !email) {
      return json({ error: "Missing targetUserId or email. At least one must be provided." }, 400);
    }

    // 1️⃣ 取得 user_id（優先使用 targetUserId，否則從 email 查詢）
    let userId: string;

    if (targetUserId) {
      // 直接使用提供的 targetUserId
      userId = targetUserId;
      
      // 驗證 user_id 是否存在（可選，但建議驗證）
      const { data: userRes, error: userErr } = await supabase.auth.admin.getUserById(userId);
      if (userErr || !userRes?.user) {
        return json({ error: "User not found with provided targetUserId" }, 404);
      }
    } else if (email) {
      // 由 Email 找 Auth User（使用 listUsers）
      const { data, error } = await supabase.auth.admin.listUsers({
        email,
        perPage: 1
      });

      if (error || !data?.users?.length) {
        return json({ error: "User not found with provided email" }, 404);
      }

      userId = data.users[0].id;
    } else {
      // 理論上不會執行到這裡（前面已檢查），但為了型別安全保留
      return json({ error: "Missing targetUserId or email" }, 400);
    }

    // 2️⃣ 取得 / 建立 user_credits
    const { data: creditRow } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!creditRow) {
      await supabase.from("user_credits").insert({
        user_id: userId,
        total_credits: addCredits,
        used_credits: 0,
        remaining_chars: addCredits,
      });
    } else {
      await supabase
        .from("user_credits")
        .update({
          total_credits: creditRow.total_credits + addCredits,
          remaining_chars: creditRow.remaining_chars + addCredits,
        })
        .eq("user_id", userId);
    }

    // 3️⃣ 紀錄補點 log
    await supabase.from("credit_usage_logs").insert({
      user_id: userId,
      change: addCredits,
      type: "ADMIN_ADD",
      note: note ?? "manual top-up",
    });

    return json({
      status: "success",
      user_id: userId,
      addCredits,
      message: `Successfully added ${addCredits} credits to user ${userId}`,
    });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
