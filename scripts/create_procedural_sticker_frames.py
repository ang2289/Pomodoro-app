import argparse
from pathlib import Path

from PIL import Image


KEYFRAMES = [
    (1.00, 1.00, 0, 0, 0.0),
    (1.01, 0.96, 0, 12, -1.0),
    (0.98, 1.03, 0, -8, 1.0),
    (1.03, 1.07, 0, -28, 0.0),
    (1.02, 1.03, 0, -12, -1.0),
    (1.01, 0.97, 0, 9, 1.0),
    (1.01, 1.01, 0, -4, -0.5),
    (1.00, 1.00, 0, 0, 0.3),
]


def transform(source: Image.Image, sx: float, sy: float, dx: int, dy: int, angle: float):
    width, height = source.size
    resized = source.resize(
        (max(1, round(width * sx)), max(1, round(height * sy))),
        Image.Resampling.LANCZOS,
    )
    rotated = resized.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    canvas = Image.new("RGBA", source.size, (0, 0, 0, 0))
    x = (width - rotated.width) // 2 + dx
    y = (height - rotated.height) // 2 + dy
    canvas.alpha_composite(rotated, (x, y))
    return canvas


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("hero", type=Path)
    parser.add_argument("frames_dir", type=Path)
    args = parser.parse_args()

    args.frames_dir.mkdir(parents=True, exist_ok=True)
    source = Image.open(args.hero).convert("RGBA")
    if source.getchannel("A").getextrema()[0] != 0:
        raise ValueError("Hero image does not contain transparent pixels")

    for index, values in enumerate(KEYFRAMES, 1):
        frame = transform(source, *values)
        frame.save(args.frames_dir / f"frame_{index:02d}.png", optimize=True, compress_level=9)
    print(f"Wrote {len(KEYFRAMES)} frames to {args.frames_dir}")


if __name__ == "__main__":
    main()
