import os
from PIL import Image

src_path = r"C:\Users\mdanwar\.gemini\antigravity\brain\d6464d9f-d5db-4d11-9704-0b478e7122da\.user_uploaded\media_1795661693431_62b6816b.jpg"
img = Image.open(src_path).convert("RGBA")

# 1. Clean black background from full image
data = img.getdata()
new_data = []
for item in data:
    r, g, b, a = item
    if r < 25 and g < 25 and b < 25:
        max_c = max(r, g, b)
        if max_c < 12:
            new_data.append((0, 0, 0, 0))
        else:
            alpha = int(((max_c - 12) / 13) * 255)
            new_data.append((r, g, b, alpha))
    else:
        new_data.append((r, g, b, a))

img_clean = Image.new("RGBA", img.size)
img_clean.putdata(new_data)

# 2. Extract upper emblem:
# The spice bowls arch
emblem = img_clean.crop((100, 20, 924, 380))
ebbox = emblem.getbbox()
if ebbox:
    emblem = emblem.crop(ebbox)

# 3. Extract text banner:
# "Super Mashala & Dry Fruits"
banner = img_clean.crop((50, 310, 974, 620))
bbbox = banner.getbbox()
if bbbox:
    banner = banner.crop(bbbox)

# Save both
out_dir = r"C:\Users\mdanwar\.gemini\antigravity\scratch\super-mashala\frontend\public\assets\logo"
emblem.save(os.path.join(out_dir, "super-mashala-symbol.png"), "PNG")
banner.save(os.path.join(out_dir, "super-mashala-text-banner.png"), "PNG")

# 4. Create a unified horizontal composition:
# Emblem on left (height 200px), Banner on right (height 180px)
target_h = 200
e_w = int(emblem.width * (target_h / emblem.height))
emblem_resized = emblem.resize((e_w, target_h), Image.Resampling.LANCZOS)

b_h = 170
b_w = int(banner.width * (b_h / banner.height))
banner_resized = banner.resize((b_w, b_h), Image.Resampling.LANCZOS)

gap = 30
total_w = e_w + gap + b_w
total_h = target_h

horizontal_logo = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
horizontal_logo.paste(emblem_resized, (0, 0), emblem_resized)
# Center banner vertically
y_offset = (total_h - b_h) // 2
horizontal_logo.paste(banner_resized, (e_w + gap, y_offset), banner_resized)

horizontal_logo.save(os.path.join(out_dir, "super-mashala-horizontal.png"), "PNG")
horizontal_logo.save(r"C:\Users\mdanwar\.gemini\antigravity\brain\d6464d9f-d5db-4d11-9704-0b478e7122da\inspect_horizontal_logo.png")
print("Horizontal logo created:", horizontal_logo.size)
