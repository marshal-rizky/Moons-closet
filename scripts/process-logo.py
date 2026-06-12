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


def recolor(im, rgb):
    # Monochrome versions: remap alpha to suppress the lens-flare glow halo
    # (semi-transparent in the gold original, a smudge when flooded one color).
    a = im.getchannel("A").point(
        lambda v: round(255 * smoothstep_unit(v / 255, 0.35, 0.75))
    )
    out = Image.new("RGBA", im.size)
    out.paste(Image.new("RGB", im.size, rgb), mask=a)
    return out


def smoothstep_unit(x, lo, hi):
    if x <= lo:
        return 0.0
    if x >= hi:
        return 1.0
    t = (x - lo) / (hi - lo)
    return t * t * (3 - 2 * t)


def main():
    os.makedirs(BRAND, exist_ok=True)

    gold = trim(extract(SRC))
    gold.save(os.path.join(BRAND, "logo-gold.png"))

    black = recolor(gold, (0, 0, 0))
    black.save(os.path.join(BRAND, "logo-black.png"))
    recolor(gold, (255, 255, 255)).save(os.path.join(BRAND, "logo-white.png"))

    nav = black.copy()
    nav.thumbnail((720, 10_000))
    nav.save(os.path.join(BRAND, "logo-black-nav.png"))

    # Mark = the interlocking "OO" crescents of MOON'S. Crop box is relative to
    # the trimmed gold logo; tuned by eye against the source render.
    w, h = gold.size
    mark_box = (round(w * 0.24), 0, round(w * 0.63), round(h * 0.50))
    mark = trim(gold.crop(mark_box), pad_frac=0.06)
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
