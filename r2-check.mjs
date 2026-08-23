import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const need = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY"
];

const missing = need.filter((k) => !process.env[k]);

if (missing.length) {
  console.log("R2_FAIL", {
    reason: "MISSING_ENV",
    missing
  });
  process.exit(1);
}

const bucket =
  process.env.R2_PUBLIC_BUCKET_NAME ||
  "rxv-healing-images-public";

const client = new S3Client({
  region: "auto",
  endpoint:
    "https://" +
    process.env.R2_ACCOUNT_ID +
    ".r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

try {
  const r = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: "catalog/images-public.json"
    })
  );

  const text = await r.Body.transformToString("utf-8");
  const json = JSON.parse(text);

  const images = Array.isArray(json)
    ? json
    : json.images || json.data || json.items || [];

  console.log("R2_OK", {
    bucket,
    httpStatus: r.$metadata?.httpStatusCode,
    bytes: text.length,
    count: images.length
  });
} catch (e) {
  console.log("R2_FAIL", {
    name: e?.name,
    code: e?.Code || e?.code,
    message: e?.message,
    httpStatus: e?.$metadata?.httpStatusCode
  });
}
