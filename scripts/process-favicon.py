from PIL import Image
import os

src = r"C:\Users\moham\Downloads\ChatGPT Image Sep 4, 2026, 04_40_23 PM - Copy.png"
out_dir = r"e:\RND\RES\frontend\public"

im = Image.open(src).convert("RGBA")
pixels = im.load()
w, h = im.size

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if r > 235 and g > 235 and b > 235:
            pixels[x, y] = (r, g, b, 0)
        elif r > 215 and g > 215 and b > 215 and abs(r - g) < 10 and abs(g - b) < 10:
            brightness = (r + g + b) / 3
            alpha = int(max(0, min(255, (240 - brightness) * 10)))
            pixels[x, y] = (r, g, b, alpha)

bbox = im.getbbox()
if bbox:
    pad = 12
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(w, bbox[2] + pad)
    bottom = min(h, bbox[3] + pad)
    im = im.crop((left, top, right, bottom))

# Square canvas
side = max(im.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
ox = (side - im.size[0]) // 2
oy = (side - im.size[1]) // 2
sq.paste(im, (ox, oy), im)

sq.save(os.path.join(out_dir, "logo-icon.png"), "PNG")

for size, name in [(16, "favicon-16.png"), (32, "favicon-32.png"), (48, "favicon-48.png"), (64, "favicon.png"), (180, "apple-touch-icon.png")]:
    sq.resize((size, size), Image.Resampling.LANCZOS).save(os.path.join(out_dir, name), "PNG")

# Multi-size ICO for broad browser support
ico_sizes = [(16, 16), (32, 32), (48, 48)]
sq.save(
    os.path.join(out_dir, "favicon.ico"),
    format="ICO",
    sizes=ico_sizes,
)

print("favicon assets written")
print("source cropped size:", im.size)
print("square:", side)
