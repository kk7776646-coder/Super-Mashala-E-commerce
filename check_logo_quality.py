from PIL import Image

h_img = Image.open(r"C:\Users\mdanwar\.gemini\antigravity\scratch\super-mashala\frontend\public\assets\logo\super-mashala-horizontal.png")
print("Horizontal dimensions:", h_img.size, "Mode:", h_img.mode)

# Check alpha channel distribution
alphas = [p[3] for p in h_img.getdata()]
opaque = sum(1 for a in alphas if a > 200)
trans = sum(1 for a in alphas if a == 0)
semi = sum(1 for a in alphas if 0 < a <= 200)
print(f"Total pixels: {len(alphas)}, Opaque: {opaque}, Transparent: {trans}, Semi-transparent: {semi}")
