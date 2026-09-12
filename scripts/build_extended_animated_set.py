import argparse
import json
import math
import shutil
import zipfile
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont


EXTENDED = [
    (18, "可以", "#14B8A6", "#F59E0B", "wave"),
    (19, "不可以", "#DC2626", "#F97316", "shake"),
    (20, "在忙", "#0F766E", "#38BDF8", "wave"),
    (21, "晚點回", "#7C3AED", "#F59E0B", "sweep"),
    (22, "出發", "#EA580C", "#2563EB", "wave"),
    (23, "到了", "#E11D48", "#F59E0B", "pulse"),
    (24, "吃飯了", "#B45309", "#F97316", "wave"),
    (25, "注意安全", "#D97706", "#2563EB", "pulse"),
    (26, "恭喜", "#C026D3", "#F59E0B", "sparkle"),
    (27, "生日快樂", "#DB2777", "#8B5CF6", "wave"),
    (28, "想你", "#F43F5E", "#EC4899", "pulse"),
    (29, "超開心", "#F97316", "#FACC15", "sparkle"),
    (30, "生氣了", "#DC2626", "#F97316", "shake"),
    (31, "嚇一跳", "#7C2D12", "#F59E0B", "shake"),
    (32, "掰掰", "#0284C7", "#8B5CF6", "wave"),
]

FIRST_PHRASES = ["沒問題", "收到", "謝謝", "辛苦了", "抱歉", "拜託", "好啊", "等等我",
                 "馬上到", "哈哈哈", "加油", "讚啦", "早安", "晚安", "愛你", "傻眼"]
SECOND_PHRASES = ["了解"] + [item[1] for item in EXTENDED]
FRAME_ORDER = (7, 0, 1, 2, 3, 4, 5, 6)
CANVAS = (320, 270)


def find_font() -> Path:
    for path in (Path(r"C:\Windows\Fonts\msjhbd.ttc"), Path(r"C:\Windows\Fonts\msjh.ttc")):
        if path.exists():
            return path
    raise FileNotFoundError("Traditional Chinese font not found")


def split_sheet(sheet: Image.Image) -> list[Image.Image]:
    result = []
    for row in range(4):
        y0, y1 = round(row * sheet.height / 4), round((row + 1) * sheet.height / 4)
        for col in range(2):
            x0, x1 = round(col * sheet.width / 2), round((col + 1) * sheet.width / 2)
            result.append(sheet.crop((x0 + 1, y0 + 1, x1 - 1, y1 - 1)))
    return result


def font_for(text: str, path: Path) -> ImageFont.FreeTypeFont:
    sizes = {2: 66, 3: 56, 4: 47}
    return ImageFont.truetype(str(path), sizes.get(len(text), 44))


def glyph(char: str, font: ImageFont.FreeTypeFont, fill: str, scale: float) -> Image.Image:
    box = font.getbbox(char, stroke_width=4)
    width, height = box[2] - box[0] + 18, box[3] - box[1] + 18
    layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.text((9 - box[0], 11 - box[1]), char, font=font, fill=(30, 41, 59, 100),
              stroke_width=7, stroke_fill=(255, 255, 255, 185))
    draw.text((9 - box[0], 9 - box[1]), char, font=font, fill=fill,
              stroke_width=4, stroke_fill="white")
    if abs(scale - 1.0) > 0.001:
        layer = layer.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS)
    return layer


def add_sparkle(canvas: Image.Image, x: int, y: int, color: str = "#FBBF24"):
    r = 8
    points = [(x, y-r), (x+2, y-2), (x+r, y), (x+2, y+2),
              (x, y+r), (x-2, y+2), (x-r, y), (x-2, y-2)]
    ImageDraw.Draw(canvas).polygon(points, fill=color, outline="white")


