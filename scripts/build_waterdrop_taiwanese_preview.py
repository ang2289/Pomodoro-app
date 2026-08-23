from __future__ import annotations

import shutil
import subprocess
import sys
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(r"D:\Pomodoro-app")
OUT = ROOT / "output" / "waterdrop-taiwanese-32"
SOURCE_DIR = Path(r"C:\Users\ang22\.codex\generated_images\019f5ff2-236f-7fd1-83d6-6daff297878a")
REMOVE_KEY = Path(r"C:\Users\ang22\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py")
FONT = Path(r"C:\Windows\Fonts\msjhbd.ttc")

ITEMS = [
    ("exec-723ed35e-37f9-4b34-9133-9a7a5797bfe2.png", "真的假的", "#F0445E"),
    ("exec-4ea41b32-c634-4a38-8e1e-86ec9575933d.png", "蛤？", "#8B43D6"),
    ("exec-7efa234a-59ab-4c59-83c9-f597c90458b9.png", "有影無？", "#F28C18"),
    ("exec-fac0db74-9a19-45db-8ffb-3c1b9d819b6a.png", "有夠扯", "#16A064"),
    ("exec-bfab8033-a45b-4274-95b0-803f0353057f.png", "太離譜了吧", "#E43887"),
    ("exec-266a2b49-06c7-4ba4-a22e-9b7141cae07c.png", "是在哈囉", "#1677D2"),
    ("exec-00c4011e-e21e-4886-a23b-8a8bd16d81e5.png", "哩洗勒", "#703BC0"),
    ("exec-8708b80f-8573-406d-a649-6f6a1ba855a6.png", "笑死", "#F06A1A"),
    ("exec-f75263cf-1b21-4b0e-95d4-219110c12bf4.png", "母湯喔", "#E43887"),
    ("exec-aa24be7f-9cbf-441c-8f29-fb23b93e71b6.png", "麥鬧啦", "#1677D2"),
    ("exec-906fa128-7b96-4b17-a2dc-6efd56eb2a92.png", "先不要", "#F28C18"),
    ("exec-5ffc94cf-0deb-4c4e-9e7b-c98ed967c03a.png", "安捏母湯", "#16A064"),
    ("exec-a73df66e-d243-4a9c-89b8-c620f0be5a56.png", "袂使啦", "#703BC0"),
    ("exec-b0927dcd-0152-4a36-a969-3c1030db2b96.png", "阿不然咧", "#F0445E"),
    ("exec-bd86890f-377c-425e-adf2-ff3581de4dee.png", "我就問", "#1677D2"),
    ("exec-a0ec13fb-94ac-4e98-a9c4-ea9bacdb78b3.png", "好喔", "#F06A1A"),
    ("exec-54203165-a450-4254-a303-09f327ba7193.png", "可以喔", "#16A064"),
    ("exec-d02fcb4f-626f-4498-ae9c-0cebead567e1.png", "賀啦", "#E43887"),
    ("exec-889764b2-2b9e-4a9c-9b79-bf973b645dde.png", "沒有啦", "#703BC0"),
    ("exec-96cba06e-22a8-4bb0-b23d-25379d6c2253.png", "哪有", "#F28C18"),
    ("exec-293e057c-3142-49ef-a1ae-d53cd83d4873.png", "沒要緊", "#1677D2"),
    ("exec-54615ba3-e9ad-47c9-a2ef-21b01888cf3e.png", "真歹勢", "#F0445E"),
    ("exec-a660f0a0-b8f5-49a9-955c-d78d5973e188.png", "拍謝啦", "#703BC0"),
    ("exec-15a9bfc3-c0b1-4475-83e4-c101a7366f4e.png", "甘蝦", "#F06A1A"),
    ("exec-103e2b61-fe47-4f91-8842-3301c165e9d2.png", "呷飽未", "#16A064"),
    ("exec-a379e2a2-1d45-4683-b463-e9fb426032c2.png", "緊來呷", "#E43887"),
    ("exec-51b90c2a-0be6-4f8f-b2f9-6b2731b33e3d.png", "緊來喔", "#1677D2"),
    ("exec-e90dec19-a48d-4cc2-b396-5ba46a1ce10b.png", "等一下啦", "#F28C18"),
    ("exec-c322b77b-f638-403f-aeb4-5d5f20e13ad0.png", "愛睏啊", "#703BC0"),
    ("exec-40f85fc8-1cc8-43f6-90e1-e6202b3cc6b1.png", "足感心", "#F0445E"),
    ("exec-9da50598-bebf-4e2e-bccc-44dfb534d5d7.png", "真讚", "#F06A1A"),
    ("exec-2fd58f97-b478-468e-bb24-1034dc48c715.png", "保重嘿", "#16A064"),
]


