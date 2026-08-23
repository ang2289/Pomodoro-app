from __future__ import annotations

import argparse
import math
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT_ROOT = ROOT / "output" / "business-card-promo-20260713"
TEMPLATE_DIR = ROOT / "src" / "assets" / "business-card-order-templates"
URL = "pomodoro-app-eight-rouge.vercel.app/tools/business-card-order"

FONT_BOLD = Path(r"C:\Windows\Fonts\msjhbd.ttc")
FONT_REG = Path(r"C:\Windows\Fonts\msjh.ttc")
FONT_ALT = Path(r"C:\Windows\Fonts\NotoSansTC-VF.ttf")

W, H = 1080, 1920
INK = (20, 28, 42)
MUTED = (83, 98, 121)
BLUE = (37, 99, 235)
CYAN = (8, 145, 178)
GREEN = (5, 150, 105)
AMBER = (217, 119, 6)
VIOLET = (124, 58, 237)
WHITE = (255, 255, 255)
BG = (248, 250, 252)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD if bold and FONT_BOLD.exists() else FONT_REG
    if not path.exists():
        path = FONT_ALT
    return ImageFont.truetype(str(path), size=size)


def text_wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for ch in text:
        trial = current + ch
        box = draw.textbbox((0, 0), trial, font=fnt)
        if box[2] - box[0] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = ch
    if current:
        lines.append(current)
    return lines


