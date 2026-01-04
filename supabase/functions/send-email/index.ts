// 發送 Email 通知的 Edge Function
// 用於補點完成後通知使用者

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

    // 解析請求參數
    const { email, plan_id, credits_added } = await req.json();

    // 驗證必要參數
    if (!email || !plan_id || !credits_added) {
      return json(
        { error: "Missing required parameters: email, plan_id, credits_added" },
        400
      );
    }

    // 方案名稱對應
    const planName = plan_id === "99" ? "標準方案 (NT$99)" : "進階方案 (NT$199)";

    // 取得網域（從環境變數或使用預設值）
    const baseUrl = Deno.env.get("SITE_URL") || 
                    Deno.env.get("VITE_SITE_URL") || 
                    "https://pomodoro-app-eight-rouge.vercel.app";
    const successUrl = `${baseUrl}/payment/success`;

    // Email 內容
    const subject = "點數補充完成通知";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">點數補充完成</h2>
        <p>您好，</p>
        <p>您的點數已成功補充：</p>
        <ul>
          <li><strong>方案：</strong>${planName}</li>
          <li><strong>補充點數：</strong>${credits_added.toLocaleString()} 點</li>
        </ul>
        <p>感謝您的使用！</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${successUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            👉 立即開始使用
          </a>
        </div>
        <p style="text-align: center; margin-top: 20px;">
          <a href="${successUrl}" style="color: #2563eb; text-decoration: underline;">${successUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">此為系統自動發送，請勿回覆。</p>
      </div>
    `;

    const textContent = `
點數補充完成

您好，

您的點數已成功補充：
- 方案：${planName}
- 補充點數：${credits_added.toLocaleString()} 點

感謝您的使用！

👉 立即開始使用：
${successUrl}

---
此為系統自動發送，請勿回覆。
    `;

    // 使用 Supabase 的內建 Email 功能發送
    // 注意：這需要 Supabase 已設定 Email 服務（如 Resend、SendGrid 等）
    // 如果尚未設定，這裡會失敗，但不影響補點流程
    
    // 這裡使用 Supabase 的內建 Email 功能
    // 實際實作需要根據你的 Supabase 設定調整
    // 例如：使用 Resend、SendGrid 或其他 Email 服務
    
    // 簡化版本：記錄 log，實際發送需要配置 Email 服務
    // console.log("📧 Email 通知:", {
      to: email,
      subject: subject,
      plan_id: plan_id,
      credits_added: credits_added,
    });

    // TODO: 實際發送 Email 的實作
    // 可以使用 Supabase 的 Email 擴充功能或第三方服務
    // 例如：
    // - 使用 Resend: https://supabase.com/docs/guides/functions/examples/send-email-with-resend
    // - 使用 SendGrid
    // - 使用 Supabase 內建的 Email 功能

    return json({
      status: "success",
      message: "Email 通知已記錄",
      note: "實際 Email 發送需要配置 Email 服務",
    });
  } catch (err: any) {
    console.error("❌ Edge Function 錯誤:", err);
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

