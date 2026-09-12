from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "public" / "group-buy" / "yannick"
OUTPUT_DIR = ROOT / "output" / "yannick-promo"
QR_PATH = OUTPUT_DIR / "group-buy-qr.png"

WIDTH, HEIGHT = 1080, 1920
CREAM = "#FFF8EC"
ORANGE = "#C85012"
DARK_ORANGE = "#7C2D12"
INK = "#2F2118"
MUTED = "#705E50"
WHITE = "#FFFFFF"
FONT_REGULAR = "C:/Windows/Fonts/msjh.ttc"
FONT_BOLD = "C:/Windows/Fonts/msjhbd.ttc"

PRODUCTS = [
    ("original.jpg", "原味"),
    ("dark-chocolate.jpg", "特黑巧克力"),
    ("tea-latte-pudding.jpg", "茶拿鐵布丁"),
    ("hokkaido-black-cookie.jpg", "北海道黑酷曲"),
    ("uji-matcha.jpg", "宇治抹茶"),
    ("vanilla-pudding.jpg", "香草布丁"),
    ("three-pudding.jpg", "三顆布丁"),
    ("mint-chocolate-crunch.jpg", "薄荷巧克力脆片"),
    ("mint-black-cookie.jpg", "薄荷黑酷曲"),
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def gradient_background() -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), CREAM)
    pixels = image.load()
    start = (255, 248, 236)
    end = (255, 229, 205)
    for y in range(HEIGHT):
        ratio = y / (HEIGHT - 1)
        color = tuple(round(a + (b - a) * ratio) for a, b in zip(start, end))
        for x in range(WIDTH):
            pixels[x, y] = color
    return image


def centered_text(draw: ImageDraw.ImageDraw, text: str, y: int, size: int, color: str = INK, bold: bool = False) -> int:
    selected_font = font(size, bold)
    box = draw.multiline_textbbox((0, 0), text, font=selected_font, spacing=16, align="center")
    text_width = box[2] - box[0]
    draw.multiline_text(((WIDTH - text_width) / 2, y), text, font=selected_font, fill=color, spacing=16, align="center")
    return box[3] - box[1]


def rounded_photo(canvas: Image.Image, source: Path, box: tuple[int, int, int, int], radius: int = 42) -> None:
    left, top, right, bottom = box
    size = (right - left, bottom - top)
    photo = Image.open(source).convert("RGB")
    photo = ImageOps.fit(photo, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *size), radius=radius, fill=255)
    canvas.paste(photo, (left, top), mask)


def pill(draw: ImageDraw.ImageDraw, text: str, y: int) -> None:
    selected_font = font(38, True)
    box = draw.textbbox((0, 0), text, font=selected_font)
    width = box[2] - box[0] + 70
    left = (WIDTH - width) // 2
    draw.rounded_rectangle((left, y, left + width, y + 76), radius=38, fill="#FFE1C2")
    draw.text((WIDTH / 2, y + 38), text, font=selected_font, fill=DARK_ORANGE, anchor="mm")


def footer(draw: ImageDraw.ImageDraw, text: str = "本站自辦團購｜非亞尼克官方網站") -> None:
    draw.text((WIDTH / 2, 1845), text, font=font(28), fill=MUTED, anchor="mm")


def slide_one() -> Image.Image:
    image = gradient_background()
    draw = ImageDraw.Draw(image)
    pill(draw, "第一團開放登記", 110)
    centered_text(draw, "亞尼克生乳捲\n第一團", 245, 82, DARK_ORANGE, True)
    rounded_photo(image, ASSET_DIR / "original.jpg", (90, 520, 990, 1240), 54)
    centered_text(draw, "9款團購品項可選", 1340, 58, INK, True)
    centered_text(draw, "官網定價 76 折", 1430, 72, ORANGE, True)
    centered_text(draw, "先登記數量・成團後再付款", 1560, 42, MUTED, True)
    footer(draw)
    return image


def slide_two() -> Image.Image:
    image = gradient_background()
    draw = ImageDraw.Draw(image)
    centered_text(draw, "9款人氣品項任你選", 105, 64, DARK_ORANGE, True)
    centered_text(draw, "每一款都能直接在網站登記", 205, 36, MUTED)
    tile_w, tile_h = 280, 405
    start_x, start_y = 80, 310
    gap_x, gap_y = 40, 35
    for index, (filename, label) in enumerate(PRODUCTS):
        row, col = divmod(index, 3)
        x = start_x + col * (tile_w + gap_x)
        y = start_y + row * (tile_h + gap_y)
        draw.rounded_rectangle((x, y, x + tile_w, y + tile_h), radius=30, fill=WHITE, outline="#F1C9A6", width=3)
        rounded_photo(image, ASSET_DIR / filename, (x + 12, y + 12, x + tile_w - 12, y + 300), 22)
        label_font = font(25 if len(label) < 8 else 21, True)
        draw.text((x + tile_w / 2, y + 350), label, font=label_font, fill=INK, anchor="mm")
    footer(draw)
    return image


