# One-off: downscale the Drive product photos for web upload.
# Usage: python scripts/process-photos.py
import os

from PIL import Image

SRC = os.path.expandvars(r"%LOCALAPPDATA%\Temp\mooncloset-drive")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
MAX_SIDE = 1600

os.makedirs(OUT, exist_ok=True)
for f in sorted(os.listdir(SRC)):
    if not f.endswith(".jpg"):
        continue
    im = Image.open(os.path.join(SRC, f)).convert("RGB")
    im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    dest = os.path.join(OUT, f)
    im.save(dest, "JPEG", quality=82, optimize=True)
    print(f, im.size, f"{os.path.getsize(dest) // 1024}KB")
