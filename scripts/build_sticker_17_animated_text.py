import argparse
import json
import math
import zipfile
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont


PHRASE = "了解"
FRAME_ORDER = (7, 0, 1, 2, 3, 4, 5, 6)
CANVAS = (320, 270)


def split_sheet(sheet: Image.Image) -> list[Image.Image]:
    cells = []
    for row in range(4):
        y0 = round(row * sheet.height / 4)
        y1 = round((row + 1) * sheet.height / 4)
        for col in range(2):
            x0 = round(col * sheet.width / 2)
            x1 = round((col + 1) * sheet.width / 2)
            cells.append(sheet.crop((x0 + 1, y0 + 1, x1 - 1, y1 - 1)))
    return cells


def font_path() -> Path:
    for candidate in (Path(r"C:\Windows\Fonts\msjhbd.ttc"), Path(r"C:\Windows\Fonts\msjh.ttc")):
        if candidate.exists():
            return candidate
    raise FileNotFoundError("Traditional Chinese font unavailable")


def glyph(char: str, font: ImageFont.FreeTypeFont, fill: str, scale: float) -> Image.Image:
    box = font.getbbox(char, stroke_width=4)
    width, height = box[2] - box[0] + 18, box[3] - box[1] + 18
    layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.text((9 - box[0], 9 - box[1] + 2), char, font=font, fill=(30, 41, 59, 105), stroke_width=7, stroke_fill=(255, 255, 255, 185))
    draw.text((9 - box[0], 9 - box[1]), char, font=font, fill=fill, stroke_width=4, stroke_fill="white")
    if scale != 1:
        layer = layer.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS)
    return layer


def sparkle(canvas: Image.Image, center: tuple[int, int], radius: int, color: str):
    x, y = center
    points = [(x, y - radius), (x + 3, y - 3), (x + radius, y), (x + 3, y + 3),
              (x, y + radius), (x - 3, y + 3), (x - radius, y), (x - 3, y - 3)]
    ImageDraw.Draw(canvas).polygon(points, fill=color, outline="white")


def animated_text(frame_index: int) -> Image.Image:
    font = ImageFont.truetype(str(font_path()), 66)
    # Alternating character bounce plus a brief gold highlight sweep.
    y_offsets = [(0, 0), (-7, 1), (1, -7), (-3, -3), (0, 0), (-2, -5), (-4, -1), (0, 0)]
    scales = [(1.0, 1.0), (1.12, 0.96), (0.96, 1.12), (1.05, 1.05),
              (1.0, 1.0), (1.02, 1.08), (1.08, 1.02), (1.0, 1.0)]
    colors = [
        ("#7C3AED", "#2563EB"),
        ("#F59E0B", "#2563EB"),
        ("#7C3AED", "#F59E0B"),
        ("#A855F7", "#3B82F6"),
        ("#C084FC", "#2563EB"),
        ("#7C3AED", "#60A5FA"),
        ("#A855F7", "#2563EB"),
        ("#7C3AED", "#2563EB"),
    ]
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    layers = [glyph(PHRASE[i], font, colors[frame_index][i], scales[frame_index][i]) for i in range(2)]
    gap = 0
    total = layers[0].width + layers[1].width + gap
    x = (CANVAS[0] - total) // 2
    for i, layer in enumerate(layers):
        y = 2 + y_offsets[frame_index][i]
        canvas.alpha_composite(layer, (x, y))
        x += layer.width + gap
    if frame_index in (3, 4, 5, 6):
        sweep_x = (93, 132, 178, 220)[frame_index - 3]
        sparkle(canvas, (sweep_x, 13 + (frame_index % 2) * 8), 9, "#FBBF24")
    return canvas


