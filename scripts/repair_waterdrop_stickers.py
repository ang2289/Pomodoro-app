from __future__ import annotations

import zipfile
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

from build_waterdrop_sticker_pack import make_contact_sheet, remove_green_key, trim_and_place


OUT = Path(r"D:\Pomodoro-app\output\waterdrop-life-32")
STICKERS = OUT / "stickers"
REPAIR_28 = Path(r"C:\Users\ang22\.codex\generated_images\019f4ed7-2640-7990-b5d3-30c60dfeec74\exec-8c491262-c064-4428-aafe-960f3b0b1533.png")
REPAIR_32 = Path(r"C:\Users\ang22\.codex\generated_images\019f4ed7-2640-7990-b5d3-30c60dfeec74\exec-2c33f116-74e5-45be-be36-2a2c37acd10f.png")


def remove_edge_fragments(image: Image.Image) -> Image.Image:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    mask = rgba[..., 3] > 8
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    components: list[tuple[list[tuple[int, int]], bool]] = []
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or seen[y, x]:
                continue
            q = deque([(y, x)])
            seen[y, x] = True
            pixels: list[tuple[int, int]] = []
            touches_edge = False
            while q:
                cy, cx = q.popleft()
                pixels.append((cy, cx))
                touches_edge |= cy == 0 or cx == 0 or cy == h - 1 or cx == w - 1
                for ny in range(max(0, cy - 1), min(h, cy + 2)):
                    for nx in range(max(0, cx - 1), min(w, cx + 2)):
                        if mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True
                            q.append((ny, nx))
            components.append((pixels, touches_edge))
    for pixels, touches_edge in components:
        if touches_edge and len(pixels) < 5000:
            ys, xs = zip(*pixels)
            rgba[np.array(ys), np.array(xs)] = 0
    return Image.fromarray(rgba, "RGBA")


def replace_from_green(source: Path, destination: Path) -> None:
    keyed = remove_green_key(Image.open(source).convert("RGBA"))
    trim_and_place(keyed, (370, 320), 8).save(destination, optimize=True)


def rebuild_preview_and_zip() -> None:
    images = [Image.open(STICKERS / f"{i:02d}.png").convert("RGBA") for i in range(1, 33)]
    make_contact_sheet(images).save(OUT / "preview_contact_sheet.jpg", quality=92)
    zip_path = OUT / "waterdrop-life-32-line-pack.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for file in sorted(STICKERS.glob("*.png")):
            zf.write(file, file.name)
        for name in ("main.png", "tab.png"):
            zf.write(OUT / name, name)


def main() -> None:
    replace_from_green(REPAIR_28, STICKERS / "28.png")
    image31 = Image.open(STICKERS / "31.png").convert("RGBA")
    cleaned31 = remove_edge_fragments(image31)
    # The adjacent-cell sliver sits alone in the far-right 50 px; the intended
    # sticker artwork ends well before this safe cutoff.
    rgba31 = np.asarray(cleaned31, dtype=np.uint8).copy()
    rgba31[:, 320:, :] = 0
    Image.fromarray(rgba31, "RGBA").save(STICKERS / "31.png", optimize=True)
    replace_from_green(REPAIR_32, STICKERS / "32.png")
    rebuild_preview_and_zip()
    print("repaired=28.png,31.png,32.png")


if __name__ == "__main__":
    main()