def slide_three() -> Image.Image:
    image = gradient_background()
    draw = ImageDraw.Draw(image)
    pill(draw, "第一團團購價", 110)
    rounded_photo(image, ASSET_DIR / "original.jpg", (100, 260, 980, 930), 54)
    centered_text(draw, "原味生乳捲", 1030, 58, INK, True)
    centered_text(draw, "官網定價 392 元", 1140, 38, MUTED)
    centered_text(draw, "本團 298 元", 1225, 92, ORANGE, True)
    draw.rounded_rectangle((100, 1410, 980, 1640), radius=42, fill=WHITE, outline="#F1C9A6", width=4)
    centered_text(draw, "一條也能先登記團購價\n不用自己一次買到7條", 1460, 45, DARK_ORANGE, True)
    footer(draw)
    return image


def slide_four() -> Image.Image:
    image = gradient_background()
    draw = ImageDraw.Draw(image)
    centered_text(draw, "簡單4步驟", 125, 72, DARK_ORANGE, True)
    steps = [
        ("1", "網站先登記", "選商品與數量"),
        ("2", "達到成團數量", "系統顯示已達標"),
        ("3", "通知完成付款", "不用提前匯款"),
        ("4", "統一訂貨出貨", "訂單頁可查進度"),
    ]
    y = 330
    for number, title, detail in steps:
        draw.rounded_rectangle((100, y, 980, y + 265), radius=42, fill=WHITE, outline="#F0C49A", width=4)
        draw.ellipse((145, y + 63, 285, y + 203), fill=ORANGE)
        draw.text((215, y + 133), number, font=font(64, True), fill=WHITE, anchor="mm")
        draw.text((340, y + 82), title, font=font(48, True), fill=INK)
        draw.text((340, y + 155), detail, font=font(34), fill=MUTED)
        y += 325
    footer(draw)
    return image


def slide_five() -> Image.Image:
    image = gradient_background()
    draw = ImageDraw.Draw(image)
    centered_text(draw, "全台冷凍宅配", 135, 72, DARK_ORANGE, True)
    rounded_photo(image, ASSET_DIR / "tea-latte-pudding.jpg", (110, 300, 970, 950), 54)
    draw.rounded_rectangle((100, 1050, 980, 1535), radius=50, fill=WHITE, outline="#F0C49A", width=4)
    centered_text(draw, "同一張訂單滿10條", 1120, 52, INK, True)
    centered_text(draw, "免運", 1220, 110, ORANGE, True)
    centered_text(draw, "未滿10條｜冷凍運費200元", 1400, 40, MUTED, True)
    centered_text(draw, "適合親友・同事一起揪團", 1635, 42, DARK_ORANGE, True)
    footer(draw)
    return image


def slide_six() -> Image.Image:
    image = gradient_background()
    draw = ImageDraw.Draw(image)
    pill(draw, "現在先登記・目前不用付款", 110)
    centered_text(draw, "查看9款品項與價格", 245, 68, DARK_ORANGE, True)
    if QR_PATH.exists():
        qr = Image.open(QR_PATH).convert("RGB")
        qr = ImageOps.contain(qr, (650, 650), method=Image.Resampling.NEAREST)
        qr_box = Image.new("RGB", (730, 730), WHITE)
        qr_box.paste(qr, ((730 - qr.width) // 2, (730 - qr.height) // 2))
        mask = Image.new("L", qr_box.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, 730, 730), radius=48, fill=255)
        image.paste(qr_box, (175, 430), mask)
    centered_text(draw, "掃描 QR Code 進入團購頁", 1245, 42, INK, True)
    centered_text(draw, "pomodoro-app-eight-rouge.vercel.app\n/group-buy/yannick-first-group-buy", 1340, 31, MUTED)
    draw.rounded_rectangle((130, 1535, 950, 1690), radius=38, fill=ORANGE)
    draw.text((WIDTH / 2, 1612), "立即前往網站登記", font=font(48, True), fill=WHITE, anchor="mm")
    footer(draw, "本站自辦團購，非亞尼克官方網站。")
    return image


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    slides = [slide_one(), slide_two(), slide_three(), slide_four(), slide_five(), slide_six()]
    for index, slide in enumerate(slides, start=1):
        slide.save(OUTPUT_DIR / f"slide-{index}.png", quality=95)
    print(f"Created {len(slides)} slides in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
