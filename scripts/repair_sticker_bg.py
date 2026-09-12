from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from collections import deque

from PIL import Image, ImageDraw, ImageFilter


IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def estimate_bg(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    band = max(5, min(h, w) // 70)
    samples = np.concatenate(
        [
            rgb[:band, :, :].reshape(-1, 3),
            rgb[-band:, :, :].reshape(-1, 3),
            rgb[:, :band, :].reshape(-1, 3),
            rgb[:, -band:, :].reshape(-1, 3),
        ],
        axis=0,
    )
    return np.median(samples, axis=0)


def connected_from_border(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        if mask[0, x]:
            seen[0, x] = True
            q.append((0, x))
        if mask[h - 1, x]:
            seen[h - 1, x] = True
            q.append((h - 1, x))
    for y in range(h):
        if mask[y, 0] and not seen[y, 0]:
            seen[y, 0] = True
            q.append((y, 0))
        if mask[y, w - 1] and not seen[y, w - 1]:
            seen[y, w - 1] = True
            q.append((y, w - 1))

    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))

    return seen


def background_clusters(rgb: np.ndarray) -> list[np.ndarray]:
    h, w, _ = rgb.shape
    band = max(6, min(h, w) // 60)
    samples = np.concatenate(
        [
            rgb[:band, :, :].reshape(-1, 3),
            rgb[-band:, :, :].reshape(-1, 3),
            rgb[:, :band, :].reshape(-1, 3),
            rgb[:, -band:, :].reshape(-1, 3),
        ],
        axis=0,
    )
    neutral = samples[(samples.max(axis=1) - samples.min(axis=1)) <= 7]
    if len(neutral) == 0:
        return [estimate_bg(rgb)]
    brightness = neutral.mean(axis=1)
    centers = []
    for lo, hi in [(232, 246), (246, 254)]:
        bucket = neutral[(brightness >= lo) & (brightness < hi)]
        if len(bucket):
            centers.append(np.median(bucket, axis=0))
    if not centers:
        centers.append(np.median(neutral, axis=0))
    return centers


def remove_bg(src: Path, dst: Path, threshold: float) -> None:
    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    rgb = arr[:, :, :3].astype(np.float32)
    alpha = arr[:, :, 3]
    clusters = background_clusters(rgb)
    distances = [np.sqrt(np.sum((rgb - c) ** 2, axis=2)) for c in clusters]
    dist = np.minimum.reduce(distances)
    neutral = (rgb.max(axis=2) - rgb.min(axis=2)) <= 9

    # The source background is a baked-in light checkerboard. Remove only the
    # checker tones sampled from the border, not every nearly-white area.
    bg_connected = connected_from_border((dist <= threshold) & neutral)

    matte = np.where(bg_connected, 0, 255).astype(np.uint8)
    # Small edge smoothing without making interior white artwork transparent.
    edge = Image.fromarray(matte, "L").filter(ImageFilter.GaussianBlur(0.45))
    matte = np.array(edge)
    matte[~bg_connected] = 255

    out = arr.copy()
    out[:, :, 3] = np.minimum(alpha, matte)
    dst.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(out, "RGBA").save(dst)


def make_dark_sheet(files: list[Path], out_dir: Path, sheet_path: Path) -> None:
    cell = 220
    cols = 4
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 24)), (22, 30, 38))
    draw = ImageDraw.Draw(sheet)
    for idx, src in enumerate(files):
        im = Image.open(out_dir / f"{src.stem}_去背.png").convert("RGBA")
        im.thumbnail((cell, cell))
        x0 = (idx % cols) * cell
        y0 = (idx // cols) * (cell + 24)
        tile = Image.new("RGBA", im.size, (22, 30, 38, 255))
        tile.alpha_composite(im)
        sheet.paste(tile.convert("RGB"), (x0 + (cell - im.width) // 2, y0))
        draw.text((x0 + 5, y0 + cell + 5), str(idx + 1), fill=(255, 255, 255))
    sheet_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(sheet_path, quality=94)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("--out-name", default="去背_修正版")
    parser.add_argument("--threshold", type=float, default=18.0)
    parser.add_argument("--preview", type=Path)
    args = parser.parse_args()

    folder = args.folder
    out_dir = folder / args.out_name
    files = sorted(p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS)
    for src in files:
        remove_bg(src, out_dir / f"{src.stem}_去背.png", args.threshold)
    if args.preview:
        make_dark_sheet(files, out_dir, args.preview)
    print(f"count={len(files)}")
    print(f"out={out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
