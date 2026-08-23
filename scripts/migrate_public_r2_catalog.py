"""Copy only the public RxV catalog assets between two R2 buckets.

This intentionally never lists or changes source objects.  It uses the existing
master as the allow-list: thumbnails for all images and originals for free images.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from hashlib import sha256
import hmac
import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen
import os
import time


ROOT = Path(__file__).resolve().parents[1]


def parse_env(path):
    values = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


ENV = {**parse_env(ROOT / ".env"), **parse_env(ROOT / ".env.local")}
for name in ("R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"):
    if not ENV.get(name):
        raise SystemExit(f"R2_ENV_MISSING:{name}")

SOURCE_BUCKET = ENV.get("R2_PRIVATE_BUCKET_NAME") or ENV.get("R2_BUCKET_NAME") or ENV.get("R2_BUCKET")
PUBLIC_BUCKET = ENV.get("R2_PUBLIC_BUCKET_NAME")
# This must be the new public bucket's Development URL (never the S3 API endpoint
# or the legacy bucket's public URL).
PUBLIC_BASE = (ENV.get("R2_PUBLIC_ASSET_URL") or "").rstrip("/")
if not SOURCE_BUCKET or not PUBLIC_BUCKET:
    raise SystemExit("R2_BUCKET_MISSING")

HOST = f"{ENV['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com"
ENDPOINT = f"https://{HOST}"
EMPTY_HASH = sha256(b"").hexdigest()


def hmac_sha256(key, message):
    return hmac.new(key, message.encode("utf-8"), sha256).digest()


def signed_request(method, key, *, body=b"", extra_headers=None):
    now = datetime.now(timezone.utc)
    stamp = now.strftime("%Y%m%dT%H%M%SZ")
    date = now.strftime("%Y%m%d")
    payload_hash = sha256(body).hexdigest()
    headers = {
        "host": HOST,
        "x-amz-content-sha256": payload_hash,
        "x-amz-date": stamp,
        **(extra_headers or {}),
    }
    canonical_uri = "/" + quote(key, safe="/-_.~")
    canonical_headers = "".join(f"{name}:{' '.join(str(headers[name]).strip().split())}\n" for name in sorted(headers))
    signed_headers = ";".join(sorted(headers))
    scope = f"{date}/auto/s3/aws4_request"
    canonical = "\n".join([method, canonical_uri, "", canonical_headers, signed_headers, payload_hash])
    string_to_sign = "\n".join(["AWS4-HMAC-SHA256", stamp, scope, sha256(canonical.encode()).hexdigest()])
    signing_key = hmac_sha256(
        hmac_sha256(hmac_sha256(hmac_sha256(("AWS4" + ENV["R2_SECRET_ACCESS_KEY"]).encode(), date), "auto"), "s3"),
        "aws4_request",
    )
    signature = hmac.new(signing_key, string_to_sign.encode(), sha256).hexdigest()
    headers["Authorization"] = (
        f"AWS4-HMAC-SHA256 Credential={ENV['R2_ACCESS_KEY_ID']}/{scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )
    return Request(ENDPOINT + canonical_uri, data=body if method in ("PUT", "POST") else None,
                   headers=headers, method=method)


def send(method, key, *, body=b"", extra_headers=None, attempts=6):
    last_error = None
    for attempt in range(attempts):
        try:
            with urlopen(signed_request(method, key, body=body, extra_headers=extra_headers), timeout=45) as response:
                return response.status, dict(response.headers.items())
        except (HTTPError, URLError, OSError) as error:
            last_error = error
            if attempt == attempts - 1:
                break
            time.sleep(0.6 * (attempt + 1))
    raise last_error


master = json.loads((ROOT / "private-data" / "images-master.json").read_text(encoding="utf-8"))
images = master.get("images", [])
if len(images) != 1583 or len({item.get("id") for item in images}) != 1583:
    raise SystemExit("MASTER_COUNT_OR_IDS_INVALID")
free_images = [item for item in images if item.get("plan_type") == "free"]
if len(free_images) != 37:
    raise SystemExit("FREE_IMAGE_COUNT_INVALID")


def fallback_catalog():
    output = []
    for item in images:
        plan_type = "free" if item.get("plan_type") == "free" else "bundle"
        result = {
            "id": item["id"],
            "title": item.get("title") or "圖片素材",
            "category": item.get("category") or item.get("category_id") or "other",
            "category_id": item.get("category_id") or item.get("category") or "other",
            "category_name": item.get("category_name") or "其他素材",
            "thumbnail_url": f"/api/main?action=get-r2-image-thumbnail&id={item['id']}",
            "preview_url": f"/api/main?action=get-r2-image-thumbnail&id={item['id']}",
            "plan_type": plan_type,
        }
        if plan_type == "free":
            result["download_url"] = f"/api/main?action=get-r2-free-image-download&id={item['id']}"
        output.append(result)
    return output


if "--fallback-only" in os.sys.argv:
    (ROOT / "public" / "data" / "images-public.json").write_text(
        json.dumps(fallback_catalog(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps({"fallback_manifest_count": len(images)}))
    raise SystemExit(0)

if not PUBLIC_BASE or ".r2.cloudflarestorage.com" in PUBLIC_BASE:
    raise SystemExit("R2_PUBLIC_ASSET_URL_MISSING_OR_NOT_PUBLIC")


def suffix(key):
    extension = key.rsplit(".", 1)[-1].lower() if "." in key else ""
    if extension not in {"jpg", "jpeg", "png", "webp"}:
        raise ValueError(f"UNSAFE_IMAGE_EXTENSION:{key}")
    return extension


free_keys = {item["id"]: f"free/originals/{item['id']}.{suffix(item['original_key'])}" for item in free_images}
assets = []
for item in images:
    source = item.get("thumbnail_key")
    if not source or not (source.startswith("thumbnails/") or source.startswith("images/thumbnails/")):
        raise SystemExit(f"THUMBNAIL_KEY_INVALID:{item.get('id')}")
    assets.append((source, source, "image/webp"))
for item in free_images:
    ext = suffix(item["original_key"])
    assets.append((item["original_key"], free_keys[item["id"]], f"image/{'jpeg' if ext == 'jpg' else ext}"))


def copy_asset(asset):
    source, destination, content_type = asset
    copy_source = "/" + SOURCE_BUCKET + "/" + quote(source, safe="/-_.~")
    send("PUT", f"{PUBLIC_BUCKET}/{destination}", extra_headers={
        "content-type": content_type,
        "cache-control": "public, max-age=31536000, immutable",
        "x-amz-copy-source": copy_source,
        "x-amz-metadata-directive": "REPLACE",
    })
    return destination


if "--manifest-only" not in os.sys.argv:
    completed = 0
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(copy_asset, asset) for asset in assets]
        for future in as_completed(futures):
            future.result()
            completed += 1
            if completed % 100 == 0:
                print(f"COPIED={completed}", flush=True)


def public_url(key):
    return PUBLIC_BASE + "/" + "/".join(quote(part, safe="-_.~") for part in key.split("/"))


public_images = []
for item in images:
    plan_type = "free" if item.get("plan_type") == "free" else "bundle"
    public_item = {
        "id": item["id"],
        "title": item.get("title") or "圖片素材",
        "category": item.get("category") or item.get("category_id") or "other",
        "category_id": item.get("category_id") or item.get("category") or "other",
        "category_name": item.get("category_name") or "其他素材",
        "thumbnail_url": public_url(item["thumbnail_key"]),
        "preview_url": public_url(item["thumbnail_key"]),
        "plan_type": plan_type,
    }
    if plan_type == "free":
        public_item["download_url"] = public_url(free_keys[item["id"]])
    public_images.append(public_item)

manifest = (json.dumps(public_images, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
if any(token in manifest.decode("utf-8").lower() for token in ("original_key", "original_url", "r2_secret", "r2_access", "private/")):
    raise SystemExit("PUBLIC_MANIFEST_LEAK_BLOCKED")

send("PUT", f"{PUBLIC_BUCKET}/catalog/images-public.json", body=manifest, extra_headers={
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-cache",
})
(ROOT / "public" / "data" / "images-public.json").write_text(
    json.dumps(fallback_catalog(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)

print(json.dumps({
    "public_manifest_count": len(public_images),
    "public_thumbnail_count": len(images),
    "public_free_original_count": len(free_images),
    "public_bundle_original_count": 0,
}))
