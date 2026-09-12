import argparse
import shutil
import zipfile
from pathlib import Path

from PIL import Image


PHRASES = [
    "沒問題",
    "收到",
    "謝謝",
    "辛苦了",
    "抱歉",
    "拜託",
    "好啊",
    "等等我",
    "馬上到",
    "哈哈哈",
    "加油",
    "讚啦",
    "早安",
    "晚安",
    "愛你",
    "傻眼",
]


def validate_apng(path: Path):
    image = Image.open(path)
    result = {
        "size": image.size,
        "frames": getattr(image, "n_frames", 1),
        "duration": image.info.get("duration"),
        "loop": image.info.get("loop"),
        "bytes": path.stat().st_size,
        "alpha": image.convert("RGBA").getchannel("A").getextrema(),
    }
    if result["size"] != (320, 270):
        raise ValueError(f"{path}: expected 320x270, got {result['size']}")
    if not 5 <= result["frames"] <= 20:
        raise ValueError(f"{path}: frame count {result['frames']} is outside 5-20")
    if result["bytes"] >= 1024 * 1024:
        raise ValueError(f"{path}: file exceeds 1 MB")
    if result["alpha"][0] != 0:
        raise ValueError(f"{path}: no transparent pixels")
    return result


def make_individual_package(root: Path, phrase: str):
    package = root / phrase / "上架包"
    package.mkdir(exist_ok=True)
    names = [
        f"{phrase}_動態貼圖_APNG.png",
        f"{phrase}_動畫預覽.gif",
        "main_240x240.png",
        "tab_96x74.png",
    ]
    for name in names:
        shutil.copy2(root / phrase / name, package / name)
    readme = (
        f"水滴君「{phrase}」動態貼圖\n\n"
        f"{phrase}_動態貼圖_APNG.png: 320x270, 8 frames, 2 seconds, loop 2, transparent APNG\n"
        "main_240x240.png: main image APNG\n"
        "tab_96x74.png: chat tab PNG\n"
        f"{phrase}_動畫預覽.gif: preview only\n"
    )
    (package / "README.txt").write_text(readme, encoding="utf-8")
    zip_path = root / phrase / f"{phrase}_LINE動態貼圖完成樣品.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(package.iterdir()):
            archive.write(path, path.name)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()

    set_root = root / "水滴君_日常神回覆_16張"
    stickers_dir = set_root / "stickers"
    previews_dir = set_root / "previews"
    stickers_dir.mkdir(parents=True, exist_ok=True)
    previews_dir.mkdir(parents=True, exist_ok=True)

    report_lines = ["No.\tPhrase\tSize\tFrames\tDurationMs\tLoop\tBytes\tAlpha"]
    for index, phrase in enumerate(PHRASES, 1):
        source = root / phrase / f"{phrase}_動態貼圖_APNG.png"
        result = validate_apng(source)
        target_name = f"{index:02d}.png"
        shutil.copy2(source, stickers_dir / target_name)
        shutil.copy2(root / phrase / f"{phrase}_動畫預覽.gif", previews_dir / f"{index:02d}_{phrase}.gif")
        make_individual_package(root, phrase)
        report_lines.append(
            f"{index:02d}\t{phrase}\t320x270\t{result['frames']}\t{result['duration']}\t"
            f"{result['loop']}\t{result['bytes']}\t{result['alpha']}"
        )

    shutil.copy2(root / "沒問題" / "main_240x240.png", set_root / "main.png")
    shutil.copy2(root / "沒問題" / "tab_96x74.png", set_root / "tab.png")
    (set_root / "規格檢查.tsv").write_text("\n".join(report_lines) + "\n", encoding="utf-8")
    mapping = "\n".join(f"{index:02d}.png = {phrase}" for index, phrase in enumerate(PHRASES, 1))
    (set_root / "貼圖編號對照.txt").write_text(mapping + "\n", encoding="utf-8")
    (set_root / "README.txt").write_text(
        "水滴君・日常神回覆 16 張動態 LINE 貼圖\n\n"
        "stickers/01.png through 16.png: upload as the 16 animated stickers\n"
        "main.png: 240x240 main image APNG\n"
        "tab.png: 96x74 chat tab image PNG\n"
        "previews/: GIF previews, not for LINE upload\n"
        "All stickers: 320x270, 8 frames, 2 seconds, loop 2, total playback 4 seconds\n",
        encoding="utf-8",
    )

    zip_path = root / "水滴君_日常神回覆_16張_LINE上架包.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(set_root.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(set_root))
    print(zip_path)
    print(f"bytes={zip_path.stat().st_size}")


if __name__ == "__main__":
    main()
