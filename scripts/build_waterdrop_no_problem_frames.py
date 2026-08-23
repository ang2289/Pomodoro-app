from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(r"D:\Pomodoro-app")
OUT = ROOT / "output" / "waterdrop-animated-no-problem-8"
SOURCE = OUT / "sprite-sheet-source.png"
FRAMES = OUT / "frames"
FONT_PATH = Path(r"C:\Windows\Fonts\msjhbd.ttc")

FRAME_SIZE = (320, 270)
TEXT = "沒問題"


def remove_green_key(image: Image.Image) -> Image.Image:
    """Turn the generated green screen into a soft transparent matte."""
    arr = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    rgb = arr[..., :3].astype(np.int16)
    red, green, blue = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    green_strength = green - np.maximum(red, blue)

    alpha = np.full(green.shape, 255.0, dtype=np.float32)
    key_region = (green > 105) & (green_strength > 24)
    alpha[key_region] = np.clip(
        (100.0 - green_strength[key_region]) * (255.0 / 76.0), 0.0, 255.0
    )
    arr[..., 3] = alpha.astype(np.uint8)

    # Remove green spill only along the soft transition pixels.
    fringe = key_region & (arr[..., 3] > 0)
    neutral_green = np.maximum(red, blue) + 12
    arr[..., 1][fringe] = np.minimum(green[fringe], neutral_green[fringe]).astype(
        np.uint8
    )
    return Image.fromarray(arr, "RGBA")


def draw_fixed_title(canvas: Image.Image) -> None:
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(str(FONT_PATH), 58)
    box = draw.textbbox((0, 0), TEXT, font=font, stroke_width=0)
    width = box[2] - box[0]
    x = (FRAME_SIZE[0] - width) // 2
    y = -5

    # Outer white sticker border, then dark-blue inner outline and bright-blue fill.
    draw.text(
        (x, y),
        TEXT,
        font=font,
        fill=(43, 151, 255, 255),
        stroke_width=13,
        stroke_fill=(255, 255, 255, 255),
    )
    draw.text(
        (x, y),
        TEXT,
        font=font,
        fill=(62, 166, 255, 255),
        stroke_width=6,
        stroke_fill=(21, 91, 205, 255),
    )


def build_frames() -> list[Image.Image]:
    sheet = Image.open(SOURCE).convert("RGBA")
    width, height = sheet.size
    x_edges = [round(i * width / 4) for i in range(5)]
    y_edges = [round(i * height / 2) for i in range(3)]

    FRAMES.mkdir(parents=True, exist_ok=True)
    results: list[Image.Image] = []
    for index in range(8):
        row, col = divmod(index, 4)
        # Inset removes the thin white panel dividers created by the image model.
        left = x_edges[col] + 4
        top = y_edges[row] + 4
        right = x_edges[col + 1] - 4
        bottom = y_edges[row + 1] - 4
        panel = sheet.crop((left, top, right, bottom))
        panel = remove_green_key(panel)
        panel = panel.resize((250, 250), Image.Resampling.LANCZOS)

        frame = Image.new("RGBA", FRAME_SIZE, (0, 0, 0, 0))
        frame.alpha_composite(panel, (35, 18))
        draw_fixed_title(frame)
        frame.save(FRAMES / f"frame_{index + 1:02d}.png", optimize=True)
        results.append(frame)
    return results


def make_previews(frames: list[Image.Image]) -> None:
    # A white contact sheet makes text, scale, and frame-to-frame stability easy to inspect.
    sheet = Image.new("RGB", (FRAME_SIZE[0] * 4, FRAME_SIZE[1] * 2), "white")
    for index, frame in enumerate(frames):
        row, col = divmod(index, 4)
        white = Image.new("RGBA", FRAME_SIZE, "white")
        white.alpha_composite(frame)
        sheet.paste(white.convert("RGB"), (col * FRAME_SIZE[0], row * FRAME_SIZE[1]))
    sheet.save(OUT / "preview_contact_sheet.jpg", quality=92)

    # APNG preview only; the eight source PNG files remain the upload assets.
    durations = [140, 120, 120, 120, 180, 120, 140, 280]
    frames[0].save(
        OUT / "preview_animation.png",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        disposal=1,
        blend=0,
        optimize=True,
    )


def validate(frames: list[Image.Image]) -> None:
    if len(frames) != 8:
        raise RuntimeError(f"Expected 8 frames, got {len(frames)}")
    for index, frame in enumerate(frames, start=1):
        if frame.size != FRAME_SIZE or frame.mode != "RGBA":
            raise RuntimeError(f"Frame {index} has invalid format: {frame.mode} {frame.size}")
        alpha = frame.getchannel("A")
        if alpha.getextrema() != (0, 255):
            raise RuntimeError(f"Frame {index} does not contain real transparency")
        corners = [
            alpha.getpixel((0, 0)),
            alpha.getpixel((FRAME_SIZE[0] - 1, 0)),
            alpha.getpixel((0, FRAME_SIZE[1] - 1)),
            alpha.getpixel((FRAME_SIZE[0] - 1, FRAME_SIZE[1] - 1)),
        ]
        if corners != [0, 0, 0, 0]:
            raise RuntimeError(f"Frame {index} has non-transparent corners: {corners}")


if __name__ == "__main__":
    built = build_frames()
    validate(built)
    make_previews(built)
    print(f"Created {len(built)} transparent frames in {FRAMES}")
