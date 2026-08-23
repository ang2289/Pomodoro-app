import argparse
import json
import zipfile
from pathlib import Path

from PIL import Image, ImageChops


def changed_pixels(a: Image.Image, b: Image.Image) -> int:
    diff = ImageChops.difference(a, b).convert("L")
    return diff.point(lambda p: 255 if p > 8 else 0).histogram()[255]


def inspect_apng(path: Path) -> dict:
    image = Image.open(path)
    frames = []
    durations = []
    for i in range(image.n_frames):
        image.seek(i)
        frames.append(image.convert("RGBA").copy())
        durations.append(image.info.get("duration"))
    changes = [changed_pixels(frames[i], frames[(i + 1) % len(frames)]) for i in range(len(frames))]
    checks = {
        "size_320x270": image.size == (320, 270),
        "frames_8": image.n_frames == 8,
        "duration_250ms": all(value == 250 for value in durations),
        "loop_2": image.info.get("loop") == 2,
        "transparent": frames[0].getchannel("A").getextrema()[0] == 0,
        "under_1mb": path.stat().st_size < 1024 * 1024,
        "all_frames_distinct": min(changes) > 500,
    }
    if not all(checks.values()):
        raise ValueError(f"{path}: {checks}")
    return {"file": path.name, "bytes": path.stat().st_size, "changes": changes, "checks": checks}


def inspect_set(folder: Path) -> dict:
    stickers = folder / "stickers"
    paths = [stickers / f"{i:02d}.png" for i in range(1, 17)]
    if not all(path.exists() for path in paths):
        raise ValueError(f"Missing sticker in {folder}")
    results = [inspect_apng(path) for path in paths]
    main = Image.open(folder / "main.png")
    tab = Image.open(folder / "tab.png")
    if main.size != (240, 240) or getattr(main, "n_frames", 1) != 8:
        raise ValueError(f"Invalid main image: {folder}")
    if tab.size != (96, 74):
        raise ValueError(f"Invalid tab image: {folder}")
    return {
        "folder": folder.name,
        "sticker_count": 16,
        "main": {"size": list(main.size), "frames": main.n_frames},
        "tab": {"size": list(tab.size), "frames": getattr(tab, "n_frames", 1)},
        "min_sticker_bytes": min(r["bytes"] for r in results),
        "max_sticker_bytes": max(r["bytes"] for r in results),
        "stickers": results,
    }


def inspect_zip(path: Path) -> dict:
    with zipfile.ZipFile(path) as archive:
        names = set(archive.namelist())
        bad = archive.testzip()
    required = {f"stickers/{i:02d}.png" for i in range(1, 17)} | {"main.png", "tab.png"}
    if bad or not required.issubset(names):
        raise ValueError(f"ZIP invalid {path}; bad={bad}; missing={required - names}")
    return {"file": path.name, "bytes": path.stat().st_size, "under_60mb": path.stat().st_size < 60 * 1024 * 1024}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("delivery", type=Path)
    args = parser.parse_args()
    delivery = args.delivery.resolve()
    set_a = inspect_set(delivery / "LINE上架包_A_01至16")
    set_b = inspect_set(delivery / "LINE上架包_B_17至32")
    zip_a = inspect_zip(delivery / "LINE上架包_A_01至16.zip")
    zip_b = inspect_zip(delivery / "LINE上架包_B_17至32.zip")
    master_count = len(list((delivery / "全部32張作品總覽" / "stickers").glob("*.png")))
    if master_count != 32:
        raise ValueError(f"Master count {master_count}")
    report = {
        "status": "PASS",
        "animated_stickers": 32,
        "total_frames": 256,
        "submission_strategy": "LINE animated stickers accept 8, 16, or 24 per product; deliver as two legal 16-sticker sets.",
        "master_count": master_count,
        "set_a": set_a,
        "set_b": set_b,
        "zip_a": zip_a,
        "zip_b": zip_b,
    }
    output = delivery / "最終32張驗證報告.json"
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    full_zip = delivery.parent / "水滴君_32張動態貼圖_完整交付包.zip"
    with zipfile.ZipFile(full_zip, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(delivery.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(delivery))
    print(json.dumps({
        "status": "PASS", "stickers": 32, "frames": 256,
        "set_a_zip_bytes": zip_a["bytes"], "set_b_zip_bytes": zip_b["bytes"],
        "max_sticker_bytes": max(set_a["max_sticker_bytes"], set_b["max_sticker_bytes"]),
        "full_zip_bytes": full_zip.stat().st_size,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
