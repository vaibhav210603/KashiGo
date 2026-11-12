#!/usr/bin/env python3
"""Generate the "talk to a Kashi guru on Google Meet" animation.

Outputs (in public/consult/):
  meet-guru.gif         looping animation: Meet call -> Lo Shu grid -> kundali -> Meet call
  meet-guru-poster.jpg  still of the first (Meet call) frame

Uses public/consult/google-meet.svg (official icon from Wikimedia Commons,
"Google_Meet_icon_(2020).svg") rasterised with ImageMagick / rsvg-convert / qlmanage,
and the guru portrait public/puja/badri-narayan-upadhyay-icon.jpg.
Everything else is drawn with Pillow at SS x supersampling and downscaled.

Run:  nice -n 10 python3 scripts/make_meet_gif.py
"""
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "consult"
SVG = OUT_DIR / "google-meet.svg"
PORTRAIT = ROOT / "public" / "puja" / "badri-narayan-upadhyay-icon.jpg"
GIF_OUT = OUT_DIR / "meet-guru.gif"
POSTER_OUT = OUT_DIR / "meet-guru-poster.jpg"

SS = 3                      # supersampling factor
W, H = 720, 480             # output canvas
FPS = 15
TOTAL = 9.6                 # seconds per loop
NFRAMES = int(round(TOTAL * FPS))

# Brand tokens (src/app/globals.css)
NIGHT = (7, 11, 24)         # --color-night
NIGHT2 = (13, 19, 40)       # --color-night-2
NIGHT3 = (22, 29, 58)       # --color-night-3
FIRE = (255, 122, 26)       # --color-fire
MARIGOLD = (255, 182, 39)   # --color-marigold
EMBER = (255, 77, 46)       # --color-ember

# Google Meet UI colours
MEET_BG = (32, 33, 36)
MEET_TILE = (60, 64, 67)
MEET_TEXT = (232, 234, 237)
MEET_RED = (234, 67, 53)
MEET_BLUE = (138, 180, 248)

# Laptop geometry (1x canvas px)
BEZEL = (130, 44, 590, 342)
SCREEN = (141, 55, 579, 327)
SW, SH = SCREEN[2] - SCREEN[0], SCREEN[3] - SCREEN[1]   # 438 x 272

# Figure (Lo Shu / kundali) geometry, screen-local 1x px
FIG_C = (SW / 2, 120)
FIG_L = 150
STROKE = 1.8
CAPTION_Y = 226

FONT_DIR = Path("/System/Library/Fonts")
_font_cache = {}


def font(kind, size):
    """kind: ui | uibold | num. size in 1x px (scaled by SS here)."""
    key = (kind, round(size * SS))
    if key not in _font_cache:
        spec = {
            "ui": ("Avenir Next.ttc", 5),       # Medium
            "uibold": ("Avenir Next.ttc", 2),   # Demi Bold
            "num": ("Avenir Next.ttc", 5),      # Medium, lining figures
        }[kind]
        try:
            f = ImageFont.truetype(str(FONT_DIR / spec[0]), key[1], index=spec[1])
        except OSError:
            f = ImageFont.load_default(key[1])
        _font_cache[key] = f
    return _font_cache[key]


def s(v):
    return int(round(v * SS))


def sb(box):
    return tuple(s(v) for v in box)


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_io(x):
    x = clamp(x)
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def lerp(a, b, t):
    return a + (b - a) * t


def with_alpha(img, a):
    if a >= 0.999:
        return img
    out = img.copy()
    out.putalpha(img.getchannel("A").point(lambda v: int(v * a + 0.5)))
    return out


def rounded_mask(size, r):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), r, fill=255)
    return m


# ---------------------------------------------------------------- assets

