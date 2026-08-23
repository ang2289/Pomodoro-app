import argparse
import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


STICKERS = [
    ("沒問題", "#2563EB"),
    ("收到", "#0EA5A4"),
    ("謝謝", "#EC4899"),
    ("辛苦了", "#F59E0B"),
    ("抱歉", "#EF4444"),
    ("拜託", "#8B5CF6"),
    ("好啊", "#F97316"),
    ("等等我", "#06B6D4"),
    ("馬上到", "#E11D48"),
    ("哈哈哈", "#D946EF"),
    ("加油", "#22C55E"),
    ("讚啦", "#EAB308"),
    ("早安", "#FB7185"),
    ("晚安", "#6366F1"),
    ("愛你", "#F43F5E"),
    ("傻眼", "#64748B"),
]

CANVAS = (320, 270)
FRAME_ORDER = (7, 0, 1, 2, 3, 4, 5, 6)


def find_font() -> Path:
    candidates = [
        Path(r"C:\Windows\Fonts\msjhbd.ttc"),
        Path(r"C:\Windows\Fonts\msjh.ttc"),
        Path(r"C:\Windows\Fonts\mingliu.ttc"),
    ]
    for path in candidates:
        if path.exists():
            return path
    raise FileNotFoundError("No Traditional Chinese font found")


def fit_font(text: str, font_path: Path, max_width: int = 300) -> ImageFont.FreeTypeFont:
    for size in range(68, 30, -1):
        font = ImageFont.truetype(str(font_path), size)
        box = font.getbbox(text, stroke_width=3)
        if box[2] - box[0] <= max_width:
            return font
    return ImageFont.truetype(str(font_path), 30)


def split_sheet(sheet: Image.Image) -> list[Image.Image]:
    frames = []
    for row in range(4):
        y0 = round(row * sheet.height / 4)
        y1 = round((row + 1) * sheet.height / 4)
        for col in range(2):
            x0 = round(col * sheet.width / 2)
            x1 = round((col + 1) * sheet.width / 2)
            # One-pixel inset keeps interpolation at panel seams out of the crop.
            frames.append(sheet.crop((x0 + 1, y0 + 1, x1 - 1, y1 - 1)))
    return frames


def render_frame(cell: Image.Image, text: str, color: str, font_path: Path) -> Image.Image:
    alpha = cell.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError(f"Empty storyboard cell for {text}")
    subject = cell.crop(bbox)
    subject.thumbnail((310, 194), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - subject.width) // 2
    y = 73 + (194 - subject.height) // 2
    canvas.alpha_composite(subject, (x, y))

    draw = ImageDraw.Draw(canvas)
    font = fit_font(text, font_path)
    box = draw.textbbox((0, 0), text, font=font, stroke_width=4)
    tw = box[2] - box[0]
    tx = (CANVAS[0] - tw) // 2 - box[0]
    ty = 1 - box[1]
    # A dark micro-outline plus thick white border keeps every unique color readable.
    draw.text((tx, ty + 2), text, font=font, fill=(30, 41, 59, 110), stroke_width=7, stroke_fill=(255, 255, 255, 190))
    draw.text((tx, ty), text, font=font, fill=color, stroke_width=4, stroke_fill="white")
    return canvas


