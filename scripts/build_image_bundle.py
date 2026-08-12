#!/usr/bin/env python3
"""依網站目前 Supabase 圖片與分類產生完整 ZIP，並上傳為最新版素材包。

必要環境變數：
  SUPABASE_URL（或 VITE_SUPABASE_URL）
  SUPABASE_SERVICE_ROLE_KEY

範例：
  python scripts/build_image_bundle.py --no-upload
  python scripts/build_image_bundle.py

設計原則：
- 分類完全以 image_categories 當下有效資料為準，不 hard-code 分類名稱。
- 圖片以 images 當下資料為準。
- 有 file_path 時優先抓 Supabase Storage `images` bucket 原圖；無 file_path 才使用公開 URL。
- 檔名不用依賴網站原始檔名，輸出為「分類_0001.ext」。
- 預設只要有任何圖片下載失敗，就不會上傳成可販售的 latest.zip。
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import mimetypes
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

PRODUCT_CODE = "image-bundle-full"
SOURCE_IMAGE_BUCKET = "images"
DEST_BUCKET = "digital-products"
DEST_PATH = "image-bundles/latest.zip"
PAGE_SIZE = 1000

INVALID_WINDOWS_CHARS = re.compile(r'[\\/:*?"<>|\x00-\x1f]')
TRAILING_DOTS_SPACES = re.compile(r"[. ]+$")

CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/bmp": ".bmp",
    "image/tiff": ".tif",
    "image/avif": ".avif",
}

README_TEXT = """RxV 高畫質圖片素材庫｜完整下載版

使用方式：
1. 圖片已依購買當下網站的有效分類整理成資料夾。
2. 圖片檔名採「分類_流水號」命名，方便批次管理，不代表圖片內容標題。
3. `圖片清單.csv` 可查看 ZIP 內檔名、分類與網站原始資料對照。
4. 若日後網站新增、改名或刪除分類，重新產生素材包時會依最新分類結構整理。

重要：
- 請先閱讀 `商用授權說明.txt`。
- 不得把本素材包或其中圖片原檔重新打包、轉售、轉贈或上傳至素材下載平台供他人取得。
"""

LICENSE_TEXT = """RxV 圖片素材庫｜一般商用授權說明

本授權為非專屬、不可轉讓的使用授權，僅適用於 RxV 有權提供的本素材包內容。

可以：
- 用於自己的網站、社群貼文、廣告、簡報、影片、短影音與行銷設計。
- 作為完成品設計的一部分，用於自己或客戶的商業專案。
- 裁切、調色、加字、合成或加入其他設計元素後使用。

不可以：
- 將圖片原檔或近似原檔單獨販售、轉售、轉贈、出租或分享下載連結。
- 將本素材包重新打包後販售或免費散布。
- 上傳至圖庫、素材站、雲端共享庫、模型訓練資料集或其他可讓第三人取得原始素材的服務。
- 宣稱取得素材的獨家所有權，或阻止其他合法取得授權者使用相同素材。
- 用於違法、侵權、誤導或冒充第三方背書的用途。

若特定圖片涉及人物肖像、商標、著作物或其他第三方權利，使用者仍應依實際用途自行確認所需權利與法令要求。

