import { serve } from "https://deno.land/std/http/server.ts";

serve(async () => {
  return new Response("ok", {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache"
    }
  });
});