def text_layer(text: str, primary: str, secondary: str, mode: str, frame: int, font_path: Path) -> Image.Image:
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    font = font_for(text, font_path)
    offsets = [0] * len(text)
    x_offsets = [0] * len(text)
    scales = [1.0] * len(text)
    colors = [primary] * len(text)

    if frame not in (0, 7):
        if mode == "wave":
            for i in range(len(text)):
                phase = (frame - 1 - i) * math.pi / 2
                offsets[i] = round(-6 * max(0, math.sin(phase)))
                scales[i] = 1.0 + (0.07 if offsets[i] < -2 else 0)
                if offsets[i] < -2:
                    colors[i] = secondary
        elif mode == "pulse":
            scale = 1.0 + 0.07 * math.sin((frame - 1) * math.pi / 3)
            scales = [scale] * len(text)
            offsets = [round(-3 * math.sin((frame - 1) * math.pi / 3))] * len(text)
            if frame in (2, 3, 4):
                colors = [secondary if (i + frame) % 2 == 0 else primary for i in range(len(text))]
        elif mode == "shake":
            shift = (-3, 3, -2, 2, -1, 1)[frame - 1]
            x_offsets = [shift if i % 2 == 0 else -shift for i in range(len(text))]
            offsets = [-2 if (i + frame) % 2 else 1 for i in range(len(text))]
            if frame in (3, 4):
                colors = [secondary] * len(text)
        elif mode in ("sweep", "sparkle"):
            active = min(len(text) - 1, round((frame - 1) * (len(text) - 1) / 5))
            colors[active] = secondary
            offsets[active] = -5
            scales[active] = 1.08

    layers = [glyph(char, font, colors[i], scales[i]) for i, char in enumerate(text)]
    total = sum(layer.width for layer in layers) - max(0, len(layers) - 1) * 2
    x = (CANVAS[0] - total) // 2
    centers = []
    for i, layer in enumerate(layers):
        px = x + x_offsets[i]
        py = 2 + offsets[i]
        canvas.alpha_composite(layer, (px, py))
        centers.append((px + layer.width // 2, py + 8))
        x += layer.width - 2
    if mode in ("sweep", "sparkle") and frame in range(1, 7):
        active = min(len(text) - 1, round((frame - 1) * (len(text) - 1) / 5))
        add_sparkle(canvas, centers[active][0] - 18, 13 + (frame % 2) * 7)
    return canvas


def render_subject(cell: Image.Image) -> Image.Image:
    bbox = cell.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("Empty sprite cell")
    subject = cell.crop(bbox)
    subject.thumbnail((310, 194), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(subject, ((320 - subject.width)//2, 73 + (194 - subject.height)//2))
    return canvas


def changed_pixels(a: Image.Image, b: Image.Image) -> int:
    diff = ImageChops.difference(a, b).convert("L")
    mask = diff.point(lambda p: 255 if p > 8 else 0)
    return mask.histogram()[255]


def save_one(root: Path, number: int, phrase: str, primary: str, secondary: str, mode: str, font_path: Path) -> dict:
    folder = root / f"{number:02d}_{phrase}"
    sheet = Image.open(folder / "sprite_transparent.png").convert("RGBA")
    cells = split_sheet(sheet)
    frames = []
    frames_dir = folder / "frames"
    frames_dir.mkdir(exist_ok=True)
    for frame_index, cell_index in enumerate(FRAME_ORDER):
        frame = render_subject(cells[cell_index])
        frame.alpha_composite(text_layer(phrase, primary, secondary, mode, frame_index, font_path))
        frame.save(frames_dir / f"frame_{frame_index+1:02d}.png", optimize=True, compress_level=9)
        frames.append(frame)

    duration = 250
    apng = folder / f"{number:02d}_{phrase}_文字動態_APNG.png"
    frames[0].save(apng, save_all=True, append_images=frames[1:], duration=duration, loop=2,
                   disposal=0, blend=0, optimize=True, compress_level=9)
    gif_frames = []
    for frame in frames:
        matte = Image.new("RGBA", CANVAS, "white")
        matte.alpha_composite(frame)
        gif_frames.append(matte.convert("P", palette=Image.Palette.ADAPTIVE, colors=256))
    gif = folder / f"{number:02d}_{phrase}_預覽.gif"
    gif_frames[0].save(gif, save_all=True, append_images=gif_frames[1:], duration=duration, loop=0, disposal=2)

    contact = Image.new("RGB", (640, 270), (235, 241, 247))
    for i, frame in enumerate(frames):
        matte = Image.new("RGBA", CANVAS, "white")
        matte.alpha_composite(frame)
        contact.paste(matte.convert("RGB").resize((160, 135), Image.Resampling.LANCZOS), ((i%4)*160, (i//4)*135))
    contact.save(folder / "8格角色與文字動畫總覽.jpg", quality=94)

    changes = [changed_pixels(frames[i], frames[(i+1)%8]) for i in range(8)]
    report = {
        "number": number, "phrase": phrase, "size": list(CANVAS), "frames": 8,
        "duration_ms": duration, "loop": 2, "bytes": apng.stat().st_size,
        "transparent": frames[0].getchannel("A").getextrema()[0] == 0,
        "all_frames_distinct": min(changes) > 500,
        "changed_pixels_between_frames": changes,
        "text_primary": primary, "text_secondary": secondary, "text_motion": mode,
    }
    if report["bytes"] >= 1024*1024 or not report["transparent"] or not report["all_frames_distinct"]:
        raise ValueError(report)
    return report


def make_main_and_tab(source_apng: Path, package: Path):
    image = Image.open(source_apng)
    frames = []
    for i in range(image.n_frames):
        image.seek(i)
        frame = image.convert("RGBA").resize((240, 203), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
        canvas.alpha_composite(frame, (0, 18))
        frames.append(canvas)
    frames[0].save(package / "main.png", save_all=True, append_images=frames[1:], duration=250,
                   loop=2, disposal=0, blend=0, optimize=True, compress_level=9)
    first = frames[0]
    bbox = first.getchannel("A").getbbox() or (0, 0, 240, 240)
    subject = first.crop(bbox)
    subject.thumbnail((92, 70), Image.Resampling.LANCZOS)
    tab = Image.new("RGBA", (96, 74), (0, 0, 0, 0))
    tab.alpha_composite(subject, ((96-subject.width)//2, (74-subject.height)//2))
    tab.save(package / "tab.png", optimize=True, compress_level=9)


def zip_folder(folder: Path, zip_path: Path):
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(folder.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(folder))


def contact_sheet(paths: list[Path], output: Path):
    thumb = (240, 203)
    sheet = Image.new("RGB", (960, 812), (235, 241, 247))
    for i, path in enumerate(paths):
        image = Image.open(path).convert("RGBA")
        matte = Image.new("RGBA", CANVAS, "white")
        matte.alpha_composite(image)
        sheet.paste(matte.convert("RGB").resize(thumb, Image.Resampling.LANCZOS), ((i%4)*240, (i//4)*203))
    sheet.save(output, quality=94)


def package_all(root: Path, first_root: Path, reports: list[dict]):
    delivery = root / "32張完整交付包"
    if delivery.exists():
        shutil.rmtree(delivery)
    delivery.mkdir()
    set_a = delivery / "LINE上架包_A_01至16"
    set_b = delivery / "LINE上架包_B_17至32"
    master = delivery / "全部32張作品總覽"
    for folder in (set_a, set_b, master):
        (folder / "stickers").mkdir(parents=True)
        (folder / "previews").mkdir(parents=True)

    # Set A uses the already-verified first 16 animated stickers.
    source_a = first_root / "LINE上架包"
    for i, phrase in enumerate(FIRST_PHRASES, 1):
        shutil.copy2(source_a / "stickers" / f"{i:02d}.png", set_a / "stickers" / f"{i:02d}.png")
        shutil.copy2(source_a / "previews" / f"{i:02d}_{phrase}.gif", set_a / "previews" / f"{i:02d}_{phrase}.gif")
        shutil.copy2(source_a / "stickers" / f"{i:02d}.png", master / "stickers" / f"{i:02d}.png")
    shutil.copy2(source_a / "main.png", set_a / "main.png")
    shutil.copy2(source_a / "tab.png", set_a / "tab.png")

    extended_apngs = [root / "17_了解" / "17_了解_文字動態_APNG.png"]
    extended_gifs = [root / "17_了解" / "17_了解_文字動態預覽.gif"]
    for number, phrase, *_ in EXTENDED:
        extended_apngs.append(root / f"{number:02d}_{phrase}" / f"{number:02d}_{phrase}_文字動態_APNG.png")
        extended_gifs.append(root / f"{number:02d}_{phrase}" / f"{number:02d}_{phrase}_預覽.gif")

    for local_index, (phrase, apng, gif) in enumerate(zip(SECOND_PHRASES, extended_apngs, extended_gifs), 1):
        shutil.copy2(apng, set_b / "stickers" / f"{local_index:02d}.png")
        shutil.copy2(gif, set_b / "previews" / f"{local_index:02d}_{phrase}.gif")
        shutil.copy2(apng, master / "stickers" / f"{local_index+16:02d}.png")
        shutil.copy2(gif, master / "previews" / f"{local_index+16:02d}_{phrase}.gif")
    make_main_and_tab(extended_apngs[0], set_b)
    shutil.copy2(set_a / "main.png", master / "main.png")
    shutil.copy2(set_a / "tab.png", master / "tab.png")

    set_a_map = "\n".join(f"{i:02d}.png = {p}" for i,p in enumerate(FIRST_PHRASES,1)) + "\n"
    set_b_map = "\n".join(f"{i:02d}.png = {p}" for i,p in enumerate(SECOND_PHRASES,1)) + "\n"
    all_map = set_a_map + "\n" + "\n".join(f"{i+16:02d}.png = {p}" for i,p in enumerate(SECOND_PHRASES,1)) + "\n"
    (set_a / "貼圖對照表.txt").write_text(set_a_map, encoding="utf-8")
    (set_b / "貼圖對照表.txt").write_text(set_b_map, encoding="utf-8")
    (master / "貼圖對照表.txt").write_text(all_map, encoding="utf-8")
    note = "LINE 動態貼圖官方每套只接受 8、16 或 24 張；本交付拆成兩套各 16 張，可直接分別建立商品送審。\n"
    (delivery / "上架說明.txt").write_text(note, encoding="utf-8")
    (set_a / "README.txt").write_text("水滴君動態貼圖 A：第 1～16 張。320x270 APNG。\n", encoding="utf-8")
    (set_b / "README.txt").write_text("水滴君動態貼圖 B：第 17～32 張，角色與文字皆有動畫。320x270 APNG。\n", encoding="utf-8")
    (delivery / "第18至32張驗證報告.json").write_text(json.dumps(reports, ensure_ascii=False, indent=2), encoding="utf-8")

    contact_sheet([set_b / "stickers" / f"{i:02d}.png" for i in range(1,17)], delivery / "第17至32張首格總覽.jpg")
    zip_folder(set_a, delivery / "LINE上架包_A_01至16.zip")
    zip_folder(set_b, delivery / "LINE上架包_B_17至32.zip")
    zip_folder(master, delivery / "全部32張作品總包_非單套上架.zip")
    zip_folder(delivery, root / "水滴君_32張動態貼圖_完整交付包.zip")
    return delivery


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    parser.add_argument("first_root", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    font_path = find_font()
    reports = [save_one(root, *item, font_path) for item in EXTENDED]
    delivery = package_all(root, args.first_root.resolve(), reports)
    print(json.dumps({"status":"PASS", "built":len(reports), "delivery":str(delivery),
                      "min_bytes":min(r["bytes"] for r in reports), "max_bytes":max(r["bytes"] for r in reports)},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
