from PIL import Image
import os

src = r"C:\Users\moham\Downloads\ChatGPT Image Sep 4, 2026, 04_40_23 PM.png"
out_dir = r"e:\RND\RES\frontend\public"
os.makedirs(out_dir, exist_ok=True)

im = Image.open(src).convert("RGBA")
pixels = im.load()
w, h = im.size

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if r > 230 and g > 230 and b > 230:
            pixels[x, y] = (r, g, b, 0)
        elif r > 210 and g > 210 and b > 210 and abs(r - g) < 12 and abs(g - b) < 12:
            brightness = (r + g + b) / 3
            alpha = int(max(0, min(255, (235 - brightness) * 8)))
            pixels[x, y] = (r, g, b, alpha)

bbox = im.getbbox()
if bbox:
    pad = 8
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(w, bbox[2] + pad)
    bottom = min(h, bbox[3] + pad)
    im = im.crop((left, top, right, bottom))

full_path = os.path.join(out_dir, "logo-full.png")
im.save(full_path, "PNG")
print("full:", im.size, full_path)

iw, ih = im.size
icon_bottom = int(ih * 0.62)
for y in range(int(ih * 0.45), ih):
    dark = 0
    for x in range(iw):
        r, g, b, a = im.getpixel((x, y))
        if a > 180 and r < 60 and g < 60 and b < 80:
            dark += 1
    if dark > iw * 0.08:
        icon_bottom = max(int(ih * 0.4), y - 6)
        break

icon = im.crop((0, 0, iw, icon_bottom))
bbox2 = icon.getbbox()
if bbox2:
    icon = icon.crop(bbox2)

icon_path = os.path.join(out_dir, "logo-icon.png")
icon.save(icon_path, "PNG")
print("icon:", icon.size, icon_path)

side = max(icon.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
ox = (side - icon.size[0]) // 2
oy = (side - icon.size[1]) // 2
sq.paste(icon, (ox, oy), icon)
sq.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "favicon.png"), "PNG")
sq.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "favicon-32.png"), "PNG")
print("favicon saved")
