from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(r"D:\Pomodoro-app")
OUT = ROOT / "output" / "waterdrop-community-manager-32"
SOURCE = Path(
    r"C:\Users\ang22\.codex\generated_images\019f5ff2-236f-7fd1-83d6-6daff297878a"
    r"\exec-81df8116-1437-4fdc-8885-04b67ac28e06.png"
)
REMOVE_KEY = Path(r"C:\Users\ang22\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py")
PYTHON = Path(
    r"C:\Users\ang22\.cache\codex-runtimes\codex-primary-runtime"
    r"\dependencies\python\python.exe"
)
FONT_PATH = Path(r"C:\Windows\Fonts\NotoSansTC-VF.ttf")


def trim_alpha(image: Image.Image) -> Image.Image:
    box = image.getchannel("A").getbbox()
    if not box:
        raise ValueError("No visible subject after background removal")
    return image.crop(box)


def bubble_text(text: str) -> Image.Image:
    font_size = 76
    while True:
        font = ImageFont.truetype(str(FONT_PATH), font_size)
        try:
            font.set_variation_by_name("Black")
        except (AttributeError, OSError):
            pass
        box = font.getbbox(text, stroke_width=12)
        if box[2] - box[0] <= 342 or font_size <= 38:
            break
        font_size -= 2

    width, height = box[2] - box[0] + 28, box[3] - box[1] + 30
    origin = (14 - box[0], 10 - box[1])

    shadow = Image.new("RGBA", (width + 14, height + 14), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.text(
        (origin[0] + 5, origin[1] + 8),
        text,
        font=font,
        fill="#53207C",
        stroke_width=12,
        stroke_fill="#53207C",
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(1.3))

    layer = Image.new("RGBA", shadow.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.text(origin, text, font=font, fill="white", stroke_width=12, stroke_fill="white")
    draw.text(origin, text, font=font, fill="#7929C8", stroke_width=5, stroke_fill="#7929C8")

    mask = Image.new("L", layer.size, 0)
    md = ImageDraw.Draw(mask)
    md.text(origin, text, font=font, fill=255)
    gradient = Image.new("RGBA", layer.size)
    gp = gradient.load()
    top = (255, 75, 160)
    bottom = (142, 45, 229)
    for y in range(layer.height):
        t = y / max(1, layer.height - 1)
        color = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3)) + (255,)
        for x in range(layer.width):
            gp[x, y] = color
    layer.alpha_composite(Image.composite(gradient, Image.new("RGBA", layer.size), mask))

    merged = Image.alpha_composite(shadow, layer)
    return merged.rotate(2.2, resample=Image.Resampling.BICUBIC, expand=True)


def main() -> None:
    mothers = OUT / "mother_sheets"
    stickers = OUT / "stickers"
    mothers.mkdir(parents=True, exist_ok=True)
    stickers.mkdir(parents=True, exist_ok=True)
    mother = mothers / "01-source.png"
    transparent = mothers / "01-transparent.png"
    if not mother.exists():
        shutil.copy2(SOURCE, mother)
    if not transparent.exists():
        subprocess.run(
            [
                str(PYTHON),
                str(REMOVE_KEY),
                "--input",
                str(mother),
                "--out",
                str(transparent),
                "--auto-key",
                "border",
                "--soft-matte",
                "--transparent-threshold",
                "12",
                "--opaque-threshold",
                "220",
                "--despill",
                "--edge-contract",
                "1",
            ],
            check=True,
        )

    canvas = Image.new("RGBA", (370, 320), (0, 0, 0, 0))
    text = bubble_text("已收到")
    canvas.alpha_composite(text, ((370 - text.width) // 2, 1))

    character = trim_alpha(Image.open(transparent).convert("RGBA"))
    max_w, max_h = 345, 235
    scale = min(max_w / character.width, max_h / character.height)
    character = character.resize(
        (round(character.width * scale), round(character.height * scale)),
        Image.Resampling.LANCZOS,
    )
    canvas.alpha_composite(character, ((370 - character.width) // 2, 320 - character.height - 3))
    canvas.save(stickers / "01.png", optimize=True)

    preview = Image.new("RGB", (740, 640), "#181818")
    large = canvas.resize((740, 640), Image.Resampling.LANCZOS)
    preview.paste(large, (0, 0), large)
    preview.save(OUT / "sample-01-preview.png", optimize=True)
    print(f"sticker={stickers / '01.png'}")
    print(f"preview={OUT / 'sample-01-preview.png'}")


if __name__ == "__main__":
    main()
