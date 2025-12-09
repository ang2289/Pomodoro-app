export default async function handler(req: any, res: any) {
  try {
    const response = await fetch(
      "https://icuxwmpdpsfhztsbyeds.supabase.co/functions/v1/auto-summary",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "keepalive" })
      }
    );

    res.status(200).json({
      ok: true,
      status: response.status,
      message: "Pinged Supabase Function successfully."
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: String(err)
    });
  }
}














