import os
from PIL import Image

src_path = r"C:\Users\mdanwar\.gemini\antigravity\brain\d6464d9f-d5db-4d11-9704-0b478e7122da\.user_uploaded\media_1795661693431_62b6816b.jpg"
img = Image.open(src_path).convert("RGBA")

# Make black background transparent
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

img.putdata(new_data)

# Crop to the exact bounding box of the entire logo
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

out_dir = r"C:\Users\mdanwar\.gemini\antigravity\scratch\super-mashala\frontend\public\assets\logo"
os.makedirs(out_dir, exist_ok=True)

# Save as the official logo and horizontal/compact aliases so everything uses the unified logo
unified_path = os.path.join(out_dir, "super-mashala-logo.png")
img.save(unified_path, "PNG")
img.save(os.path.join(out_dir, "super-mashala-horizontal.png"), "PNG")
print("Saved unified logo to:", unified_path, "Size:", img.size)
