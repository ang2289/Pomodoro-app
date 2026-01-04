import { useEffect } from "react";

import { supabase } from "@/lib/supabase";



export function KeepAlivePing() {

  useEffect(() => {
    // ⚠️ 已停用：此專案目前沒有使用 wishes 資料表，避免 404 錯誤
    // const ping = async () => {
    //   try {
    //     await supabase.from("wishes").select("id").limit(1);
    //     console.log("✅ Supabase keep-alive ping successful");
    //   } catch (e) {
    //     console.error("❌ Supabase keep-alive ping failed:", e);
    //   }
    // };

    // // App 啟動時 ping 一次
    // ping();

    // // 每隔 7 天再 ping 一次（超保險）
    // const t = setInterval(() => ping(), 7 * 24 * 60 * 60 * 1000);
    // return () => clearInterval(t);
    
    return; // 直接中斷，不執行 keep-alive
  }, []);



  return null;

}