本授權不等同於著作權讓與，也不保證任何素材具有可由單一使用者主張的專屬著作權。
"""


def env(name: str, fallback: str | None = None) -> str:
    value = os.getenv(name)
    if value:
        return value.rstrip("/")
    if fallback:
        other = os.getenv(fallback)
        if other:
            return other.rstrip("/")
    raise RuntimeError(f"缺少環境變數：{name}" + (f" 或 {fallback}" if fallback else ""))


def request_json(url: str, service_key: str, *, method: str = "GET", body: Any = None, extra_headers: dict[str, str] | None = None) -> Any:
    headers = {
        "Authorization": f"Bearer {service_key}",
        "apikey": service_key,
        "Accept": "application/json",
    }
    if extra_headers:
        headers.update(extra_headers)

    data = None
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read()
        if not raw:
            return None
        return json.loads(raw.decode("utf-8"))


def fetch_all_rows(base_url: str, service_key: str, table: str, query: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    start = 0

    while True:
        end = start + PAGE_SIZE - 1
        url = f"{base_url}/rest/v1/{table}?{query}"
        headers = {
            "Range": f"{start}-{end}",
            "Range-Unit": "items",
            "Prefer": "count=exact",
        }
        batch = request_json(url, service_key, extra_headers=headers) or []
        if not isinstance(batch, list):
            raise RuntimeError(f"{table} 回傳格式錯誤")

        rows.extend(batch)
        if len(batch) < PAGE_SIZE:
            break
        start += PAGE_SIZE

    return rows


def load_categories(base_url: str, service_key: str) -> list[dict[str, Any]]:
    query = urllib.parse.urlencode({
        "select": "id,name,slug,sort_order",
        "is_active": "eq.true",
        "order": "sort_order.asc",
    })
    return fetch_all_rows(base_url, service_key, "image_categories", query)


def load_images(base_url: str, service_key: str) -> list[dict[str, Any]]:
    # 現行網站頁面已使用這些欄位；若未來欄位調整，只需在這裡同步修改。
    query = urllib.parse.urlencode({
        "select": "id,title,file_path,public_url,image_url,category_id,created_at",
        "order": "created_at.asc",
    })
    try:
        return fetch_all_rows(base_url, service_key, "images", query)
    except urllib.error.HTTPError as exc:
        # 向舊資料庫相容：若 image_url 欄位尚未建立，退回既有核心欄位。
        if exc.code != 400:
            raise
        query = urllib.parse.urlencode({
            "select": "id,title,file_path,public_url,category_id,created_at",
            "order": "created_at.asc",
        })
        return fetch_all_rows(base_url, service_key, "images", query)


def safe_name(value: str | None, fallback: str = "未分類") -> str:
    name = (value or "").strip() or fallback
    name = INVALID_WINDOWS_CHARS.sub("_", name)
    name = TRAILING_DOTS_SPACES.sub("", name).strip()
    if not name:
        name = fallback
    # 避免路徑過長，保留足夠可辨識文字。
    return name[:80]


def extension_from_source(source: str | None, content_type: str | None) -> str:
    if source:
        path = urllib.parse.urlparse(source).path
        ext = Path(path).suffix.lower()
        if ext in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff", ".avif"}:
            return ".jpg" if ext == ".jpeg" else ".tif" if ext == ".tiff" else ext

    if content_type:
        clean_type = content_type.split(";", 1)[0].strip().lower()
        if clean_type in CONTENT_TYPE_EXTENSIONS:
            return CONTENT_TYPE_EXTENSIONS[clean_type]
        guessed = mimetypes.guess_extension(clean_type)
        if guessed:
            return guessed

    return ".jpg"


def download_url(url: str, service_key: str | None = None, retries: int = 3) -> tuple[bytes, str | None]:
    headers = {"User-Agent": "RxV-Image-Bundle-Builder/1.0"}
    if service_key:
        headers["Authorization"] = f"Bearer {service_key}"
        headers["apikey"] = service_key

    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers=headers, method="GET")
            with urllib.request.urlopen(req, timeout=90) as resp:
                return resp.read(), resp.headers.get("Content-Type")
        except Exception as exc:  # noqa: BLE001 - 需要記錄所有網路錯誤並重試
            last_error = exc
            if attempt < retries:
                time.sleep(attempt * 1.5)

    raise RuntimeError(f"下載失敗：{last_error}")


def download_original(image: dict[str, Any], base_url: str, service_key: str) -> tuple[bytes, str]:
    file_path = (image.get("file_path") or "").strip()
    public_url = (image.get("public_url") or image.get("image_url") or "").strip()

    if file_path:
        encoded_path = urllib.parse.quote(file_path.lstrip("/"), safe="/")
        storage_url = f"{base_url}/storage/v1/object/{SOURCE_IMAGE_BUCKET}/{encoded_path}"
        data, content_type = download_url(storage_url, service_key=service_key)
        return data, extension_from_source(file_path, content_type)

    if public_url:
        data, content_type = download_url(public_url)
        return data, extension_from_source(public_url, content_type)

    raise RuntimeError("圖片沒有 file_path、public_url 或 image_url")


def write_csv_to_zip(zf: zipfile.ZipFile, rows: list[list[str]], filename: str) -> None:
    buffer = io.StringIO(newline="")
    writer = csv.writer(buffer)
    writer.writerows(rows)
    # UTF-8 BOM，Windows Excel 直接開啟繁中不易亂碼。
    zf.writestr(filename, "\ufeff" + buffer.getvalue())


def build_zip(
    output: Path,
    categories: list[dict[str, Any]],
    images: list[dict[str, Any]],
    base_url: str,
    service_key: str,
) -> tuple[int, list[list[str]]]:
    category_name_by_id = {str(row["id"]): safe_name(row.get("name")) for row in categories}
    counters: defaultdict[str, int] = defaultdict(int)
    manifest: list[list[str]] = [["ZIP 檔名", "分類", "網站原始標題", "圖片 ID"]]
    failures: list[list[str]] = [["圖片 ID", "分類", "錯誤"]]
    success_count = 0

    output.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        zf.writestr("使用說明.txt", README_TEXT)
        zf.writestr("商用授權說明.txt", LICENSE_TEXT)

        total = len(images)
        for index, image in enumerate(images, start=1):
            category_id = str(image.get("category_id") or "")
            category_name = category_name_by_id.get(category_id, "未分類")
            category_name = safe_name(category_name)

            try:
                data, ext = download_original(image, base_url, service_key)
                counters[category_name] += 1
                sequence = counters[category_name]
                filename = f"{category_name}_{sequence:04d}{ext}"
                zip_path = f"{category_name}/{filename}"
                zf.writestr(zip_path, data)
                manifest.append([
                    zip_path,
                    category_name,
                    str(image.get("title") or ""),
                    str(image.get("id") or ""),
                ])
                success_count += 1
                print(f"[{index}/{total}] OK  {zip_path}")
            except Exception as exc:  # noqa: BLE001
                failures.append([
                    str(image.get("id") or ""),
                    category_name,
                    str(exc),
                ])
                print(f"[{index}/{total}] FAIL {image.get('id')}: {exc}", file=sys.stderr)

        write_csv_to_zip(zf, manifest, "圖片清單.csv")
        if len(failures) > 1:
            write_csv_to_zip(zf, failures, "下載失敗清單.csv")

    return success_count, failures[1:]


def upload_zip(base_url: str, service_key: str, zip_path: Path) -> None:
    encoded = urllib.parse.quote(DEST_PATH, safe="/")
    url = f"{base_url}/storage/v1/object/{DEST_BUCKET}/{encoded}"
    headers = {
        "Authorization": f"Bearer {service_key}",
        "apikey": service_key,
        "Content-Type": "application/zip",
        "x-upsert": "true",
    }
    data = zip_path.read_bytes()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=300) as resp:
        if resp.status not in {200, 201}:
            raise RuntimeError(f"ZIP 上傳失敗：HTTP {resp.status}")


def update_bundle_record(base_url: str, service_key: str, version: str, image_count: int) -> None:
    query = urllib.parse.urlencode({"product_code": f"eq.{PRODUCT_CODE}"})
    url = f"{base_url}/rest/v1/digital_product_bundles?{query}"
    request_json(
        url,
        service_key,
        method="PATCH",
        body={
            "storage_bucket": DEST_BUCKET,
            "storage_path": DEST_PATH,
            "version": version,
            "image_count": image_count,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        extra_headers={"Prefer": "return=minimal"},
    )


def print_summary(categories: list[dict[str, Any]], images: list[dict[str, Any]]) -> None:
    active_ids = {str(row["id"]): safe_name(row.get("name")) for row in categories}
    counts: defaultdict[str, int] = defaultdict(int)
    for image in images:
        counts[active_ids.get(str(image.get("category_id") or ""), "未分類")] += 1

    print(f"目前有效分類：{len(categories)} 個")
    print(f"目前圖片：{len(images)} 張")
    for category in categories:
        name = safe_name(category.get("name"))
        print(f"  - {name}: {counts.get(name, 0)} 張")
    if counts.get("未分類", 0):
        print(f"  - 未分類: {counts['未分類']} 張")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="依網站目前分類產生 RxV 圖片完整 ZIP")
    parser.add_argument("--dry-run", action="store_true", help="只查詢目前分類與圖片數量，不下載、不建 ZIP")
    parser.add_argument("--no-upload", action="store_true", help="建立本機 ZIP，但不上傳成 latest.zip")
    parser.add_argument("--allow-partial", action="store_true", help="即使部分圖片下載失敗，仍允許上傳 ZIP（不建議正式販售使用）")
    parser.add_argument("--output", type=Path, help="指定本機 ZIP 輸出路徑")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    base_url = env("SUPABASE_URL", "VITE_SUPABASE_URL")
    service_key = env("SUPABASE_SERVICE_ROLE_KEY")

    print("讀取網站目前有效分類與圖片...")
    categories = load_categories(base_url, service_key)
    images = load_images(base_url, service_key)
    print_summary(categories, images)

    if args.dry_run:
        return 0

    version = datetime.now().strftime("%Y-%m-%d")
    output = args.output or (Path(tempfile.gettempdir()) / f"RxV_高畫質圖片素材庫_{version}.zip")

    print(f"\n開始建立 ZIP：{output}")
    success_count, failures = build_zip(output, categories, images, base_url, service_key)
    print(f"\n完成：成功 {success_count} 張，失敗 {len(failures)} 張")
    print(f"ZIP：{output}")

    if failures and not args.allow_partial:
        print("因有圖片失敗，為避免把不完整素材包提供給客戶，本次不會上傳 latest.zip。", file=sys.stderr)
        print("請查看 ZIP 內的「下載失敗清單.csv」，修正後重新執行。", file=sys.stderr)
        return 2

    if args.no_upload:
        print("--no-upload：已略過上傳。")
        return 0

    print("上傳 private ZIP 到 Supabase Storage...")
    upload_zip(base_url, service_key, output)
    update_bundle_record(base_url, service_key, version, success_count)
    print(f"最新版素材包已更新：{DEST_BUCKET}/{DEST_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