def save_animation(frames: list[Image.Image], out_dir: Path, phrase: str) -> dict:
    frames_dir = out_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for index, frame in enumerate(frames, 1):
        frame.save(frames_dir / f"frame_{index:02d}.png", optimize=True, compress_level=9)

    duration = 250
    apng = out_dir / f"{phrase}_動態貼圖_APNG.png"
    frames[0].save(
        apng,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=2,
        disposal=0,
        blend=0,
        optimize=True,
        compress_level=9,
    )

    gif_frames = []
    for frame in frames:
        matte = Image.new("RGBA", frame.size, "white")
        matte.alpha_composite(frame)
        gif_frames.append(matte.convert("P", palette=Image.Palette.ADAPTIVE, colors=256))
    gif = out_dir / f"{phrase}_預覽.gif"
    gif_frames[0].save(gif, save_all=True, append_images=gif_frames[1:], duration=duration, loop=0, disposal=2)

    main_frames = []
    for frame in frames:
        resized = frame.copy()
        resized.thumbnail((240, 240), Image.Resampling.LANCZOS)
        main_canvas = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
        main_canvas.alpha_composite(resized, ((240 - resized.width) // 2, (240 - resized.height) // 2))
        main_frames.append(main_canvas)
    main = out_dir / "main_240x240.png"
    main_frames[0].save(main, save_all=True, append_images=main_frames[1:], duration=duration, loop=2, disposal=0, blend=0, optimize=True, compress_level=9)

    first = frames[0]
    alpha_box = first.getchannel("A").getbbox() or (0, 0, *first.size)
    tab_subject = first.crop(alpha_box)
    tab_subject.thumbnail((92, 70), Image.Resampling.LANCZOS)
    tab_canvas = Image.new("RGBA", (96, 74), (0, 0, 0, 0))
    tab_canvas.alpha_composite(tab_subject, ((96 - tab_subject.width) // 2, (74 - tab_subject.height) // 2))
    tab = out_dir / "tab_96x74.png"
    tab_canvas.save(tab, optimize=True, compress_level=9)

    action_sheet = Image.new("RGB", (640, 270), (235, 241, 247))
    for index, frame in enumerate(frames):
        matte = Image.new("RGBA", CANVAS, "white")
        matte.alpha_composite(frame)
        thumb = matte.convert("RGB").resize((160, 135), Image.Resampling.LANCZOS)
        action_sheet.paste(thumb, ((index % 4) * 160, (index // 4) * 135))
    action_sheet.save(out_dir / "8格動作總覽.jpg", quality=94)

    return {
        "phrase": phrase,
        "apng": apng.name,
        "bytes": apng.stat().st_size,
        "frames": len(frames),
        "duration_ms": duration,
        "loop": 2,
        "size": list(CANVAS),
    }


def make_contact_sheet(first_frames: list[tuple[str, str, Image.Image]], output: Path):
    thumb_size = (240, 203)
    sheet = Image.new("RGB", (thumb_size[0] * 4, thumb_size[1] * 4), (235, 241, 247))
    for index, (_, _, frame) in enumerate(first_frames):
        matte = Image.new("RGBA", CANVAS, "white")
        matte.alpha_composite(frame)
        thumb = matte.convert("RGB").resize(thumb_size, Image.Resampling.LANCZOS)
        sheet.paste(thumb, ((index % 4) * thumb_size[0], (index // 4) * thumb_size[1]))
    sheet.save(output, quality=94)


def package(root: Path, reports: list[dict], first_frames: list[tuple[str, str, Image.Image]]):
    package_root = root / "LINE上架包"
    stickers = package_root / "stickers"
    previews = package_root / "previews"
    stickers.mkdir(parents=True, exist_ok=True)
    previews.mkdir(parents=True, exist_ok=True)

    for index, (phrase, _) in enumerate(STICKERS, 1):
        folder = root / f"{index:02d}_{phrase}"
        shutil.copy2(folder / f"{phrase}_動態貼圖_APNG.png", stickers / f"{index:02d}.png")
        shutil.copy2(folder / f"{phrase}_預覽.gif", previews / f"{index:02d}_{phrase}.gif")
    shutil.copy2(root / "01_沒問題" / "main_240x240.png", package_root / "main.png")
    shutil.copy2(root / "01_沒問題" / "tab_96x74.png", package_root / "tab.png")
    (package_root / "規格驗證.json").write_text(json.dumps(reports, ensure_ascii=False, indent=2), encoding="utf-8")
    (package_root / "貼圖對照表.txt").write_text("\n".join(f"{i:02d}.png = {p}" for i, (p, _) in enumerate(STICKERS, 1)) + "\n", encoding="utf-8")
    (package_root / "README.txt").write_text(
        "水滴君日常回覆：16 張真正 8 格動作、彩色文字的 LINE 動態貼圖。\n"
        "stickers/01.png～16.png：320x270、透明 APNG、每張 8 格、每格 250ms、循環 2 次。\n"
        "main.png：240x240 動態主圖。tab.png：96x74 標籤圖。previews/：GIF 預覽。\n",
        encoding="utf-8",
    )
    make_contact_sheet(first_frames, package_root / "16張首格總覽.jpg")

    zip_path = root / "水滴君_日常神回覆_16張_8格動作彩色字_LINE上架包.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(package_root.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(package_root))
    return zip_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    font_path = find_font()
    reports = []
    first_frames = []

    for index, (phrase, color) in enumerate(STICKERS, 1):
        folder = root / f"{index:02d}_{phrase}"
        sheet_path = folder / "sprite_transparent.png"
        sheet = Image.open(sheet_path).convert("RGBA")
        cells = split_sheet(sheet)
        frames = [render_frame(cells[source_index], phrase, color, font_path) for source_index in FRAME_ORDER]
        report = save_animation(frames, folder, phrase)
        report["text_color"] = color
        if report["bytes"] >= 1024 * 1024:
            raise ValueError(f"{phrase} APNG exceeds 1 MB: {report['bytes']}")
        reports.append(report)
        first_frames.append((phrase, color, frames[0]))

    zip_path = package(root, reports, first_frames)
    print(json.dumps({"zip": str(zip_path), "reports": reports}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