def draw_text_block(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill=INK,
    max_width=900,
    line_gap=12,
) -> int:
    x, y = xy
    for line in text_wrap(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + line_gap
    return y


def rounded(draw: ImageDraw.ImageDraw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def make_gradient(top=(239, 246, 255), bottom=(255, 255, 255)) -> Image.Image:
    img = Image.new("RGB", (W, H), top)
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        color = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(W):
            px[x, y] = color
    return img


def add_noise_overlay(img: Image.Image, opacity=12) -> Image.Image:
    noise = Image.effect_noise((W, H), 18).convert("L")
    overlay = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    overlay.putalpha(noise.point(lambda p: min(opacity, max(0, int(p / 255 * opacity)))))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def load_template(name: str) -> Image.Image:
    path = TEMPLATE_DIR / name
    img = Image.open(path).convert("RGBA")
    return img


def paste_card(canvas: Image.Image, card: Image.Image, center: tuple[int, int], width: int, angle: float = 0):
    ratio = card.height / card.width
    resized = card.resize((width, int(width * ratio)), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", (resized.width + 70, resized.height + 70), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    rounded(sdraw, (35, 35, 35 + resized.width, 35 + resized.height), 30, (15, 23, 42, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    holder = Image.new("RGBA", shadow.size, (0, 0, 0, 0))
    holder.alpha_composite(shadow)
    bg = Image.new("RGBA", resized.size, WHITE)
    bg.alpha_composite(resized)
    holder.alpha_composite(bg, (35, 35))
    rotated = holder.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    x = int(center[0] - rotated.width / 2)
    y = int(center[1] - rotated.height / 2)
    canvas.alpha_composite(rotated, (x, y))


def draw_badge(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, fill=BLUE):
    fnt = font(32, True)
    box = draw.textbbox((0, 0), text, font=fnt)
    w = box[2] - box[0] + 42
    h = box[3] - box[1] + 24
    rounded(draw, (x, y, x + w, y + h), 999, fill)
    draw.text((x + 21, y + 10), text, font=fnt, fill=WHITE)
    return y + h


def draw_footer(draw: ImageDraw.ImageDraw):
    rounded(draw, (60, H - 160, W - 60, H - 72), 32, WHITE, outline=(199, 210, 254), width=2)
    draw.text((92, H - 130), "搜尋：RxV 名片工具｜連結放留言", font=font(34, True), fill=(55, 48, 163))


def draw_qr(draw: ImageDraw.ImageDraw, x: int, y: int, size=250):
    cell = size // 17
    pattern = [
        "11111110010111111",
        "10000010100100001",
        "10111010111110101",
        "10111010000110101",
        "10111011110110101",
        "10000010010100001",
        "11111110101011111",
        "00000000101100000",
        "11101111101011101",
        "01000100111000100",
        "10111110101110111",
        "00100000100010100",
        "11110111101111101",
        "10000101010000101",
        "10110110111110101",
        "10000010100000101",
        "11111110111111111",
    ]
    rounded(draw, (x - 22, y - 22, x + size + 22, y + size + 22), 36, WHITE, outline=(203, 213, 225), width=2)
    for row, line in enumerate(pattern):
        for col, bit in enumerate(line):
            if bit == "1":
                draw.rectangle(
                    (x + col * cell, y + row * cell, x + (col + 1) * cell - 3, y + (row + 1) * cell - 3),
                    fill=INK,
                )


def base_slide(top=(239, 246, 255), bottom=(255, 255, 255)) -> Image.Image:
    return add_noise_overlay(make_gradient(top, bottom)).convert("RGBA")


def slide_01(cards: list[Image.Image]) -> Image.Image:
    canvas = base_slide((240, 253, 250), (255, 255, 255))
    draw = ImageDraw.Draw(canvas, "RGBA")
    paste_card(canvas, cards[0], (285, 1060), 650, -8)
    paste_card(canvas, cards[1], (690, 1240), 650, 8)
    rounded(draw, (54, 88, W - 54, 695), 46, (255, 255, 255, 232), outline=(209, 250, 229), width=2)
    draw_badge(draw, 92, 132, "新開店／接案／業務拜訪", GREEN)
    draw_text_block(draw, (92, 230), "名片還沒準備好？", font(82, True), max_width=880, line_gap=20)
    draw_text_block(draw, (92, 350), "別再自己排版排到崩潰，選版型、填資料，名片排版＋印刷一次處理。", font(40, True), fill=MUTED, max_width=870)
    draw_footer(draw)
    return canvas.convert("RGB")


def slide_02(cards: list[Image.Image]) -> Image.Image:
    canvas = base_slide((239, 246, 255), (255, 255, 255))
    draw = ImageDraw.Draw(canvas, "RGBA")
    paste_card(canvas, cards[2], (540, 740), 780, 0)
    rounded(draw, (60, 1110, W - 60, 1640), 44, WHITE, outline=(191, 219, 254), width=2)
    draw_badge(draw, 96, 1154, "Step 1", BLUE)
    draw_text_block(draw, (96, 1248), "先選喜歡的名片版型", font(64, True), max_width=850)
    draw_text_block(draw, (96, 1354), "品牌、姓名、電話、LINE、服務項目都可以直接填。", font(38, True), fill=MUTED, max_width=850)
    for idx, label in enumerate(["選版型", "填資料", "上傳 Logo"]):
        rounded(draw, (96 + idx * 292, 1514, 338 + idx * 292, 1588), 24, (239, 246, 255), outline=(191, 219, 254), width=2)
        draw.text((132 + idx * 292, 1531), label, font=font(28, True), fill=BLUE)
    draw_footer(draw)
    return canvas.convert("RGB")


def slide_03(cards: list[Image.Image]) -> Image.Image:
    canvas = base_slide((250, 245, 255), (255, 255, 255))
    draw = ImageDraw.Draw(canvas, "RGBA")
    paste_card(canvas, cards[3], (350, 1150), 560, -5)
    draw_qr(draw, 670, 875, 250)
    rounded(draw, (60, 92, W - 60, 620), 44, (255, 255, 255, 236), outline=(221, 214, 254), width=2)
    draw_badge(draw, 96, 136, "Step 2", VIOLET)
    draw_text_block(draw, (96, 232), "名片加 QR Code", font(72, True), max_width=850)
    draw_text_block(draw, (96, 344), "客人掃一下，就能看到你的線上介紹、作品、服務和聯絡方式。", font(39, True), fill=MUTED, max_width=850)
    rounded(draw, (605, 1195, 998, 1458), 38, (255, 255, 255, 225), outline=(221, 214, 254), width=2)
    draw.text((644, 1244), "紙本名片", font=font(38, True), fill=INK)
    draw.text((644, 1300), "連到線上入口", font=font(38, True), fill=VIOLET)
    draw.text((644, 1370), "適合放 LINE／作品集／官網", font=font(25, True), fill=MUTED)
    draw_footer(draw)
    return canvas.convert("RGB")


def slide_04(cards: list[Image.Image]) -> Image.Image:
    canvas = base_slide((255, 251, 235), (255, 255, 255))
    draw = ImageDraw.Draw(canvas, "RGBA")
    for i, card in enumerate(cards[4:9]):
        x = 190 + (i % 2) * 410
        y = 710 + (i // 2) * 260
        paste_card(canvas, card, (x + 170, y), 360, -7 if i % 2 == 0 else 7)
    rounded(draw, (54, 86, W - 54, 570), 44, (255, 255, 255, 235), outline=(253, 230, 138), width=2)
    draw_badge(draw, 92, 130, "Step 3", AMBER)
    draw_text_block(draw, (92, 224), "人工排版＋印刷", font(76, True), max_width=850)
    draw_text_block(draw, (92, 342), "單面／雙面、亮膜／霧膜、200 張起，適合小店、業務、接案者。", font(38, True), fill=MUTED, max_width=850)
    draw_footer(draw)
    return canvas.convert("RGB")


def slide_05(cards: list[Image.Image]) -> Image.Image:
    canvas = base_slide((238, 242, 255), (255, 255, 255))
    draw = ImageDraw.Draw(canvas, "RGBA")
    paste_card(canvas, cards[9], (540, 700), 820, 0)
    rounded(draw, (54, 1050, W - 54, 1675), 48, (255, 255, 255, 240), outline=(199, 210, 254), width=2)
    draw_badge(draw, 92, 1100, "立即線上下單", VIOLET)
    draw_text_block(draw, (92, 1200), "讓客戶拿到名片，也記得住你", font(62, True), max_width=850)
    draw_text_block(draw, (92, 1320), "RxV 名片工具：選版型、填資料、加 QR Code，排版印刷一次處理。", font(38, True), fill=MUTED, max_width=850)
    rounded(draw, (92, 1510, W - 92, 1598), 28, VIOLET)
    draw.text((154, 1532), "搜尋：RxV 名片工具", font=font(38, True), fill=WHITE)
    draw_footer(draw)
    return canvas.convert("RGB")


def create_video(ffmpeg: str | None):
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    slides_dir = OUT_ROOT / "slides"
    slides_dir.mkdir(parents=True, exist_ok=True)
    template_names = [
        "template-07-rxv-blue-corporate.png",
        "template-10-floral-pink.png",
        "template-06-rxv-black-gold.png",
        "template-15-blue-enterprise.png",
        "template-17-brown-coffee.png",
        "template-23-kids-green.png",
        "template-39-fitness-red-black.png",
        "template-43-clinic-clean-blue.png",
        "template-52-black-gold-premium.png",
        "template-85-fruit-tea-drink.webp",
    ]
    cards = [load_template(name) for name in template_names]
    for name in template_names:
        shutil.copy2(TEMPLATE_DIR / name, OUT_ROOT / "source-templates" / name) if (OUT_ROOT / "source-templates").exists() else None
    (OUT_ROOT / "source-templates").mkdir(exist_ok=True)
    for name in template_names:
        shutil.copy2(TEMPLATE_DIR / name, OUT_ROOT / "source-templates" / name)

    slide_images = [slide_01(cards), slide_02(cards), slide_03(cards), slide_04(cards), slide_05(cards)]
    slide_paths: list[Path] = []
    for idx, img in enumerate(slide_images, 1):
        path = slides_dir / f"{idx:02d}.jpg"
        img.save(path, quality=94)
        slide_paths.append(path)

    cover = OUT_ROOT / "business-card-promo-cover.jpg"
    slide_images[0].save(cover, quality=94)

    concat = slides_dir / "concat.txt"
    with concat.open("w", encoding="utf-8") as f:
        for path in slide_paths:
            f.write(f"file '{path.as_posix()}'\n")
            f.write("duration 3\n")
        f.write(f"file '{slide_paths[-1].as_posix()}'\n")

    if ffmpeg:
        out_mp4 = OUT_ROOT / "business-card-promo-15s.mp4"
        cmd = [ffmpeg, "-y"]
        for path in slide_paths:
            cmd += ["-loop", "1", "-t", "3", "-i", str(path)]
        filters = []
        labels = []
        for idx in range(len(slide_paths)):
            filters.append(f"[{idx}:v]scale=1080:1920,fps=30,format=yuv420p[v{idx}]")
            labels.append(f"[v{idx}]")
        filters.append(f"{''.join(labels)}concat=n={len(slide_paths)}:v=1:a=0,format=yuv420p[v]")
        cmd += [
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[v]",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(out_mp4),
        ]
        subprocess.run(cmd, check=True)

    print(OUT_ROOT)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()
    create_video(args.ffmpeg)


if __name__ == "__main__":
    main()
