from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from PIL import Image


OUT = Path(r"D:\Pomodoro-app\output\waterdrop-community-manager-32")
SOURCE = Path(
    r"C:\Users\ang22\.codex\generated_images\019f5ff2-236f-7fd1-83d6-6daff297878a"
    r"\exec-1d9d1364-4532-40e9-b474-4c0df656bf61.png"
)
PYTHON = Path(
    r"C:\Users\ang22\.cache\codex-runtimes\codex-primary-runtime"
    r"\dependencies\python\python.exe"
)
REMOVE_KEY = Path(r"C:\Users\ang22\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py")


def trim_and_place(image: Image.Image, size: tuple[int, int] = (370, 320), margin: int = 5) -> Image.Image:
    box = image.getchannel("A").getbbox()
    if not box:
        raise ValueError("Background removal produced no visible pixels")
    image = image.crop(box)
    max_w, max_h = size[0] - margin * 2, size[1] - margin * 2
    scale = min(max_w / image.width, max_h / image.height)
    image = image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(image, ((size[0] - image.width) // 2, (size[1] - image.height) // 2))
    return canvas


def main() -> None:
    mothers = OUT / "mother_sheets"
    stickers = OUT / "stickers"
    mothers.mkdir(parents=True, exist_ok=True)
    stickers.mkdir(parents=True, exist_ok=True)
    mother = mothers / "01-v2-source.png"
    transparent = mothers / "01-v2-transparent.png"
    shutil.copy2(SOURCE, mother)
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
    final = trim_and_place(Image.open(transparent).convert("RGBA"))
    final_path = stickers / "01-v2.png"
    final.save(final_path, optimize=True)

    preview = Image.new("RGB", (740, 640), "#181818")
    large = final.resize((740, 640), Image.Resampling.LANCZOS)
    preview.paste(large, (0, 0), large)
    preview_path = OUT / "sample-01-v2-preview.png"
    preview.save(preview_path, optimize=True)
    print(f"sticker={final_path}")
    print(f"preview={preview_path}")


if __name__ == "__main__":
    main()
