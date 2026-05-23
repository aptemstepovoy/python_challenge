#!/usr/bin/env python3
"""Generate solid-color PNG icons with a letter for PWA. Stdlib only."""
import struct, zlib, os

OUT = os.path.join(os.path.dirname(__file__), "..", "public")
os.makedirs(OUT, exist_ok=True)

BG = (10, 10, 10)        # #0a0a0a
FG = (212, 165, 116)     # #d4a574

# 5x7 bitmap font for "O"
O_GLYPH = [
    "01110",
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "01110",
]

def make_png(path, size, draw_o=True):
    # Build raw RGBA pixels
    bg_r, bg_g, bg_b = BG
    fg_r, fg_g, fg_b = FG
    rows = []

    if draw_o:
        # Glyph centered, ~60% of size
        gh = int(size * 0.6)
        gw = int(gh * 5 / 7)
        cell = gh // 7
        gw = cell * 5
        gh = cell * 7
        ox = (size - gw) // 2
        oy = (size - gh) // 2
    else:
        cell = ox = oy = 0
        gw = gh = 0

    for y in range(size):
        row = bytearray([0])  # filter byte = None
        for x in range(size):
            r, g, b, a = bg_r, bg_g, bg_b, 255
            if draw_o and oy <= y < oy + gh and ox <= x < ox + gw:
                gy = (y - oy) // cell
                gx = (x - ox) // cell
                if 0 <= gy < 7 and 0 <= gx < 5 and O_GLYPH[gy][gx] == "1":
                    r, g, b = fg_r, fg_g, fg_b
            row += bytes([r, g, b, a])
        rows.append(bytes(row))

    raw = b"".join(rows)

    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    idat = zlib.compress(raw, 9)

    with open(path, "wb") as f:
        f.write(sig)
        f.write(chunk(b"IHDR", ihdr))
        f.write(chunk(b"IDAT", idat))
        f.write(chunk(b"IEND", b""))

make_png(os.path.join(OUT, "icon-192.png"), 192)
make_png(os.path.join(OUT, "icon-512.png"), 512)
make_png(os.path.join(OUT, "apple-touch-icon.png"), 180)
print("icons written to", OUT)
