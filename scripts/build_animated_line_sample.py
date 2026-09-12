import argparse
from pathlib import Path

from PIL import Image


def alpha_box(image: Image.Image):
    return image.getchannel("A").getbbox() or (0, 0, image.width, image.height)


def build(root: Path, phrase: str):
    frames_dir = root / "frames"
    ready_dir = root / "line-ready-frames"
    ready_dir.mkdir(exist_ok=True)
    sources = [Image.open(path).convert("RGBA") for path in sorted(frames_dir.glob("frame_*.png"))]
    if not 5 <= len(sources) <= 20:
        raise ValueError(f"LINE APNG requires 5-20 frames; found {len(sources)}")

    boxes = [alpha_box(image) for image in sources]
    union = (
        min(box[0] for box in boxes),
        min(box[1] for box in boxes),
        max(box[2] for box in boxes),
        max(box[3] for box in boxes),
    )

    def render(image: Image.Image, size: tuple[int, int], padding: int):
        cropped = image.crop(union)
        scale = min((size[0] - padding * 2) / cropped.width, (size[1] - padding * 2) / cropped.height)
        resized = cropped.resize(
            (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
            Image.Resampling.LANCZOS,
        )
        canvas = Image.new("RGBA", size, (0, 0, 0, 0))
        canvas.alpha_composite(resized, ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2))
        return canvas

    ready = [render(image, (320, 270), 4) for image in sources]
    for index, image in enumerate(ready, 1):
        image.save(ready_dir / f"frame_{index:03d}.png", optimize=True, compress_level=9)

    duration_ms = 2000 // len(ready)
    apng_path = root / f"{phrase}_動態貼圖_APNG.png"
    ready[0].save(
        apng_path,
        save_all=True,
        append_images=ready[1:],
        duration=duration_ms,
        loop=2,
        disposal=0,
        blend=0,
        optimize=True,
        compress_level=9,
    )

    gif_frames = []
    for frame in ready:
        matte = Image.new("RGBA", frame.size, (255, 255, 255, 255))
        matte.alpha_composite(frame)
        gif_frames.append(matte.convert("P", palette=Image.Palette.ADAPTIVE, colors=256))
    gif_path = root / f"{phrase}_動畫預覽.gif"
    gif_frames[0].save(
        gif_path,
        save_all=True,
        append_images=gif_frames[1:],
        duration=duration_ms,
        loop=0,
        optimize=True,
        disposal=2,
    )

    main = [render(image, (240, 240), 6) for image in sources]
    main_path = root / "main_240x240.png"
    main[0].save(
        main_path,
        save_all=True,
        append_images=main[1:],
        duration=duration_ms,
        loop=2,
        disposal=0,
        blend=0,
        optimize=True,
        compress_level=9,
    )

    tab_path = root / "tab_96x74.png"
    render(sources[0], (96, 74), 2).save(tab_path, optimize=True, compress_level=9)

    preview = Image.new("RGBA", (500, 500), (255, 255, 255, 255))
    preview_frame = ready[0].copy()
    preview_frame.thumbnail((480, 480), Image.Resampling.LANCZOS)
    preview.alpha_composite(preview_frame, ((500 - preview_frame.width) // 2, (500 - preview_frame.height) // 2))
    preview.convert("RGB").save(root / f"{phrase}_靜態預覽.jpg", quality=94)

    for path in (apng_path, gif_path, main_path, tab_path):
        print(path.name, path.stat().st_size)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    parser.add_argument("phrase")
    args = parser.parse_args()
    build(args.root, args.phrase)
