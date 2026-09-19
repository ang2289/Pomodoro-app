import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "SERVER_NOT_CONFIGURED" }, 500);
    if (bearer !== serviceRoleKey) return json({ error: "FORBIDDEN" }, 403);

    const body = await req.json().catch(() => ({}));
    const userId = body?.internalUserId;
    const feature = String(body?.feature || "").trim();
    const inputChars = Number(body?.inputChars);
    const outputChars = Number(body?.outputChars);
    if (
      typeof userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId) ||
      !feature || !Number.isInteger(inputChars) || !Number.isInteger(outputChars) ||
      inputChars < 0 || outputChars < 0 || inputChars + outputChars <= 0
    ) return json({ error: "INVALID_REQUEST" }, 400);

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase.rpc("consume_credits", {
      p_user_id: userId,
      p_input_chars: inputChars,
      p_output_chars: outputChars,
      p_feature: feature,
    });
    if (error) {
      const insufficient = /insufficient/i.test(error.message || "");
      return json({ error: insufficient ? "INSUFFICIENT_CREDITS" : "CREDIT_DEBIT_FAILED" }, insufficient ? 403 : 500);
    }
    const row = Array.isArray(data) ? data[0] : data;
    return json({
      success: true,
      remainingChars: row?.remaining_chars ?? row?.after_remaining,
      totalChars: inputChars + outputChars,
    });
  } catch (error) {
    console.error("CONSUME_CREDITS_INTERNAL_ERROR", error instanceof Error ? error.message : "unknown");
    return json({ error: "INTERNAL_ERROR" }, 500);
  }
});
