import { useEffect } from "react";

import { supabase } from "@/utils/supabaseClient";



export function KeepAlivePing() {

  useEffect(() => {

    const ping = async () => {

      try {

        await supabase.from("wishes").select("id").limit(1);

        console.log("✅ Supabase keep-alive ping successful");

      } catch (e) {

        console.error("❌ Supabase keep-alive ping failed:", e);

      }

    };



    // App 啟動時 ping 一次

    ping();



    // 每隔 7 天再 ping 一次（超保險）

    const t = setInterval(() => ping(), 7 * 24 * 60 * 60 * 1000);



    return () => clearInterval(t);

  }, []);



  return null;

}

