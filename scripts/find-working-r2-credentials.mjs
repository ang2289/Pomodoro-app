import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const candidates = [
  'D:/Pomodoro-app/.env.local',
  'D:/Pomodoro-app/.env',
  'D:/Pomodoro-app/.vercel/.env.production.local',
  'D:/Pomodoro-app/.vercel/.env.preview.local',
  'D:/0--AI/備份APP/Pomodoro-app/.env.local',
  'D:/0--AI/備份APP/Pomodoro-app/.env',
  'D:/0--AI/備份APP/Pomodoro-app/.vercel/.env.production.local',
  'D:/0--AI/備份APP/Pomodoro-app/.vercel/.env.preview.local',
  'D:/Pomodoro-app-clean/.env.local',
  'D:/Pomodoro-app-clean/.env',
  'D:/Pomodoro-app-clean/.vercel/.env.production.local',
  'D:/Pomodoro-app-clean/.vercel/.env.preview.local',
];

function fp(value) {
  const s = String(value || '').trim();
  if (!s) return 'MISSING';
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 10).toUpperCase();
}

async function bodyToText(body) {
  if (!body) return '';
  if (typeof body.transformToString === 'function') return await body.transformToString('utf-8');
  const chunks = [];
  for await (const chunk of body) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

const seen = new Set();
const rows = [];
for (const file of candidates) {
  if (!fs.existsSync(file)) continue;
  let parsed = {};
  try { parsed = dotenv.parse(fs.readFileSync(file)); } catch { continue; }
  const accountId = String(parsed.R2_ACCOUNT_ID || '').trim();
  const accessKeyId = String(parsed.R2_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = String(parsed.R2_SECRET_ACCESS_KEY || '').trim();
  const bucket = String(parsed.R2_PUBLIC_BUCKET_NAME || 'rxv-healing-images-public').trim();
  if (!accountId && !accessKeyId && !secretAccessKey) continue;

  const signature = [accountId, accessKeyId, secretAccessKey].join('|');
  const duplicateOf = seen.has(signature);
  if (!duplicateOf) seen.add(signature);

  const row = {
    file,
    accountFp: fp(accountId),
    accessFp: fp(accessKeyId),
    secretFp: fp(secretAccessKey),
    bucket,
    duplicateOf,
    status: 'NOT_TESTED',
    detail: '',
  };

  if (!accountId || !accessKeyId || !secretAccessKey) {
    row.status = 'MISSING';
    row.detail = '憑證不完整';
  } else if (duplicateOf) {
    row.status = 'DUPLICATE';
    row.detail = '與前面某份環境檔相同，略過重複測試';
  } else {
    try {
      const client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
      const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: 'catalog/images-public.json' }));
      const text = await bodyToText(result.Body);
      const parsedCatalog = JSON.parse(text);
      const count = Array.isArray(parsedCatalog)
        ? parsedCatalog.length
        : Array.isArray(parsedCatalog?.images)
          ? parsedCatalog.images.length
          : Array.isArray(parsedCatalog?.data)
            ? parsedCatalog.data.length
            : Array.isArray(parsedCatalog?.items)
              ? parsedCatalog.items.length
              : null;
      row.status = 'OK';
      row.detail = `可讀取 catalog${count != null ? `，${count} 張` : ''}`;
    } catch (error) {
      const name = String(error?.name || 'Error');
      const code = String(error?.Code || error?.code || '');
      const http = error?.$metadata?.httpStatusCode || '';
      row.status = 'FAIL';
      row.detail = `${name}${code && code !== name ? `/${code}` : ''}${http ? ` HTTP ${http}` : ''}`;
    }
  }
  rows.push(row);
}

console.log('RXV R2 舊憑證比對與唯讀測試');
console.log('不顯示任何 Account ID、Access Key 或 Secret 原文，只顯示 SHA-256 短指紋。');
console.log('----------------------------------------------------------------');
for (const row of rows) {
  console.log(`\n${row.file}`);
  console.log(`  Account 指紋: ${row.accountFp}`);
  console.log(`  Access 指紋 : ${row.accessFp}`);
  console.log(`  Secret 指紋 : ${row.secretFp}`);
  console.log(`  Bucket      : ${row.bucket}`);
  console.log(`  S3 讀取測試 : ${row.status}${row.detail ? ` - ${row.detail}` : ''}`);
}

const ok = rows.filter((r) => r.status === 'OK');
console.log('\n----------------------------------------------------------------');
if (ok.length) {
  console.log(`找到 ${ok.length} 組可用憑證。請把「顯示 OK 的檔案路徑」貼給 ChatGPT；不要貼任何密鑰內容。`);
} else {
  console.log('沒有找到可用的舊憑證。下一步才需要到 Cloudflare R2 建立新的 Object Read & Write API Token。');
}
