#!/usr/bin/env python3
"""Compose the 1200x600 catalog banner from the working-state screenshot."""
import pathlib

from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).parent
SHOTS = ROOT / 'docs' / 'shots'
W, H = 1200, 600

FONT_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'


def font(size, bold=False):
    try:
        return ImageFont.truetype(FONT_B if bold else FONT, size)
    except OSError:
        return ImageFont.load_default()


def main() -> None:
    bg = Image.new('RGB', (W, H), (11, 14, 20))
    d = ImageDraw.Draw(bg)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=(int(11 + 8 * t), int(14 + 10 * t), int(20 + 16 * t)))

    shot = Image.open(SHOTS / 'working.png').convert('RGBA')
    scale = 400 / shot.height
    shot = shot.resize((int(shot.width * scale), int(shot.height * scale)), Image.LANCZOS)
    bg.paste(shot, (W - shot.width - 70, (H - shot.height) // 2), shot)

    d.text((70, 200), 'Mascot Widget', font=font(52, bold=True), fill=(238, 243, 251))
    d.text((72, 268), 'Your Hermes agent, with a face', font=font(26), fill=(159, 176, 200))
    d.text((72, 304), 'and a status line', font=font(26), fill=(159, 176, 200))
    d.text((72, 372), 'github.com/kangmochi/mascot-widget', font=font(18), fill=(76, 141, 255))

    out = SHOTS / 'banner.png'
    bg.save(out, optimize=True)
    print('wrote', out, out.stat().st_size, 'bytes')


if __name__ == '__main__':
    main()
