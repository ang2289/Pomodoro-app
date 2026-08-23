from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(r"D:\Pomodoro-app\output\waterdrop-community-manager-32")
SOURCE = ROOT / "stickers" / "01-v2.png"
OUT = ROOT / "animated-sample-01"
FRAME_COUNT = 8
FRAME_MS = 250


def components(alpha: np.ndarray) -> list[dict]:
    active = alpha > 8
    seen = np.zeros(active.shape, dtype=bool)
    height, width = active.shape
    found: list[dict] = []
    for y in range(height):
        for x in range(width):
            if not active[y, x] or seen[y, x]:
                continue
            queue = deque([(x, y)])
            seen[y, x] = True
            points: list[tuple[int, int]] = []
            while queue:
                px, py = queue.popleft()
                points.append((px, py))
                for ny in range(max(0, py - 1), min(height, py + 2)):
                    for nx in range(max(0, px - 1), min(width, px + 2)):
                        if active[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True
                            queue.append((nx, ny))
            xs = [point[0] for point in points]
            ys = [point[1] for point in points]
            found.append(
                {
                    "points": points,
                    "area": len(points),
                    "bbox": (min(xs), min(ys), max(xs) + 1, max(ys) + 1),
                }
            )
    return found


def layer_for(image: Image.Image, selected: list[dict]) -> Image.Image:
    rgba = np.asarray(image).copy()
    mask = np.zeros((image.height, image.width), dtype=np.uint8)
    for component in selected:
        for x, y in component["points"]:
            mask[y, x] = 255
    rgba[..., 3] = np.minimum(rgba[..., 3], mask)
    rgba[rgba[..., 3] == 0, :3] = 0
    return Image.fromarray(rgba, "RGBA")


def transform_layer(
    layer: Image.Image,
    scale_x: float = 1.0,
    scale_y: float = 1.0,
    angle: float = 0.0,
    dx: int = 0,
    dy: int = 0,
) -> Image.Image:
    box = layer.getchannel("A").getbbox()
    if not box:
        return Image.new("RGBA", layer.size, (0, 0, 0, 0))
    crop = layer.crop(box)
    crop = crop.resize(
        (max(1, round(crop.width * scale_x)), max(1, round(crop.height * scale_y))),
        Image.Resampling.LANCZOS,
    )
    if angle:
        crop = crop.rotate(angle, Image.Resampling.BICUBIC, expand=True)
    canvas = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    center_x = (box[0] + box[2]) // 2
    center_y = (box[1] + box[3]) // 2
    canvas.alpha_composite(crop, (center_x - crop.width // 2 + dx, center_y - crop.height // 2 + dy))
    return canvas


def make_frame(
    text_layer: Image.Image,
    character_layer: Image.Image,
    accent_layer: Image.Image,
    index: int,
) -> Image.Image:
    text_scales = [1.00, 0.94, 1.055, 1.01, 1.00, 1.025, 0.985, 1.00]
    text_y = [0, 4, -3, -1, 0, -1, 1, 0]
    body_angles = [0.0, -1.5, 1.3, 0.0, 0.0, 1.0, -0.7, 0.0]
    body_sy = [1.00, 0.985, 1.015, 1.00, 1.00, 0.99, 1.01, 1.00]
    body_y = [0, 2, -2, 0, 0, 1, -1, 0]
    accent_alpha = [150, 205, 255, 175, 255, 210, 140, 150]

    frame = Image.new("RGBA", (370, 320), (0, 0, 0, 0))
    frame.alpha_composite(
        transform_layer(
            text_layer,
            scale_x=text_scales[index],
            scale_y=text_scales[index],
            dy=text_y[index],
        )
    )
    frame.alpha_composite(
        transform_layer(
            character_layer,
            scale_y=body_sy[index],
            angle=body_angles[index],
            dy=body_y[index],
        )
    )
    accent = accent_layer.copy()
    accent.putalpha(Image.eval(accent.getchannel("A"), lambda value: value * accent_alpha[index] // 255))
    frame.alpha_composite(accent)

    draw = ImageDraw.Draw(frame)
    if index in (2, 3):
        draw.arc((63, 116, 103, 158), 205, 305, fill=(255, 153, 0, 255), width=5)
        draw.arc((55, 108, 107, 164), 210, 300, fill=(255, 201, 28, 220), width=3)
    if index in (5, 6):
        draw.arc((303, 179, 357, 239), 245, 75, fill=(43, 111, 232, 255), width=5)
        draw.arc((313, 185, 367, 245), 245, 75, fill=(98, 178, 255, 220), width=3)
    return frame


def fit_line(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    box = image.getchannel("A").getbbox()
    if not box:
        return Image.new("RGBA", size, (0, 0, 0, 0))
    crop = image.crop(box)
    scale = min((size[0] - 8) / crop.width, (size[1] - 8) / crop.height)
    crop = crop.resize(
        (max(1, round(crop.width * scale)), max(1, round(crop.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(crop, ((size[0] - crop.width) // 2, (size[1] - crop.height) // 2))
    return canvas


def main() -> None:
    frames_dir = OUT / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    image = Image.open(SOURCE).convert("RGBA")
    found = [component for component in components(np.asarray(image.getchannel("A"))) if component["area"] >= 6]
    main_component = max(found, key=lambda item: item["area"])
    text_components = [
        component
        for component in found
        if component is not main_component and component["bbox"][1] < 125 and component["area"] > 80
    ]
    accent_components = [
        component for component in found if component is not main_component and component not in text_components
    ]
    # The generated sticker may connect text into one component and the character into another.
    # If the largest component is the text, swap by selecting the component extending farthest downward.
    character_component = max(found, key=lambda item: (item["bbox"][3], item["area"]))
    if character_component is not main_component:
        text_components = [
            component
            for component in found
            if component is not character_component and component["bbox"][1] < 125 and component["area"] > 80
        ]
        accent_components = [
            component
            for component in found
            if component is not character_component and component not in text_components
        ]
        main_component = character_component

    text_layer = layer_for(image, text_components)
    character_layer = layer_for(image, [main_component])
    accent_layer = layer_for(image, accent_components)
    source_frames = [
        make_frame(text_layer, character_layer, accent_layer, index) for index in range(FRAME_COUNT)
    ]
    frames = [fit_line(frame, (320, 270)) for frame in source_frames]
    for index, frame in enumerate(frames, 1):
        frame.save(frames_dir / f"frame_{index:03d}.png", optimize=True, compress_level=9)

    apng = OUT / "01_已收到_2秒_APNG.png"
    frames[0].save(
        apng,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_MS,
        loop=2,
        disposal=0,
        blend=0,
        optimize=True,
        compress_level=9,
    )

    gif_frames = []
    for frame in frames:
        matte = Image.new("RGBA", frame.size, (24, 24, 24, 255))
        matte.alpha_composite(frame)
        gif_frames.append(matte.convert("P", palette=Image.Palette.ADAPTIVE, colors=256))
    gif_path = OUT / "01_已收到_2秒_預覽.gif"
    gif_frames[0].save(
        gif_path,
        save_all=True,
        append_images=gif_frames[1:],
        duration=FRAME_MS,
        loop=0,
        optimize=True,
        disposal=2,
    )

    contact = Image.new("RGB", (640, 270), (24, 24, 24))
    for index, frame in enumerate(frames):
        tile = frame.resize((160, 135), Image.Resampling.LANCZOS)
        matte = Image.new("RGBA", tile.size, (24, 24, 24, 255))
        matte.alpha_composite(tile)
        contact.paste(matte.convert("RGB"), ((index % 4) * 160, (index // 4) * 135))
    contact.save(OUT / "01_已收到_8幀總覽.jpg", quality=92)

    main_frames = [fit_line(frame, (240, 240)) for frame in source_frames]
    main_frames[0].save(
        OUT / "main.png",
        save_all=True,
        append_images=main_frames[1:],
        duration=FRAME_MS,
        loop=2,
        disposal=0,
        blend=0,
        optimize=True,
        compress_level=9,
    )
    fit_line(source_frames[0], (96, 74)).save(OUT / "tab.png", optimize=True)
    print(f"apng={apng} bytes={apng.stat().st_size}")
    print(f"gif={gif_path} bytes={gif_path.stat().st_size}")
    print(f"frames={FRAME_COUNT} duration_ms={FRAME_MS * FRAME_COUNT}")


if __name__ == "__main__":
    main()
