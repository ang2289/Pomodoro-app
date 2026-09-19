const fs = require("fs");

const file = "./api/main.ts";
let s = fs.readFileSync(file, "utf8");
const eol = s.includes("\r\n") ? "\r\n" : "\n";

if (s.includes('case "download-image":')) {
  console.log("STOP: download-image already exists.");
  process.exit(0);
}

const required = [
  "S3Client",
  "GetObjectCommand",
  "ListObjectsV2Command",
  "getSignedUrl"
];

for (const x of required) {
  if (!s.includes(x)) {
    console.error("STOP: missing dependency in main.ts:", x);
    process.exit(1);
  }
}

const handlerMarker =
  "async function handleUploadImage(req: any, res: any, body: any) {";

const routeMarker = '    case "uploadimage":';

if (!s.includes(handlerMarker)) {
  console.error("STOP: handleUploadImage marker not found.");
  process.exit(1);
}

if (!s.includes(routeMarker)) {
  console.error("STOP: uploadimage route marker not found.");
  process.exit(1);
}

const handler = [
'function getR2ImageDownloadClient() {',
'  const accountId = safeText(process.env.R2_ACCOUNT_ID);',
'  const accessKeyId = safeText(process.env.R2_ACCESS_KEY_ID);',
'  const secretAccessKey = safeText(process.env.R2_SECRET_ACCESS_KEY);',
'',
'  if (!accountId || !accessKeyId || !secretAccessKey) {',
'    throw new Error("R2_DOWNLOAD_ENV_MISSING");',
'  }',
'',
'  return {',
'    bucket: safeText(',
'      process.env.R2_PRIVATE_BUCKET_NAME || "rxv-healing-images-staging"',
'    ),',
'    client: new S3Client({',
'      region: "auto",',
'      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,',
'      credentials: { accessKeyId, secretAccessKey },',
'    }),',
'  };',
'}',
'',
'async function handleDownloadImage(req: any, res: any, body: any) {',
'  res.setHeader("Access-Control-Allow-Origin", "*");',
'  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");',
'  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");',
'',
'  if (req.method === "OPTIONS") {',
'    return res.status(204).end();',
'  }',
'',
'  if (req.method !== "POST") {',
'    return res.status(405).json({',
'      success: false,',
'      error: "Method not allowed",',
'    });',
'  }',
'',
'  try {',
'    const imageId = safeText(body?.imageId);',
'',
'    if (!imageId || imageId.length > 128 || !/^[A-Za-z0-9_-]+$/.test(imageId)) {',
'      return res.status(400).json({',
'        success: false,',
'        error: "imageId is required",',
'      });',
'    }',
'',
'    const { client, bucket } = getR2ImageDownloadClient();',
'    const prefix = `originals/by-image-id/${imageId}/`;',
'',
'    const listed = await client.send(',
'      new ListObjectsV2Command({',
'        Bucket: bucket,',
'        Prefix: prefix,',
'        MaxKeys: 10,',
'      })',
'    );',
'',
'    const originalKey = listed.Contents',
'      ?.map((item) => item.Key || "")',
'      .find((key) =>',
'        /^original\\.(jpg|jpeg|png|webp)$/i.test(key.slice(prefix.length))',
'      );',
'',
'    if (!originalKey) {',
'      return res.status(404).json({',
'        success: false,',
'        error: "Original image not found",',
'      });',
'    }',
'',
'    const extension = originalKey.split(".").pop()?.toLowerCase() || "jpg";',
'',
'    const downloadUrl = await getSignedUrl(',
'      client,',
'      new GetObjectCommand({',
'        Bucket: bucket,',
'        Key: originalKey,',
'        ResponseContentDisposition:',
'          `attachment; filename="RXV-${imageId}.${extension}"`,',
'      }),',
'      { expiresIn: 600 }',
'    );',
'',
'    return res.status(200).json({',
'      success: true,',
'      downloadUrl,',
'    });',
'  } catch (error) {',
'    console.error("[download-image] error:", error);',
'    return res.status(500).json({',
'      success: false,',
'      error: error?.message || "Download failed",',
'    });',
'  }',
'}',
''
].join(eol);

const stamp = new Date()
  .toISOString()
  .replace(/[-:T]/g, "")
  .replace(/\..+/, "");

fs.copyFileSync(file, `./api/main.ts.before-download-${stamp}.bak`);

s = s.replace(handlerMarker, handler + eol + handlerMarker);

s = s.replace(
  routeMarker,
  '    case "download-image":' + eol +
  '      return handleDownloadImage(req, res, body);' + eol +
  routeMarker
);

fs.writeFileSync(file, s, "utf8");

console.log("OK: download-image restored safely with UTF-8.");