def fit_font(text: str, max_width: int, max_size: int = 60) -> ImageFont.FreeTypeFont:
    for size in range(max_size, 25, -1):
        font = ImageFont.truetype(str(FONT), size)
        box = font.getbbox(text, stroke_width=3)
        if box[2] - box[0] <= max_width:
            return font
    return ImageFont.truetype(str(FONT), 26)


def trim_alpha(image: Image.Image) -> Image.Image:
    box = image.getchannel("A").getbbox()
    if box is None:
        raise ValueError("Transparent image contains no visible pixels")
    return image.crop(box)


def compose(character: Image.Image, text: str, color: str) -> Image.Image:
    canvas = Image.new("RGBA", (370, 320), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    font = fit_font(text, 344)
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=4)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = (370 - text_w) // 2 - bbox[0]
    text_y = 5 - bbox[1]
    draw.text(
        (text_x, text_y),
        text,
        font=font,
        fill=color,
        stroke_width=7,
        stroke_fill="white",
    )
    draw.text(
        (text_x, text_y),
        text,
        font=font,
        fill=color,
        stroke_width=2,
        stroke_fill="#243C79",
    )

    character = trim_alpha(character)
    top = max(75, text_h + 15)
    max_w, max_h = 354, 320 - top - 5
    scale = min(max_w / character.width, max_h / character.height)
    new_size = (max(1, round(character.width * scale)), max(1, round(character.height * scale)))
    character = character.resize(new_size, Image.Resampling.LANCZOS)
    x = (370 - character.width) // 2
    y = top + (max_h - character.height) // 2
    canvas.alpha_composite(character, (x, y))
    return canvas


def checkerboard(size: tuple[int, int], tile: int = 12) -> Image.Image:
    image = Image.new("RGB", size, "white")
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], tile):
        for x in range(0, size[0], tile):
            if (x // tile + y // tile) % 2 == 0:
                draw.rectangle((x, y, x + tile - 1, y + tile - 1), fill="#ECECEC")
    return image


def thumbnail(source: Image.Image, size: tuple[int, int], margin: int = 4) -> Image.Image:
    visible = trim_alpha(source)
    max_w, max_h = size[0] - margin * 2, size[1] - margin * 2
    scale = min(max_w / visible.width, max_h / visible.height)
    visible = visible.resize(
        (max(1, round(visible.width * scale)), max(1, round(visible.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(visible, ((size[0] - visible.width) // 2, (size[1] - visible.height) // 2))
    return canvas


def main() -> None:
    mothers = OUT / "mother_sheets"
    keyed = OUT / "keyed"
    stickers = OUT / "stickers"
    for directory in (mothers, keyed, stickers):
        directory.mkdir(parents=True, exist_ok=True)

    jobs: list[tuple[Path, Path]] = []
    for index, (filename, _phrase, _color) in enumerate(ITEMS, 1):
        source = SOURCE_DIR / filename
        mother = mothers / f"{index:02d}-source.png"
        transparent = keyed / f"{index:02d}-transparent.png"
        if not mother.exists():
            shutil.copy2(source, mother)
        if not transparent.exists():
            jobs.append((mother, transparent))

    def remove_key(job: tuple[Path, Path]) -> None:
        mother, transparent = job
        subprocess.run(
            [
                sys.executable,
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

    if jobs:
        with ThreadPoolExecutor(max_workers=4) as executor:
            list(executor.map(remove_key, jobs))

    completed: list[Image.Image] = []
    for index, (_filename, phrase, color) in enumerate(ITEMS, 1):
        transparent = keyed / f"{index:02d}-transparent.png"
        final = compose(Image.open(transparent).convert("RGBA"), phrase, color)
        final.save(stickers / f"{index:02d}.png", optimize=True)
        completed.append(final)

    preview = checkerboard((740, 1280)).convert("RGBA")
    for i, sticker in enumerate(completed):
        small = sticker.resize((185, 160), Image.Resampling.LANCZOS)
        preview.alpha_composite(small, ((i % 4) * 185, (i // 4) * 160))
    preview.convert("RGB").save(OUT / "preview_contact_sheet.jpg", quality=94)
    (OUT / "phrases.txt").write_text(
        "\n".join(f"{i:02d}. {item[1]}" for i, item in enumerate(ITEMS, 1)), encoding="utf-8"
    )
    thumbnail(completed[0], (240, 240), 8).save(OUT / "main.png", optimize=True)
    thumbnail(completed[0], (96, 74), 3).save(OUT / "tab.png", optimize=True)

    zip_path = OUT / "waterdrop-taiwanese-32-line-pack.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for file in sorted(stickers.glob("*.png")):
            archive.write(file, file.name)
        archive.write(OUT / "main.png", "main.png")
        archive.write(OUT / "tab.png", "tab.png")
    print(f"stickers={len(completed)}")
    print(f"output={OUT}")
    print(f"preview={OUT / 'preview_contact_sheet.jpg'}")
    print(f"zip={zip_path}")


if __name__ == "__main__":
    main()
