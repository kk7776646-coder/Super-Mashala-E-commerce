from PIL import Image

src_path = r"C:\Users\mdanwar\.gemini\antigravity\brain\d6464d9f-d5db-4d11-9704-0b478e7122da\.user_uploaded\media_1795661693431_62b6816b.jpg"
img = Image.open(src_path).convert("RGBA")

# Let's inspect the text portion:
# In 1024x682:
# Top emblem: y=20 to y=390
# Middle text "Super Mashala": y=280 to y=570
# Bottom "& Dry Fruits" banner: y=530 to y=640
text_crop = img.crop((40, 270, 980, 650))
text_crop.save(r"C:\Users\mdanwar\.gemini\antigravity\brain\d6464d9f-d5db-4d11-9704-0b478e7122da\inspect_text_banner.png")
print("Saved inspect_text_banner.png", text_crop.size)
