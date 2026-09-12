from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


SUPPORTED = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("output")
    parser.add_argument("files", nargs="+")
    parser.add_argument("--columns", type=int, default=5)
    parser.add_argument("--thumb-width", type=int, default=240)
    parser.add_argument("--thumb-height", type=int, default=190)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    files = [Path(item) for item in args.files if Path(item).suffix.lower() in SUPPORTED]
    columns = max(1, args.columns)
    cell_width = args.thumb_width + 20
    cell_height = args.thumb_height + 48
    rows = (len(files) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * cell_width, max(1, rows) * cell_height), "#f8fafc")
    draw = ImageDraw.Draw(sheet)

    for index, file_path in enumerate(files, start=1):
        row = (index - 1) // columns
        column = (index - 1) % columns
        x = column * cell_width + 10
        y = row * cell_height + 10
        try:
            with Image.open(file_path) as source:
                source.seek(0)
                image = source.convert("RGBA")
                background = Image.new("RGBA", image.size, "white")
                background.alpha_composite(image)
                fitted = ImageOps.contain(
                    background.convert("RGB"),
                    (args.thumb_width, args.thumb_height),
                    Image.Resampling.LANCZOS,
                )
                tile = Image.new("RGB", (args.thumb_width, args.thumb_height), "white")
                tile.paste(
                    fitted,
                    ((args.thumb_width - fitted.width) // 2, (args.thumb_height - fitted.height) // 2),
                )
                sheet.paste(tile, (x, y))
        except Exception:
            draw.rectangle((x, y, x + args.thumb_width, y + args.thumb_height), fill="#fee2e2")

        draw.text((x, y + args.thumb_height + 8), f"{index:02d}", fill="#0f172a")

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, quality=90)
    manifest = output.with_suffix(".txt")
    manifest.write_text(
        "\n".join(f"{index:02d}\t{path}" for index, path in enumerate(files, start=1)),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
