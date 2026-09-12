from __future__ import annotations

import zipfile
from pathlib import Path

import numpy as np
from PIL import Image


SOURCES = [
    Path(r"C:\Users\ang22\.codex\generated_images\019f4ed7-2640-7990-b5d3-30c60dfeec74\exec-a3286207-ef75-4848-9107-20749b667182.png"),
    Path(r"C:\Users\ang22\.codex\generated_images\019f4ed7-2640-7990-b5d3-30c60dfeec74\exec-c28b85a5-cb64-4089-a141-72c887379601.png"),
]
OUT = Path(r"D:\Pomodoro-app\output\waterdrop-life-32")
PHRASES = [
    "起床啦", "睡飽了", "吃飯囉", "我餓了", "喝水啦", "忙完了", "先忙一下", "等等回你",
    "快到了", "我到了", "路上小心", "注意安全", "記得帶傘", "天氣好熱", "冷死了", "下雨啦",
    "笑死", "傻眼", "嚇一跳", "好尷尬", "無言", "累癱了", "想睡了", "壓力山大",
    "約嗎", "走起", "一起吃", "改天約", "電話聊", "傳給我", "我看看", "晚點說",
]


def remove_green_key(image: Image.Image) -> Image.Image:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    rgb = rgba[..., :3].astype(np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    green_advantage = g - np.maximum(r, b)
    # Preserve the blue translucent mascot; fade only pixels strongly dominated by green.
    alpha = np.clip((125.0 - green_advantage) / 105.0, 0.0, 1.0)
    key_candidate = (g > 105) & (green_advantage > 20)
    alpha = np.where(key_candidate, alpha, 1.0)
    rgba[..., 3] = np.minimum(rgba[..., 3], np.rint(alpha * 255).astype(np.uint8))
    rgba[rgba[..., 3] == 0, :3] = 0
    return Image.fromarray(rgba, "RGBA")


def trim_and_place(image: Image.Image, size: tuple[int, int], margin: int) -> Image.Image:
    alpha = np.asarray(image.getchannel("A"))
    ys, xs = np.where(alpha > 8)
    if not len(xs):
        raise ValueError("Chroma-key removal produced an empty sticker")
    crop = image.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    max_w, max_h = size[0] - margin * 2, size[1] - margin * 2
    scale = min(max_w / crop.width, max_h / crop.height, 1.0)
    resized = crop.resize(
        (max(1, round(crop.width * scale)), max(1, round(crop.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - resized.width) // 2
    y = (size[1] - resized.height) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def thumbnail(source: Image.Image, size: tuple[int, int], margin: int = 4) -> Image.Image:
    return trim_and_place(source, size, margin)


def make_contact_sheet(images: list[Image.Image]) -> Image.Image:
    cell_w, cell_h = 185, 160
    sheet = Image.new("RGB", (cell_w * 4, cell_h * 8), "white")
    tile = 12
    pixels = np.asarray(sheet).copy()
    yy, xx = np.indices((sheet.height, sheet.width))
    checker = ((xx // tile + yy // tile) % 2) == 0
    pixels[checker] = (235, 235, 235)
    sheet = Image.fromarray(pixels, "RGB").convert("RGBA")
    for i, image in enumerate(images):
        preview = image.resize((cell_w, cell_h), Image.Resampling.LANCZOS)
        sheet.alpha_composite(preview, ((i % 4) * cell_w, (i // 4) * cell_h))
    return sheet.convert("RGB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    originals = OUT / "mother_sheets"
    stickers = OUT / "stickers"
    originals.mkdir(exist_ok=True)
    stickers.mkdir(exist_ok=True)

    completed: list[Image.Image] = []
    index = 0
    for sheet_no, source in enumerate(SOURCES, start=1):
        sheet = Image.open(source).convert("RGBA")
        sheet.save(originals / f"sheet_{sheet_no}.png")
        x_edges = [round(i * sheet.width / 4) for i in range(5)]
        y_edges = [round(i * sheet.height / 4) for i in range(5)]
        for row in range(4):
            for col in range(4):
                cell = sheet.crop((x_edges[col], y_edges[row], x_edges[col + 1], y_edges[row + 1]))
                keyed = remove_green_key(cell)
                final = trim_and_place(keyed, (370, 320), 8)
                filename = f"{index + 1:02d}.png"
                final.save(stickers / filename, optimize=True)
                completed.append(final)
                index += 1

    thumbnail(completed[0], (240, 240), 8).save(OUT / "main.png", optimize=True)
    thumbnail(completed[0], (96, 74), 3).save(OUT / "tab.png", optimize=True)
    (OUT / "phrases.txt").write_text(
        "\n".join(f"{i:02d}. {phrase}" for i, phrase in enumerate(PHRASES, 1)),
        encoding="utf-8",
    )
    make_contact_sheet(completed).save(OUT / "preview_contact_sheet.jpg", quality=92)

    zip_path = OUT / "waterdrop-life-32-line-pack.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for file in sorted(stickers.glob("*.png")):
            zf.write(file, file.name)
        zf.write(OUT / "main.png", "main.png")
        zf.write(OUT / "tab.png", "tab.png")

    print(f"stickers={len(completed)}")
    print(f"output={OUT}")
    print(f"zip={zip_path}")


if __name__ == "__main__":
    main()
