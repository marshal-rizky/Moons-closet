# One-off: extract Moon's Closet logo from the cream-background original.
# Outputs transparent/recolored PNGs to public/brand/ + app/icon.png.
# Usage: python scripts/process-logo.py [path-to-image0.png]
import math
import os
import sys

from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expandvars(
    r"%LOCALAPPDATA%\Temp\mooncloset-drive\image0.png"
)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "public", "brand")
CREAM = (250, 240, 230)  # #faf0e6 site token

# Alpha ramp: fully transparent below T0 color-distance from bg, opaque above T1.
T0, T1 = 10, 55


def smoothstep(d):
    if d <= T0:
        return 0.0
    if d >= T1:
        return 1.0
    t = (d - T0) / (T1 - T0)
    return t * t * (3 - 2 * t)


def extract(src_path):
    im = Image.open(src_path).convert("RGBA")
    px = im.load()
    bg = px[0, 0][:3]
    out = Image.new("RGBA", im.size)
    po = out.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, _ = px[x, y]
            d = math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
            a = smoothstep(d)
            if a == 0:
                po[x, y] = (0, 0, 0, 0)
                continue
            # un-blend the bg contribution from semi-transparent fringe pixels
            ur = min(255, max(0, round((r - (1 - a) * bg[0]) / a)))
            ug = min(255, max(0, round((g - (1 - a) * bg[1]) / a)))
            ub = min(255, max(0, round((b - (1 - a) * bg[2]) / a)))
            po[x, y] = (ur, ug, ub, round(a * 255))
    return out


def trim(im, pad_frac=0.04):
    bbox = im.getchannel("A").getbbox()
    pad = round(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * pad_frac)
    box = (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(im.size[0], bbox[2] + pad),
        min(im.size[1], bbox[3] + pad),
    )
    return im.crop(box)


def boost_alpha(im, gamma=0.6, floor=0.05):
    # Gamma-lift partial alpha so thin serif strokes survive downscaling;
    # cut a small floor so the faint flare halo doesn't smudge.
    a = im.getchannel("A").point(
        lambda v: 0 if v / 255 <= floor else round(255 * (v / 255) ** gamma)
    )
    out = im.copy()
    out.putalpha(a)
    return out


def recolor(im, rgb):
    boosted = boost_alpha(im)
    out = Image.new("RGBA", im.size)
    out.paste(Image.new("RGB", im.size, rgb), mask=boosted.getchannel("A"))
    return out


def main():
    os.makedirs(BRAND, exist_ok=True)

    gold = trim(extract(SRC))
    gold.save(os.path.join(BRAND, "logo-gold.png"))

    black = recolor(gold, (0, 0, 0))
    black.save(os.path.join(BRAND, "logo-black.png"))
    recolor(gold, (255, 255, 255)).save(os.path.join(BRAND, "logo-white.png"))

    # Nav wordmark: crop off the dotted star ornament under "CLOSET" so the
    # wordmark fills the header height instead of empty descender space.
    w, h = black.size
    nav = trim(black.crop((0, 0, w, round(h * 0.70))), pad_frac=0.02)
    nav.thumbnail((720, 10_000))
    nav.save(os.path.join(BRAND, "logo-black-nav.png"))

    white = recolor(gold, (255, 255, 255))
    nav_white = trim(white.crop((0, 0, w, round(h * 0.70))), pad_frac=0.02)
    nav_white.thumbnail((720, 10_000))
    nav_white.save(os.path.join(BRAND, "logo-white-nav.png"))

    # Mark = the interlocking "OO" crescents of MOON'S. Crop box is relative to
    # the trimmed gold logo; tuned by eye against the source render.
    w, h = gold.size
    mark_box = (round(w * 0.24), 0, round(w * 0.63), round(h * 0.50))
    # Stronger boost for the mark: its crescents are hairline-thin and must
    # survive 40-60px display heights.
    mark = boost_alpha(trim(gold.crop(mark_box), pad_frac=0.06), gamma=0.45)
    mark.save(os.path.join(BRAND, "mark-gold.png"))
    recolor(mark, (0, 0, 0)).save(os.path.join(BRAND, "mark-black.png"))

    # Favicon: gold mark centered on cream square.
    icon = Image.new("RGBA", (512, 512), CREAM + (255,))
    m = mark.copy()
    m.thumbnail((360, 360))
    icon.alpha_composite(m, ((512 - m.size[0]) // 2, (512 - m.size[1]) // 2))
    icon.save(os.path.join(ROOT, "app", "icon.png"))

    for name in ("logo-gold", "logo-black", "logo-white", "logo-black-nav", "mark-gold", "mark-black"):
        p = os.path.join(BRAND, f"{name}.png")
        print(name, Image.open(p).size)
    print("icon", Image.open(os.path.join(ROOT, "app", "icon.png")).size)


if __name__ == "__main__":
    main()
