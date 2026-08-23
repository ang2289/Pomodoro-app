from __future__ import annotations

import zipfile
from pathlib import Path

from PIL import Image

from build_waterdrop_sticker_pack import make_contact_sheet, remove_green_key, thumbnail, trim_and_place


OUT = Path(r"D:\Pomodoro-app\output\waterdrop-office-32")
SOURCES = [OUT / "mother_sheets" / "sheet_1.png", OUT / "mother_sheets" / "sheet_2.png"]


def main() -> None:
    stickers = OUT / "stickers"
    stickers.mkdir(parents=True, exist_ok=True)

    completed: list[Image.Image] = []
    index = 1
    for source in SOURCES:
        sheet = Image.open(source).convert("RGBA")
        x_edges = [round(i * sheet.width / 4) for i in range(5)]
        y_edges = [round(i * sheet.height / 4) for i in range(5)]
        for row in range(4):
            for col in range(4):
                cell = sheet.crop((x_edges[col], y_edges[row], x_edges[col + 1], y_edges[row + 1]))
                keyed = remove_green_key(cell)
                final = trim_and_place(keyed, (370, 320), 8)
                final.save(stickers / f"{index:02d}.png", optimize=True)
                completed.append(final)
                index += 1

    thumbnail(completed[0], (240, 240), 8).save(OUT / "main.png", optimize=True)
    thumbnail(completed[0], (96, 74), 3).save(OUT / "tab.png", optimize=True)
    make_contact_sheet(completed).save(OUT / "preview_contact_sheet.jpg", quality=94)

    zip_path = OUT / "waterdrop-office-32-line-pack.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for file in sorted(stickers.glob("*.png")):
            zf.write(file, file.name)
        zf.write(OUT / "main.png", "main.png")
        zf.write(OUT / "tab.png", "tab.png")

    print(f"stickers={len(completed)}")
    print(f"zip={zip_path}")


if __name__ == "__main__":
    main()
