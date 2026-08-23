from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT_ROOT = ROOT / "output" / "product-image-generator-promo-20260715"
URL = "pomodoro-app-eight-rouge.vercel.app/tools/product-image-generator"

FONT_REG = Path(r"C:\Windows\Fonts\NotoSansTC-VF.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\msjhbd.ttc")
FONT_BODY = Path(r"C:\Windows\Fonts\msjh.ttc")

INK = (20, 33, 30)
MUTED = (76, 91, 86)
GREEN = (6, 130, 92)
DEEP_GREEN = (3, 87, 65)
MINT = (226, 246, 236)
CREAM = (255, 251, 240)
AMBER = (217, 139, 38)
WHITE = (255, 255, 255)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD if bold and FONT_BOLD.exists() else FONT_REG
    if not path.exists():
        path = FONT_BODY
    return ImageFont.truetype(str(path), size=size)


def rounded(draw: ImageDraw.ImageDraw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def fit_cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(img.convert("RGB"), size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def fit_contain(img: Image.Image, size: tuple[int, int], bg=WHITE) -> Image.Image:
    canvas = Image.new("RGB", size, bg)
    im = img.convert("RGB")
    im.thumbnail(size, Image.Resampling.LANCZOS)
    canvas.paste(im, ((size[0] - im.width) // 2, (size[1] - im.height) // 2))
    return canvas


def add_overlay(base: Image.Image, opacity=110):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, opacity))
    return Image.alpha_composite(base.convert("RGBA"), overlay)


def draw_text_block(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font_obj: ImageFont.FreeTypeFont,
    fill=INK,
    max_width=900,
    line_spacing=10,
):
    x, y = xy
    lines: list[str] = []
    current = ""
    for ch in text:
        trial = current + ch
        if draw.textbbox((0, 0), trial, font=font_obj)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = ch
    if current:
        lines.append(current)
    for line in lines:
        draw.text((x, y), line, font=font_obj, fill=fill)
        y += font_obj.size + line_spacing
    return y


def draw_badge(draw, x, y, text, fill=GREEN, text_fill=WHITE, pad_x=26, pad_y=12):
    f = font(34, True)
    box = draw.textbbox((0, 0), text, font=f)
    w = box[2] - box[0] + pad_x * 2
    h = box[3] - box[1] + pad_y * 2
    rounded(draw, (x, y, x + w, y + h), 999, fill)
    draw.text((x + pad_x, y + pad_y - 2), text, font=f, fill=text_fill)
    return x + w, y + h


def draw_footer(draw, w, h, short=False):
    f = font(28 if not short else 24, True)
    text = URL if not short else "立即購買點數生成商品圖"
    rounded(draw, (50, h - 104, w - 50, h - 42), 28, (255, 255, 255, 232), outline=(202, 229, 219), width=2)
    draw.text((78, h - 90), text, font=f, fill=DEEP_GREEN)


def draw_simple_qr(draw, x, y, size=210):
    cell = size // 15
    rounded(draw, (x - 14, y - 14, x + size + 14, y + size + 14), 26, WHITE, outline=(206, 222, 217), width=2)
    pattern = [
        "111111100101111",
        "100000101001001",
        "101110101111101",
        "101110100001001",
        "101110111101111",
        "100000100101000",
        "111111101010101",
        "000000001011000",
        "111011111010111",
        "010001001110001",
        "101111101011101",
        "001000001000101",
        "111101111011111",
        "100001010100001",
        "111111101111111",
    ]
    for row, line in enumerate(pattern):
        for col, bit in enumerate(line):
            if bit == "1":
                draw.rectangle((x + col * cell, y + row * cell, x + (col + 1) * cell - 2, y + (row + 1) * cell - 2), fill=INK)


def platform_card(bg: Image.Image, size: tuple[int, int], campaign: str, out: Path):
    w, h = size
    card = fit_cover(bg, size).convert("RGBA")
    draw = ImageDraw.Draw(card, "RGBA")

    if campaign == "main":
        card = add_overlay(card, 70)
        draw = ImageDraw.Draw(card, "RGBA")
        panel_h = int(h * 0.42)
        rounded(draw, (42, h - panel_h - 38, w - 42, h - 38), 42, (255, 255, 255, 236))
        y = h - panel_h + 10
        draw_badge(draw, 78, y, "小店商品圖工具")
        y += 78
        draw_text_block(draw, (78, y), "手機隨拍商品照", font(58 if w <= 1080 else 62, True), max_width=w - 156)
        y += 68
        draw_text_block(draw, (78, y), "變成可發文 AI 商品圖", font(50 if w <= 1080 else 58, True), fill=DEEP_GREEN, max_width=w - 156)
        y += 86
        draw_text_block(draw, (78, y), "買點數生成，指定方案送店家商品頁。2026/7/15 前可免費精修一次。", font(30, False), fill=MUTED, max_width=w - 156)
        draw_footer(draw, w, h)

    elif campaign == "shop_page":
        gradient = Image.new("RGBA", size, (255, 251, 240, 0))
        gdraw = ImageDraw.Draw(gradient, "RGBA")
        gdraw.rectangle((0, 0, w, int(h * 0.52)), fill=(255, 251, 240, 228))
        card = Image.alpha_composite(card, gradient)
        draw = ImageDraw.Draw(card, "RGBA")
        y = 70 if h > w else 54
        draw_badge(draw, 58, y, "買點數加贈")
        y += 88
        draw_text_block(draw, (58, y), "送店家商品頁", font(70 if h > w else 58, True), fill=INK, max_width=w - 116)
        y += 94 if h > w else 76
        draw_text_block(draw, (58, y), "商品介紹、LINE、電話、下單連結一次放好", font(34 if h > w else 30, True), fill=DEEP_GREEN, max_width=w - 116)
        y += 62
        bullets = ["可下載 QR Code 分享給客人", "適合社團、LINE 群組、IG 個人檔案", "一邊生成商品圖，一邊準備銷售入口"]
        for b in bullets:
            draw.text((64, y), "•", font=font(32, True), fill=GREEN)
            y = draw_text_block(draw, (100, y), b, font(29, False), fill=MUTED, max_width=w - 150, line_spacing=8) + 4
        draw_footer(draw, w, h, short=h > w)

    elif campaign == "retouch":
        card = add_overlay(card, 45)
        draw = ImageDraw.Draw(card, "RGBA")
        panel_top = 68 if h > w else 44
        panel_bottom = int(h * (0.48 if h > w else 0.58))
        rounded(draw, (42, panel_top, w - 42, panel_bottom), 42, (255, 255, 255, 235))
        y = panel_top + 34
        draw_badge(draw, 78, y, "限時到 2026/7/15", fill=AMBER)
        y += 82
        draw_text_block(draw, (78, y), "生成後不滿意？", font(58 if h > w else 50, True), fill=INK, max_width=w - 156)
        y += 76
        draw_text_block(draw, (78, y), "可免費精修一次", font(62 if h > w else 56, True), fill=DEEP_GREEN, max_width=w - 156)
        y += 88
        draw_text_block(draw, (78, y), "調整方向以背景、光線、構圖、裁切與整體質感為主。", font(30, False), fill=MUTED, max_width=w - 156)
        draw_footer(draw, w, h, short=h > w)

    elif campaign == "bundle":
        card = add_overlay(card, 75)
        draw = ImageDraw.Draw(card, "RGBA")
        panel_bottom = int(h * 0.6) if h > w else h - 58
        rounded(draw, (46, 58, w - 46, panel_bottom), 48, (255, 255, 255, 232))
        y = 92
        draw_badge(draw, 82, y, "社團限定推廣")
        y += 88
        draw_text_block(draw, (82, y), "買點數做商品圖", font(60 if h > w else 54, True), fill=INK, max_width=w - 164)
        y += 82
        draw_text_block(draw, (82, y), "送商品頁＋精修一次", font(56 if h > w else 48, True), fill=DEEP_GREEN, max_width=w - 164)
        y += 86
        draw_text_block(draw, (82, y), "手機隨拍照先做宣傳圖。適合新品、預購、菜單、社團與 LINE 推廣。", font(30, False), fill=MUTED, max_width=w - 164)
        y += 96
        qr_y = min(panel_bottom - 270, y)
        draw_simple_qr(draw, w - 300, qr_y, 210)
        draw_text_block(draw, (82, qr_y + 16), "2026/7/15 前\n購買點數並生成\n可申請免費精修一次", font(31, True), fill=AMBER, max_width=w - 430)
        draw_footer(draw, w, h)

    out.parent.mkdir(parents=True, exist_ok=True)
    card.convert("RGB").save(out, quality=94)


def make_video_slide(bg: Image.Image, title: str, subtitle: str, body: list[str], out: Path, badge: str = "RxV AI 商品圖"):
    w, h = 1080, 1920
    card = fit_cover(bg, (w, h)).convert("RGBA")
    card = add_overlay(card, 58)
    draw = ImageDraw.Draw(card, "RGBA")
    rounded(draw, (54, 84, w - 54, h - 96), 48, (255, 255, 255, 224))
    y = 132
    draw_badge(draw, 92, y, badge)
    y += 96
    y = draw_text_block(draw, (92, y), title, font(74, True), fill=INK, max_width=w - 184, line_spacing=18)
    y += 20
    y = draw_text_block(draw, (92, y), subtitle, font(42, True), fill=DEEP_GREEN, max_width=w - 184, line_spacing=12)
    y += 46
    for item in body:
        rounded(draw, (92, y, w - 92, y + 112), 30, (236, 248, 241, 245), outline=(194, 229, 216), width=2)
        draw_text_block(draw, (126, y + 25), item, font(34, True), fill=INK, max_width=w - 252, line_spacing=8)
        y += 136
    draw_footer(draw, w, h, short=True)
    out.parent.mkdir(parents=True, exist_ok=True)
    card.convert("RGB").save(out, quality=94)


def make_assets(srcs: dict[str, Path], ffmpeg: str | None):
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    src_out = OUT_ROOT / "source-backgrounds"
    src_out.mkdir(exist_ok=True)
    for name, path in srcs.items():
        shutil.copy2(path, src_out / f"{name}{path.suffix.lower()}")

    images = {k: Image.open(v) for k, v in srcs.items()}
    sizes = {
        "fb-group-square-1080": (1080, 1080),
        "ig-feed-1080x1350": (1080, 1350),
        "story-reels-1080x1920": (1080, 1920),
        "fb-link-1200x628": (1200, 628),
    }
    campaigns = {
        "main": images["before_after"],
        "shop_page": images["shop_page"],
        "retouch": images["retouch"],
        "bundle": images["shop_page"],
    }
    for campaign, bg in campaigns.items():
        for size_name, size in sizes.items():
            platform_card(bg, size, campaign, OUT_ROOT / "ads" / campaign / f"{campaign}-{size_name}.jpg")

    slides_dir = OUT_ROOT / "video-slides"
    video_sets = {
        "01-shop-page-gift-15s": [
            (images["before_after"], "手機隨拍商品照", "先變成可發文商品圖", ["適合新品、預購、菜單更新", "社團、LINE、IG 都能用"], "小店商品圖工具"),
            (images["shop_page"], "買點數生成", "指定方案送店家商品頁", ["商品介紹、LINE、電話、下單連結", "QR Code 分享給客人"], "買點數加贈"),
            (images["shop_page"], "一張圖＋一個頁面", "讓客人更快看懂與聯絡", ["現在就用點數開始做商品圖"], "立即使用"),
        ],
        "02-free-retouch-20s": [
            (images["retouch"], "怕 AI 圖不合意？", "2026/7/15 前有加值服務", ["購買點數並生成圖片", "風格有落差可申請精修一次"], "限時加值"),
            (images["retouch"], "免費精修一次", "重點整理商品圖質感", ["背景、光線、構圖、裁切", "整體質感與畫面乾淨度"], "人工協助"),
            (images["before_after"], "先低成本做出圖", "再把素材拿去發文測市場", ["適合小店每日宣傳", "新品上市不用等排程"], "小店適用"),
            (images["retouch"], "買點數做商品圖", "送商品頁＋可精修一次", ["2026/7/15 前限時主打"], "立即使用"),
        ],
        "03-community-bundle-30s": [
            (images["before_after"], "商品不差", "只是照片還不夠吸引人", ["手機隨拍也能先整理成商品圖"], "痛點"),
            (images["before_after"], "AI 商品圖生成", "做社群、商品頁、外送主圖", ["甜點、飲料、餐飲、手作、蝦皮都適合"], "用途"),
            (images["shop_page"], "指定點數包", "加贈店家商品展示頁", ["商品介紹、LINE、電話、下單連結", "附 QR Code 分享"], "加贈"),
            (images["retouch"], "2026/7/15 前", "可申請免費精修一次", ["讓圖片更貼近你想要的風格"], "精修"),
            (images["shop_page"], "買點數開始", "圖片與銷售入口一起準備", ["RxV AI 商品圖生成器"], "CTA"),
        ],
    }
    durations = {"01-shop-page-gift-15s": 5, "02-free-retouch-20s": 5, "03-community-bundle-30s": 6}
    for video_name, slides in video_sets.items():
        sub = slides_dir / video_name
        frame_paths = []
        for idx, (bg, title, subtitle, body, badge) in enumerate(slides, 1):
            slide_path = sub / f"{idx:02d}.jpg"
            make_video_slide(bg, title, subtitle, body, slide_path, badge=badge)
            frame_paths.append(slide_path)
        concat = sub / "concat.txt"
        with concat.open("w", encoding="utf-8") as f:
            for path in frame_paths:
                f.write(f"file '{path.as_posix()}'\n")
                f.write(f"duration {durations[video_name]}\n")
            f.write(f"file '{frame_paths[-1].as_posix()}'\n")
        if ffmpeg:
            out_mp4 = OUT_ROOT / "videos" / f"{video_name}.mp4"
            out_mp4.parent.mkdir(parents=True, exist_ok=True)
            cmd = [ffmpeg, "-y"]
            for path in frame_paths:
                cmd += ["-loop", "1", "-t", str(durations[video_name]), "-i", str(path)]
            filters = []
            labels = []
            for idx in range(len(frame_paths)):
                filters.append(f"[{idx}:v]scale=1080:1920,fps=30,format=yuv420p[v{idx}]")
                labels.append(f"[v{idx}]")
            filters.append(f"{''.join(labels)}concat=n={len(frame_paths)}:v=1:a=0,format=yuv420p[v]")
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


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--before-after", required=True)
    parser.add_argument("--shop-page", required=True)
    parser.add_argument("--retouch", required=True)
    parser.add_argument("--ffmpeg")
    args = parser.parse_args()
    make_assets(
        {
            "before_after": Path(args.before_after),
            "shop_page": Path(args.shop_page),
            "retouch": Path(args.retouch),
        },
        args.ffmpeg,
    )
    print(OUT_ROOT)


if __name__ == "__main__":
    main()
