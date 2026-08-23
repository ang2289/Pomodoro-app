from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("output_dir")
    parser.add_argument("images", nargs="+", help="來源路徑=輸出檔名.webp")
    parser.add_argument("--max-width", type=int, default=1600)
    parser.add_argument("--max-height", type=int, default=1600)
    parser.add_argument("--quality", type=int, default=86)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    for mapping in args.images:
        source_text, output_name = mapping.rsplit("=", 1)
        source = Path(source_text)
        output = output_dir / output_name

        with Image.open(source) as opened:
            opened.seek(0)
            image = ImageOps.exif_transpose(opened).convert("RGBA")
            white = Image.new("RGBA", image.size, "white")
            white.alpha_composite(image)
            prepared = white.convert("RGB")
            prepared.thumbnail(
                (args.max_width, args.max_height),
                Image.Resampling.LANCZOS,
            )
            prepared.save(output, "WEBP", quality=args.quality, method=6)


if __name__ == "__main__":
    main()
