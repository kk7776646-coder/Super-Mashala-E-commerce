import os
from PIL import Image

src_path = r"C:\Users\mdanwar\.gemini\antigravity\brain\d6464d9f-d5db-4d11-9704-0b478e7122da\.user_uploaded\media_1795661693431_62b6816b.jpg"
img = Image.open(src_path).convert("RGBA")

# Crop the upper emblem (spice and dry fruit bowls in arched composition)
crop_area = (100, 20, 924, 395)
emblem = img.crop(crop_area)

# Make dark black background transparent
data = emblem.getdata()
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

emblem.putdata(new_data)

bbox = emblem.getbbox()
if bbox:
    emblem = emblem.crop(bbox)

out_dir = r"C:\Users\mdanwar\.gemini\antigravity\scratch\super-mashala\frontend\public\assets\logo"
os.makedirs(out_dir, exist_ok=True)
symbol_path = os.path.join(out_dir, "super-mashala-symbol.png")
emblem.save(symbol_path, "PNG")
print("Saved emblem symbol to:", symbol_path, "Size:", emblem.size)
