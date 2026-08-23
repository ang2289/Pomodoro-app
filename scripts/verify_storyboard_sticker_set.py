import argparse
import json
import zipfile
from pathlib import Path

from PIL import Image, ImageChops


PHRASES = [
    "沒問題", "收到", "謝謝", "辛苦了", "抱歉", "拜託", "好啊", "等等我",
    "馬上到", "哈哈哈", "加油", "讚啦", "早安", "晚安", "愛你", "傻眼",
]


def changed_pixels(a: Image.Image, b: Image.Image) -> int:
    diff = ImageChops.difference(a.convert("RGBA"), b.convert("RGBA")).convert("RGB")
    return sum(1 for value in diff.convert("L").getdata() if value > 8)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    results = []

    for index, phrase in enumerate(PHRASES, 1):
        folder = root / f"{index:02d}_{phrase}"
        path = folder / f"{phrase}_動態貼圖_APNG.png"
        image = Image.open(path)
        frames = []
        durations = []
        for frame_index in range(image.n_frames):
            image.seek(frame_index)
            frames.append(image.convert("RGBA").copy())
            durations.append(image.info.get("duration"))
        changes = [changed_pixels(frames[i], frames[(i + 1) % len(frames)]) for i in range(len(frames))]
        alpha = frames[0].getchannel("A").getextrema()
        checks = {
            "size_320x270": image.size == (320, 270),
            "frames_8": image.n_frames == 8,
            "duration_250ms": all(value == 250 for value in durations),
            "loop_2": image.info.get("loop") == 2,
            "transparent": alpha[0] == 0,
            "under_1mb": path.stat().st_size < 1024 * 1024,
            "all_frames_distinct": min(changes) > 500,
        }
        if not all(checks.values()):
            raise ValueError(f"{phrase} failed: {checks}, changes={changes}")
        results.append({
            "number": index,
            "phrase": phrase,
            "bytes": path.stat().st_size,
            "changed_pixels_between_frames": changes,
            "checks": checks,
        })

    zip_path = root / "水滴君_日常神回覆_16張_8格動作彩色字_LINE上架包.zip"
    with zipfile.ZipFile(zip_path) as archive:
        names = set(archive.namelist())
    required = {f"stickers/{i:02d}.png" for i in range(1, 17)} | {"main.png", "tab.png"}
    if not required.issubset(names):
        raise ValueError(f"ZIP missing: {sorted(required - names)}")

    report = {
        "status": "PASS",
        "stickers": len(results),
        "total_source_frames": len(results) * 8,
        "zip_bytes": zip_path.stat().st_size,
        "zip_required_files_present": True,
        "results": results,
    }
    report_path = root / "最終驗證報告.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"status": "PASS", "stickers": 16, "frames": 128, "zip_bytes": report["zip_bytes"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
