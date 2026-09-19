import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import imageAdminHandler from "../api/image-admin";

const ROOT = "D:\\Pomodoro-app";
const ENV_FILE = path.join(ROOT, ".env.local");
dotenv.config({ path: ENV_FILE, override: true, quiet: true });

const PORT = 3020;
const HOST = "127.0.0.1";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HTML_FILE = path.join(__dirname, "rxv-image-admin-auto-v2.html");

const required = [
  "RXV_IMAGE_ADMIN_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_PUBLIC_BUCKET_NAME",
  "R2_PRIVATE_BUCKET_NAME",
];

const missing = required.filter((k) => !String(process.env[k] || "").trim());

function send(res: any, code: number, body: string, type = "text/html; charset=utf-8") {
  res.statusCode = code;
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

const server = http.createServer(async (req: any, res: any) => {
  try {
    const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);

    if (url.pathname === "/") {
      const html = fs.readFileSync(HTML_FILE, "utf8");
      send(res, 200, html);
      return;
    }

    if (url.pathname === "/health") {
      send(
        res,
        missing.length ? 500 : 200,
        JSON.stringify({
          ok: missing.length === 0,
          envFile: ENV_FILE,
          missing,
        }),
        "application/json; charset=utf-8",
      );
      return;
    }

    if (url.pathname === "/api/image-admin") {
      if (missing.length) {
        send(
          res,
          500,
          JSON.stringify({
            ok: false,
            success: false,
            error: "ENV_MISSING:" + missing.join(","),
          }),
          "application/json; charset=utf-8",
        );
        return;
      }

      req.query = Object.fromEntries(url.searchParams.entries());

      let bodyText = "";
      for await (const chunk of req) bodyText += chunk;
      if (bodyText) {
        try {
          req.body = JSON.parse(bodyText);
        } catch {
          req.body = bodyText;
        }
      } else {
        req.body = {};
      }

      req.headers = req.headers || {};
      req.headers["x-rxv-image-admin-key"] = String(process.env.RXV_IMAGE_ADMIN_KEY || "");

      res.status = (code: number) => {
        res.statusCode = code;
        return res;
      };
      res.json = (payload: any) => {
        if (!res.headersSent) {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
        }
        res.end(JSON.stringify(payload));
        return res;
      };

      await imageAdminHandler(req, res);
      return;
    }

    send(res, 404, "Not found", "text/plain; charset=utf-8");
  } catch (error: any) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    if (!res.writableEnded) {
      res.end(JSON.stringify({
        ok: false,
        success: false,
        error: error?.message || "LOCAL_IMAGE_ADMIN_AUTO_V2_FAILED",
      }));
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log("RXV IMAGE ADMIN AUTO V2");
  console.log("=======================");
  console.log(`URL: http://${HOST}:${PORT}/`);
  console.log(`ENV: ${ENV_FILE}`);
  console.log(`ENV STATUS: ${missing.length ? "MISSING " + missing.join(",") : "OK"}`);
  console.log("Press Ctrl+C to stop.");
});
