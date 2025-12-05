from PIL import Image, ImageDraw, ImageColor

def recolor_to_green(img):
    # Convert to RGBA
    img = img.convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # item is (r, g, b, a)
        r, g, b, a = item
        
        # Detect Purple/Pink (High Red, High Blue, Low Green)
        # HabitRix seems to use a bright purple/pink
        if r > 100 and b > 100 and g < 150:
            # Shift to Teal/Green (High Green, Medium Blue, Low Red)
            # HabitU Green approx: #00E096 (0, 224, 150)
            # Let's map brightness.
            brightness = (r + b) / 2
            new_r = int(r * 0.1)
            new_g = int(brightness * 1.1) # Boost green
            new_b = int(brightness * 0.8) # Keep some blue for teal
            
            # Clamp
            new_g = min(255, new_g)
            new_b = min(255, new_b)
            
            new_data.append((new_r, new_g, new_b, a))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    return img

def create_list_preview():
    # Vertical List
    width, height = 400, 400
    img = Image.new('RGBA', (width, height), (30, 30, 30, 255)) # Dark Grey BG
    draw = ImageDraw.Draw(img)
    
    # Draw 3 Items
    item_color = (40, 40, 40, 255)
    text_line_color = (0, 224, 150, 255) # HabitU Green
    
    for i in range(3):
        y = 50 + i * 110
        # Item Box
        draw.rounded_rectangle((40, y, 360, y + 90), radius=20, fill=item_color)
        # Checkbox
        draw.rounded_rectangle((60, y + 25, 100, y + 65), radius=10, outline=text_line_color, width=3)
        # Text Lines
        draw.rectangle((120, y + 35, 300, y + 45), fill=(200, 200, 200, 255))
        draw.rectangle((120, y + 55, 200, y + 65), fill=(150, 150, 150, 255))

    img.save('assets/widget-preview-list.png')

def create_week_preview():
    # Horizontal Week
    width, height = 400, 200
    img = Image.new('RGBA', (width, height), (30, 30, 30, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw 7 Circles
    spacing = 50
    start_x = 25
    y = 100
    radius = 20
    
    green = (0, 224, 150, 255)
    grey = (60, 60, 60, 255)
    
    for i in range(7):
        x = start_x + i * spacing + radius
        # Fill some as completed
        color = green if i in [0, 1, 3, 4, 6] else grey
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
        
    img.save('assets/widget-preview-week.png')

def create_streak_preview():
    # Streak Counter - Cult Fitness Style (Inspiration)
    # Wide format, Bold text, Flame, Motivational quote
    width, height = 400, 200 # 2:1 Aspect Ratio
    img = Image.new('RGBA', (width, height), (20, 20, 20, 255)) # Darker BG
    draw = ImageDraw.Draw(img)
    
    green = (0, 224, 150, 255)
    white = (255, 255, 255, 255)
    grey = (150, 150, 150, 255)
    
    # Draw "7" (Large Text)
    # Since we don't have custom fonts loaded easily, we'll draw it manually or use default
    # Drawing a large "7" using polygon for boldness
    # Top bar
    draw.rectangle((40, 40, 100, 55), fill=white)
    # Diagonal
    draw.polygon([(100, 40), (100, 55), (60, 130), (45, 130)], fill=white)
    
    # Draw Flame Icon (Green) next to it
    # Base
    draw.ellipse((120, 70, 170, 120), fill=green)
    # Tip
    draw.polygon([(120, 85), (170, 85), (145, 30)], fill=green)
    # Inner flame (White cutout effect)
    draw.ellipse((135, 90, 155, 110), fill=(20, 20, 20, 255))
    
    # "day streak" text
    # Simulating handwritten text with simple lines/curves is hard without font.
    # We'll draw simple block text for "DAY STREAK"
    # D
    draw.rectangle((40, 140, 45, 160), fill=white)
    draw.arc((30, 140, 55, 160), 270, 90, fill=white, width=3)
    # A
    draw.line((65, 160, 75, 140), fill=white, width=3)
    draw.line((75, 140, 85, 160), fill=white, width=3)
    draw.line((70, 150, 80, 150), fill=white, width=3)
    # Y
    draw.line((90, 140, 100, 150), fill=white, width=3)
    draw.line((110, 140, 100, 150), fill=white, width=3)
    draw.line((100, 150, 100, 160), fill=white, width=3)
    
    # "STREAK" (Simplified representation)
    draw.rectangle((120, 145, 200, 155), fill=grey)
    
    # "Keep it up!" (Motivational text at bottom)
    draw.rectangle((40, 170, 150, 175), fill=green)

    # Right side graphic (Abstract "Cage" or "Goal" representation)
    # Let's draw a simple "Target" or "Sun" to be positive
    # Sun rays
    cx, cy = 300, 100
    draw.ellipse((cx-30, cy-30, cx+30, cy+30), outline=green, width=3)
    draw.ellipse((cx-10, cy-10, cx+10, cy+10), fill=green)
    
    img.save('assets/widget-preview-streak.png')

# 1. Recolor existing crops
try:
    month_img = Image.open('assets/widget-preview-month.png')
    month_img = recolor_to_green(month_img)
    month_img.save('assets/widget-preview-month.png')
    
    grid_img = Image.open('assets/widget-preview-grid.png')
    grid_img = recolor_to_green(grid_img)
    grid_img.save('assets/widget-preview-grid.png')
except Exception as e:
    print(f"Error recoloring: {e}")

# 2. Create new synthetic previews
create_list_preview()
create_week_preview()
create_streak_preview()

print("Generated custom widget previews")
