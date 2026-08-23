import http from "node:http";
import handler from "../api/image-admin";

const port = 3000;

const server = http.createServer(async (req: any, res: any) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `127.0.0.1:${port}`}`);
  req.query = Object.fromEntries(url.searchParams.entries());

  let bodyText = "";
  for await (const chunk of req) bodyText += chunk;
  if (bodyText) {
    try { req.body = JSON.parse(bodyText); } catch { req.body = bodyText; }
  } else {
    req.body = {};
  }

  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload: any) => {
    if (!res.headersSent) res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  };

  try {
    await handler(req, res);
  } catch (error: any) {
    if (!res.headersSent) res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: error?.message || "LOCAL_IMAGE_ADMIN_API_FAILED" }));
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[RXV image admin API] http://127.0.0.1:${port}`);
});