def rasterise_svg(svg, height_px):
    """Rasterise the official Meet SVG to RGBA at the given pixel height."""
    tmp = Path(tempfile.mkdtemp(prefix="meetsvg"))
    png = tmp / "meet.png"
    big = height_px * 4
    try:
        cmds = []
        if shutil.which("rsvg-convert"):
            cmds.append(["rsvg-convert", "-h", str(big), "-o", str(png), str(svg)])
        for exe in ("magick", "convert"):
            if shutil.which(exe):
                cmds.append([exe, "-background", "none", "-density", "1200", str(svg),
                             "-resize", f"x{big}", str(png)])
        if shutil.which("qlmanage"):
            cmds.append(["qlmanage", "-t", "-s", str(big * 2), "-o", str(tmp), str(svg)])
        for cmd in cmds:
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            cand = png if png.exists() else next(tmp.glob("*.png"), None)
            if cand and cand.exists():
                im = Image.open(cand).convert("RGBA")
                bbox = im.getchannel("A").getbbox() or (0, 0) + im.size
                im = im.crop(bbox)
                w = round(im.width * height_px / im.height)
                return im.resize((w, height_px), Image.LANCZOS)
        sys.exit("Could not rasterise google-meet.svg (need rsvg-convert, ImageMagick or qlmanage)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def sprite(text, fnt, color):
    """Tightly cropped RGBA text sprite (full opacity)."""
    l, t, r, b = fnt.getbbox(text)
    pad = s(2)
    im = Image.new("RGBA", (r - l + 2 * pad, b - t + 2 * pad), color + (0,))
    ImageDraw.Draw(im).text((pad - l, pad - t), text, font=fnt, fill=color + (255,))
    return im


def paste_center(base, spr, cx, cy, scale=1.0, alpha=1.0):
    if alpha <= 0.003 or scale <= 0.01:
        return
    if abs(scale - 1) > 1e-3:
        spr = spr.resize((max(1, round(spr.width * scale)), max(1, round(spr.height * scale))),
                         Image.BICUBIC)
    spr = with_alpha(spr, alpha)
    base.alpha_composite(spr, (round(cx - spr.width / 2), round(cy - spr.height / 2)))


# ---------------------------------------------------------------- background + laptop

def build_background():
    size = (W * SS, H * SS)
    # soft radial glow: night at the edges, a purple-navy lift behind the laptop
    g = Image.radial_gradient("L").resize((int(W * 1.5), int(H * 1.7)), Image.BICUBIC)
    g = g.crop((int(W * 0.25), int(H * 0.38), int(W * 1.25), int(H * 1.38)))
    g = g.point(lambda v: min(255, int(v * 1.25)))
    centre = Image.new("RGB", (W, H), (26, 24, 62))
    edge = Image.new("RGB", (W, H), NIGHT)
    bg = Image.composite(edge, centre, g).resize(size, Image.BICUBIC).convert("RGBA")

    # shadow under the laptop
    sh = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    d.ellipse(sb((96, 344, 624, 376)), fill=(0, 0, 0, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(s(9)))
    bg.alpha_composite(sh)
    sh2 = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(sh2).ellipse(sb((120, 350, 600, 362)), fill=(0, 0, 0, 140))
    bg.alpha_composite(sh2.filter(ImageFilter.GaussianBlur(s(3))))

    d = ImageDraw.Draw(bg)
    # lid / bezel
    d.rounded_rectangle(sb(BEZEL), s(14), fill=(9, 12, 24), outline=(42, 49, 82), width=s(1.2))
    d.ellipse(sb((358.4, 47.9, 361.6, 51.1)), fill=(30, 36, 62))
    # base
    d.rounded_rectangle(sb((92, 338, 628, 355)), s(8), fill=(27, 32, 56),
                        corners=(False, False, True, True))
    d.rectangle(sb((92, 338, 628, 346)), fill=(42, 49, 82))
    d.rectangle(sb((92, 338, 628, 339)), fill=(64, 72, 110))
    d.rounded_rectangle(sb((322, 338, 398, 342.5)), s(2.5), fill=(24, 29, 52),
                        corners=(False, False, True, True))
    return bg


# ---------------------------------------------------------------- scene 1: Meet call

TILE = (12, 26, 318, 232)
SELF = (326, 162, 426, 232)
CTRL_Y = 252


def build_meet_static():
    size = (SW * SS, SH * SS)
    im = Image.new("RGBA", size, MEET_BG + (255,))
    d = ImageDraw.Draw(im)

    # Meet logo + wordmark
    logo = rasterise_svg(SVG, s(12))
    im.alpha_composite(logo, (s(12), s(8)))
    d.text((s(12) + logo.width + s(6), s(14)), "Google Meet", font=font("ui", 10.5),
           fill=MEET_TEXT, anchor="lm")

    # guru portrait, crop to fill the tile, rounded corners
    tw, th = s(TILE[2] - TILE[0]), s(TILE[3] - TILE[1])
    p = Image.open(PORTRAIT).convert("RGB")
    ar = tw / th
    cw = p.width
    ch = round(cw / ar)
    if ch > p.height:
        ch = p.height
        cw = round(ch * ar)
    x0 = (p.width - cw) // 2
    y0 = round((p.height - ch) * 0.15)          # keep the head near the top
    p = p.crop((x0, y0, x0 + cw, y0 + ch)).resize((tw, th), Image.LANCZOS)
    im.paste(p, sb(TILE[:2]), rounded_mask((tw, th), s(10)))

    # name label
    f = font("uibold", 9.5)
    label = "Guruji · Kashi"
    l, t, r, b = f.getbbox(label)
    lx, ly = TILE[0] + 8, TILE[3] - 8
    pill = Image.new("RGBA", size, (0, 0, 0, 0))
    pd = ImageDraw.Draw(pill)
    pw, ph = (r - l) / SS + 12, 17
    pd.rounded_rectangle(sb((lx, ly - ph, lx + pw, ly)), s(8.5), fill=(20, 20, 24, 150))
    im.alpha_composite(pill)
    d.text((s(lx + 6), s(ly - ph / 2)), label, font=f, fill=(255, 255, 255), anchor="lm")

    # self-view tile background
    d.rounded_rectangle(sb(SELF), s(8), fill=(72, 78, 102))

    # control bar
    cx_mic, cx_cam, cx_end = 184, 212, 248
    for cx in (cx_mic, cx_cam):
        d.ellipse(sb((cx - 11, CTRL_Y - 11, cx + 11, CTRL_Y + 11)), fill=MEET_TILE)
    d.rounded_rectangle(sb((cx_end - 18, CTRL_Y - 11, cx_end + 18, CTRL_Y + 11)), s(11),
                        fill=MEET_RED)
    white = (255, 255, 255)
    lw = s(1.3)
    # mic
    cx, cy = cx_mic, CTRL_Y
    d.rounded_rectangle(sb((cx - 2.3, cy - 6.2, cx + 2.3, cy + 1.6)), s(2.3), fill=white)
    d.arc(sb((cx - 4.8, cy - 5.0, cx + 4.8, cy + 3.6)), 0, 180, fill=white, width=lw)
    d.line(sb((cx, cy + 3.6, cx, cy + 6.2)), fill=white, width=lw)
    # camera
    cx = cx_cam
    d.rounded_rectangle(sb((cx - 6.2, cy - 3.8, cx + 2.0, cy + 3.8)), s(1.4), fill=white)
    d.polygon([(s(cx + 2.6), s(cy - 0.9)), (s(cx + 6.4), s(cy - 3.6)),
               (s(cx + 6.4), s(cy + 3.6)), (s(cx + 2.6), s(cy + 0.9))], fill=white)
    # end call: handset turned down
    cx = cx_end
    d.arc(sb((cx - 7.8, cy - 3.6, cx + 7.8, cy + 8.4)), 196, 344, fill=white, width=s(3.0))
    for sx in (-1, 1):
        px = cx + sx * 6.6
        d.rounded_rectangle(sb((px - 2.4, cy - 0.6, px + 2.4, cy + 3.6)), s(1.5), fill=white)

    # speaking ring (outline + soft glow), alpha modulated per frame
    ring = Image.new("RGBA", size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rb = (TILE[0] - 1, TILE[1] - 1, TILE[2] + 1, TILE[3] + 1)
    rd.rounded_rectangle(sb(rb), s(11), outline=MEET_BLUE + (255,), width=s(3.5))
    glow = ring.filter(ImageFilter.GaussianBlur(s(3)))
    glow = with_alpha(glow, 0.8)
    ring2 = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(ring2).rounded_rectangle(sb(rb), s(11), outline=MEET_BLUE + (255,),
                                            width=s(2.2))
    glow.alpha_composite(ring2)
    # keep the glow outside the photo
    inner = Image.new("L", size, 255)
    ImageDraw.Draw(inner).rounded_rectangle(sb(TILE), s(10), fill=0)
    from PIL import ImageChops
    glow.putalpha(ImageChops.multiply(glow.getchannel("A"),
                                      ImageChops.lighter(inner, ring2.getchannel("A"))))
    return im, glow


def draw_self_view(t):
    """Friendly flat avatar in the self-view tile, talking."""
    tw, th = s(SELF[2] - SELF[0]), s(SELF[3] - SELF[1])
    lay = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    ox, oy = SELF[0], SELF[1]

    def b(box):
        return sb((box[0] - ox, box[1] - oy, box[2] - ox, box[3] - oy))

    cx = (SELF[0] + SELF[2]) / 2
    skin = (238, 190, 146)
    hair = (52, 38, 34)
    # shoulders + neck
    d.ellipse(b((cx - 27, 213, cx + 27, 256)), fill=(255, 150, 70))
    d.rounded_rectangle(b((cx - 4.5, 203, cx + 4.5, 216)), s(3), fill=(222, 170, 126))
    d.chord(b((cx - 5.5, 209, cx + 5.5, 219)), 0, 180, fill=(232, 132, 58))   # collar
    # head: hair behind, face, side-swept fringe
    hx, hy, hr = cx, 195, 11.5
    d.ellipse(b((hx - hr - 1.4, hy - hr - 2.4, hx + hr + 1.4, hy + hr - 3)), fill=hair)
    d.ellipse(b((hx - hr - 1.3, hy - 1.5, hx - hr + 2.3, hy + 3.5)), fill=skin)   # ears
    d.ellipse(b((hx + hr - 2.3, hy - 1.5, hx + hr + 1.3, hy + 3.5)), fill=skin)
    d.ellipse(b((hx - hr + 0.6, hy - hr + 2.2, hx + hr - 0.6, hy + hr)), fill=skin)
    # eyes
    for ex in (-4.2, 4.2):
        d.ellipse(b((hx + ex - 1.3, hy + 1.6, hx + ex + 1.3, hy + 4.2)), fill=(40, 32, 36))
    # mouth: talking (periods 0.4 s and 0.6 s divide the loop)
    m = 0.5 + 0.5 * math.sin(2 * math.pi * t / 0.4)
    m = clamp(0.25 + 0.75 * m * (0.6 + 0.4 * math.sin(2 * math.pi * t / 0.6)))
    mh = 0.8 + 3.0 * m
    d.ellipse(b((hx - 2.8, hy + 7.4 - mh / 2, hx + 2.8, hy + 7.4 + mh / 2)), fill=(120, 48, 52))
    return lay, rounded_mask((tw, th), s(8))


MEET_STATIC = None
MEET_RING = None


def meet_ui(t):
    im = MEET_STATIC.copy()
    pulse = 0.5 + 0.5 * math.sin(2 * math.pi * t / 0.8)
    im.alpha_composite(with_alpha(MEET_RING, 0.35 + 0.65 * pulse))
    lay, mask = draw_self_view(t)
    im.paste(lay, sb(SELF[:2]), Image.composite(lay.getchannel("A"),
                                                Image.new("L", mask.size, 0), mask))
    return im


# ---------------------------------------------------------------- scenes 2-3: Lo Shu -> kundali

# segments as ((u1, v1), (u2, v2)) in unit-square coords (y down). Each grid line slides
# its two ends along the square's edges into a kundali line, so the lines turn (and never
# leave the square) while the grid folds into the chart.
GRID = [
    ((0, 0), (1, 0)), ((1, 0), (1, 1)), ((1, 1), (0, 1)), ((0, 1), (0, 0)),   # outer square
    ((1 / 3, 0), (1 / 3, 1)), ((2 / 3, 0), (2 / 3, 1)),                      # verticals
    ((0, 1 / 3), (1, 1 / 3)), ((0, 2 / 3), (1, 2 / 3)),                      # horizontals
    ((0.75, 0.25), (0.75, 0.25)), ((0.25, 0.75), (0.25, 0.75)),              # hidden, grow out
]
KUNDALI = [
    ((0, 0), (1, 0)), ((1, 0), (1, 1)), ((1, 1), (0, 1)), ((0, 1), (0, 0)),
    ((0, 0), (1, 1)), ((1, 0), (0, 1)),                                      # diagonals
    ((0, 0.5), (0.5, 0)), ((0.5, 1), (1, 0.5)),                              # inner diamond
    ((0.5, 0), (1, 0.5)), ((0, 0.5), (0.5, 1)),
]
LOSHU = [[4, 9, 2], [3, 5, 7], [8, 1, 6]]
HOUSE_POS = {1: (0.5, 0.25), 2: (0.25, 0.1), 3: (0.105, 0.25), 4: (0.25, 0.5),
             5: (0.105, 0.75), 6: (0.25, 0.9), 7: (0.5, 0.75), 8: (0.75, 0.9),
             9: (0.895, 0.75), 10: (0.75, 0.5), 11: (0.895, 0.25), 12: (0.75, 0.1)}
PLANETS = [("Su", 10), ("Mo", 4), ("Ma", 1), ("Me", 11), ("Ju", 7),
           ("Ve", 9), ("Sa", 3), ("Ra", 6), ("Ke", 12)]

NUM_SPR = {}
PLANET_SPR = {}
CAP_SPR = {}


def build_fig_sprites():
    for row in LOSHU:
        for n in row:
            NUM_SPR[n] = sprite(str(n), font("num", 23), MARIGOLD)
    for name, _ in PLANETS:
        PLANET_SPR[name] = sprite(name, font("uibold", 10), MARIGOLD)
    for key, txt in (("lo", "Lo Shu grid"), ("kd", "Your kundali")):
        CAP_SPR[key] = sprite(txt, font("ui", 10.5), (240, 214, 170))


def interp_seg(a, b, m):
    return tuple((lerp(pa[0], pb[0], m), lerp(pa[1], pb[1], m)) for pa, pb in zip(a, b))


def to_screen(u, v, scale):
    return (FIG_C[0] + (u - 0.5) * FIG_L * scale, FIG_C[1] + (v - 0.5) * FIG_L * scale)


def draw_lines(layer, segs, scale):
    d = ImageDraw.Draw(layer)
    hw = STROKE / 2
    col = MARIGOLD + (255,)
    for p1, p2 in segs:
        x1, y1 = to_screen(*p1, scale)
        x2, y2 = to_screen(*p2, scale)
        ln = math.hypot(x2 - x1, y2 - y1)
        if ln < 0.5:
            continue
        ca, sa = (x2 - x1) / ln, (y2 - y1) / ln
        nx, ny = -sa * hw, ca * hw
        d.polygon([(s(x1 + nx), s(y1 + ny)), (s(x2 + nx), s(y2 + ny)),
                   (s(x2 - nx), s(y2 - ny)), (s(x1 - nx), s(y1 - ny))], fill=col)
        for px, py in ((x1, y1), (x2, y2)):            # round caps
            d.ellipse(sb((px - hw, py - hw, px + hw, py + hw)), fill=col)


def pop(t, start, dur=0.3):
    p = ease_out((t - start) / dur)
    return p, 0.55 + 0.45 * p


# ---------------------------------------------------------------- timeline

T1, T2, T3 = 2.2, 5.6, 8.6      # transition starts (each 1.0 s)


def state(t):
    st = {"meet": None, "fig": None}
    if t < T1:
        st["meet"] = (1.0, 1.0)
    elif t < T1 + 1:
        u = t - T1
        st["meet"] = (1 - 0.82 * ease_io(u / 0.55), 1 - ease_io((u - 0.05) / 0.4))
        g = ease_out((u - 0.38) / 0.62)
        st["fig"] = dict(m=0.0, scale=0.2 + 0.8 * g, alpha=clamp((u - 0.38) / 0.3))
    elif t < T3:
        st["fig"] = dict(m=ease_io((t - (T2 + 0.15)) / 0.85), scale=1.0, alpha=1.0)
    else:
        v = t - T3
        st["fig"] = dict(m=1.0, scale=1 - 0.8 * ease_io(v / 0.55), alpha=1 - ease_io(v / 0.45))
        g = ease_out((v - 0.3) / 0.7)
        st["meet"] = (0.18 + 0.82 * g, ease_io((v - 0.3) / 0.45))
    return st


def render(t):
    st = state(t)
    size = (SW * SS, SH * SS)
    scr = Image.new("RGBA", size, NIGHT2 + (255,))

    fig = st["fig"]
    if fig and fig["alpha"] > 0.003:
        layer = Image.new("RGBA", size, (0, 0, 0, 0))
        segs = [interp_seg(a, b, fig["m"]) for a, b in zip(GRID, KUNDALI)]
        draw_lines(layer, segs, fig["scale"])
        sc = fig["scale"]
        # numbers 1..9 appear one by one, fade out as the grid turns into a kundali
        out = ease_io((t - T2) / 0.35) if t >= T2 else 0.0
        for r, row in enumerate(LOSHU):
            for c, n in enumerate(row):
                a, k = pop(t, T1 + 0.8 + (n - 1) * 0.11)
                a *= 1 - out
                k *= 1 - 0.25 * out
                if a > 0.003:
                    x, y = to_screen((c + 0.5) / 3, (r + 0.5) / 3, sc)
                    paste_center(layer, NUM_SPR[n], s(x), s(y), k * sc, a)
        if t >= T2:
            for i, (name, house) in enumerate(PLANETS):
                a, k = pop(t, T2 + 0.85 + i * 0.1)
                if a > 0.003:
                    x, y = to_screen(*HOUSE_POS[house], sc)
                    paste_center(layer, PLANET_SPR[name], s(x), s(y), k * sc, a)
        # captions
        lo = ease_io((t - (T1 + 0.5)) / 0.5) * (1 - ease_io((t - T2) / 0.4)) if t < T3 else 0
        kd = ease_io((t - (T2 + 0.55)) / 0.4) if t >= T2 else 0
        paste_center(layer, CAP_SPR["lo"], s(SW / 2), s(CAPTION_Y), 1.0, lo * 0.85)
        paste_center(layer, CAP_SPR["kd"], s(SW / 2), s(CAPTION_Y), 1.0, kd * 0.85)
        scr.alpha_composite(with_alpha(layer, fig["alpha"]))

    if st["meet"] and st["meet"][1] > 0.003:
        msc, ma = st["meet"]
        ui = meet_ui(t)
        if msc < 0.999:
            nw, nh = max(1, round(size[0] * msc)), max(1, round(size[1] * msc))
            ui = ui.resize((nw, nh), Image.BICUBIC)
            rad = s(lerp(4, 12, 1 - msc))
            ui.putalpha(rounded_mask((nw, nh), rad))
        ui = with_alpha(ui, ma)
        scr.alpha_composite(ui, ((size[0] - ui.width) // 2, (size[1] - ui.height) // 2))

    frame = BACKGROUND.copy()
    frame.paste(scr, sb(SCREEN[:2]), rounded_mask(size, s(4)))
    return frame.convert("RGB").resize((W, H), Image.LANCZOS)


# ---------------------------------------------------------------- main

def main():
    global BACKGROUND, MEET_STATIC, MEET_RING
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if not SVG.exists():
        sys.exit(f"Missing {SVG} (download Google_Meet_icon_(2020).svg from Wikimedia Commons)")
    BACKGROUND = build_background()
    MEET_STATIC, MEET_RING = build_meet_static()
    build_fig_sprites()

    frames = []
    for i in range(NFRAMES):
        frames.append(render(i / FPS))
        if i % 24 == 0:
            print(f"frame {i}/{NFRAMES}", flush=True)

    frames[0].save(POSTER_OUT, quality=90, optimize=True, progressive=True)

    # one adaptive palette shared by every frame (built from a spread of frames)
    sample_idx = list(range(0, NFRAMES, 6))
    strip = Image.new("RGB", (W, H * len(sample_idx)))
    for k, i in enumerate(sample_idx):
        strip.paste(frames[i], (0, k * H))
    big = strip.quantize(colors=200, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    # small saturated UI bits (Meet logo, end-call red, avatar) would be starved by the
    # big areas, so give them their own palette slots
    f0 = frames[0]
    crops = ((150, 60, 245, 80), (300, 285, 420, 320), (466, 216, 568, 288))
    parts = [f0.crop(c) for c in crops]
    coll = Image.new("RGB", (max(p.width for p in parts), sum(p.height for p in parts)))
    y = 0
    for p in parts:
        coll.paste(p, (0, y))
        y += p.height
    small = coll.quantize(colors=40, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    # exact colours of the Meet logo and key UI bits
    fixed = [(0, 131, 45), (0, 102, 218), (233, 66, 53), (38, 132, 252), (0, 172, 71),
             (255, 186, 0), (255, 255, 255), MEET_RED, MEET_BLUE, MARIGOLD, (238, 190, 146),
             (255, 150, 70), (52, 38, 34), (120, 48, 52), (40, 32, 36), (72, 78, 102)]
    flat = big.getpalette()[:200 * 3] + small.getpalette()[:40 * 3]
    for c in fixed:
        flat += list(c)
    pal = Image.new("P", (1, 1))
    pal.putpalette(flat)
    pframes = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]

    # 15 fps exactly: 70/70/60 ms pattern (GIF stores centiseconds)
    durations = [(70, 70, 60)[i % 3] for i in range(NFRAMES)]
    pframes[0].save(GIF_OUT, save_all=True, append_images=pframes[1:], duration=durations,
                    loop=0, optimize=False, disposal=1)
    print(f"{GIF_OUT}: {GIF_OUT.stat().st_size / 1024:.0f} KB, {NFRAMES} frames, "
          f"{sum(durations) / 1000:.2f} s")
    print(f"{POSTER_OUT}: {POSTER_OUT.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