def render_character(cell: Image.Image) -> Image.Image:
    bbox = cell.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Empty sprite cell")
    subject = cell.crop(bbox)
    subject.thumbnail((310, 194), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(subject, ((CANVAS[0] - subject.width) // 2, 73 + (194 - subject.height) // 2))
    return canvas


def save_outputs(root: Path):
    sheet = Image.open(root / "sprite_transparent.png").convert("RGBA")
    cells = split_sheet(sheet)
    character_frames = [render_character(cells[i]) for i in FRAME_ORDER]
    frames = []
    frames_dir = root / "frames"
    frames_dir.mkdir(exist_ok=True)
    for index, character in enumerate(character_frames):
        frame = character.copy()
        frame.alpha_composite(animated_text(index))
        frame.save(frames_dir / f"frame_{index + 1:02d}.png", optimize=True, compress_level=9)
        frames.append(frame)

    duration = 250
    apng = root / "17_了解_文字動態_APNG.png"
    frames[0].save(apng, save_all=True, append_images=frames[1:], duration=duration, loop=2,
                   disposal=0, blend=0, optimize=True, compress_level=9)

    gif_frames = []
    for frame in frames:
        matte = Image.new("RGBA", CANVAS, "white")
        matte.alpha_composite(frame)
        gif_frames.append(matte.convert("P", palette=Image.Palette.ADAPTIVE, colors=256))
    gif = root / "17_了解_文字動態預覽.gif"
    gif_frames[0].save(gif, save_all=True, append_images=gif_frames[1:], duration=duration, loop=0, disposal=2)

    contact = Image.new("RGB", (640, 270), (235, 241, 247))
    for index, frame in enumerate(frames):
        matte = Image.new("RGBA", CANVAS, "white")
        matte.alpha_composite(frame)
        contact.paste(matte.convert("RGB").resize((160, 135), Image.Resampling.LANCZOS),
                      ((index % 4) * 160, (index // 4) * 135))
    contact_path = root / "17_了解_8格動作與文字動畫總覽.jpg"
    contact.save(contact_path, quality=95)

    main_frames = [frame.resize((240, 203), Image.Resampling.LANCZOS) for frame in frames]
    main_canvases = []
    for frame in main_frames:
        canvas = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
        canvas.alpha_composite(frame, (0, 18))
        main_canvases.append(canvas)
    main = root / "main_240x240.png"
    main_canvases[0].save(main, save_all=True, append_images=main_canvases[1:], duration=duration,
                          loop=2, disposal=0, blend=0, optimize=True, compress_level=9)

    first_bbox = frames[0].getchannel("A").getbbox() or (0, 0, *CANVAS)
    tab_subject = frames[0].crop(first_bbox)
    tab_subject.thumbnail((92, 70), Image.Resampling.LANCZOS)
    tab = Image.new("RGBA", (96, 74), (0, 0, 0, 0))
    tab.alpha_composite(tab_subject, ((96 - tab_subject.width) // 2, (74 - tab_subject.height) // 2))
    tab.save(root / "tab_96x74.png", optimize=True, compress_level=9)

    image = Image.open(apng)
    decoded = []
    for i in range(image.n_frames):
        image.seek(i)
        decoded.append(image.convert("RGBA").copy())
    changes = []
    for i in range(8):
        diff = ImageChops.difference(decoded[i], decoded[(i + 1) % 8]).convert("L")
        changes.append(sum(1 for value in diff.getdata() if value > 8))
    report = {
        "status": "PASS",
        "phrase": PHRASE,
        "size": image.size,
        "frames": image.n_frames,
        "duration_ms": image.info.get("duration"),
        "loop": image.info.get("loop"),
        "bytes": apng.stat().st_size,
        "transparent": decoded[0].getchannel("A").getextrema()[0] == 0,
        "all_frames_distinct": min(changes) > 500,
        "changed_pixels_between_frames": changes,
        "text_animation": "逐字彈跳、雙色脈動、金色亮光掃過",
    }
    if image.size != CANVAS or image.n_frames != 8 or report["bytes"] >= 1024 * 1024 or not report["transparent"] or not report["all_frames_distinct"]:
        raise ValueError(report)
    (root / "17_了解_驗證報告.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    zip_path = root / "17_了解_定位樣品_LINE檔案.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in (apng, gif, contact_path, main, root / "tab_96x74.png", root / "17_了解_驗證報告.json"):
            archive.write(path, path.name)
    print(json.dumps({"apng": str(apng), "gif": str(gif), "zip": str(zip_path), "report": report}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    args = parser.parse_args()
    save_outputs(args.root.resolve())
