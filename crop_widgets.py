from PIL import Image
import os

img_path = '/Users/ompandey/.gemini/antigravity/brain/c806e047-0c74-48ad-a124-dd80d6147914/uploaded_image_1_1764828883737.png'
img = Image.open(img_path)

# Crop Month View (Top)
# Guessing coordinates based on 701x1024
# The screenshot shows "Month View" text below the top widget.
# Let's try to grab the widget itself.
# Assuming it's roughly centered.
month_box = (170, 220, 530, 500) # Approx 360x280
month_img = img.crop(month_box)
month_img.save('assets/widget-preview-month.png')

# Crop Grid View (Bottom)
# The screenshot shows "Grid View" text below the bottom widget.
grid_box = (170, 680, 530, 830) # Approx 360x150
grid_img = img.crop(grid_box)
grid_img.save('assets/widget-preview-grid.png')

print("Saved widget previews")
