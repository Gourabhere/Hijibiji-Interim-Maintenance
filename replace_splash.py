from PIL import Image
import os

base = r'c:\Users\abc\Hijibiji-Interim-Maintenance-1\android\app\src\main\res'
logo_path = r'c:\Users\abc\Hijibiji-Interim-Maintenance-1\resources\icon.png'

dirs = [
    'drawable',
    'drawable-port-mdpi',
    'drawable-port-hdpi',
    'drawable-port-xhdpi',
    'drawable-port-xxhdpi',
    'drawable-port-xxxhdpi',
    'drawable-land-mdpi',
    'drawable-land-hdpi',
    'drawable-land-xhdpi',
    'drawable-land-xxhdpi',
    'drawable-land-xxxhdpi',
]

# First, print all original dimensions
for d in dirs:
    splash_path = os.path.join(base, d, 'splash.png')
    if os.path.exists(splash_path):
        img = Image.open(splash_path)
        print(f'{d}: {img.size} (mode={img.mode})')

# Load the logo
logo = Image.open(logo_path).convert('RGBA')
print(f'\nLogo original size: {logo.size}')

# Replace each splash.png
for d in dirs:
    splash_path = os.path.join(base, d, 'splash.png')
    if os.path.exists(splash_path):
        orig = Image.open(splash_path)
        target_w, target_h = orig.size
        orig_mode = orig.mode

        # Create a white background at the original splash dimensions
        if orig_mode == 'RGBA':
            canvas = Image.new('RGBA', (target_w, target_h), (255, 255, 255, 255))
        else:
            canvas = Image.new('RGB', (target_w, target_h), (255, 255, 255))

        # Scale the logo to fit within the splash, keeping aspect ratio
        # Use about 40% of the smaller dimension for the logo
        logo_max = int(min(target_w, target_h) * 0.4)
        logo_ratio = min(logo_max / logo.width, logo_max / logo.height)
        new_logo_w = int(logo.width * logo_ratio)
        new_logo_h = int(logo.height * logo_ratio)
        resized_logo = logo.resize((new_logo_w, new_logo_h), Image.LANCZOS)

        # Center the logo on the canvas
        x_offset = (target_w - new_logo_w) // 2
        y_offset = (target_h - new_logo_h) // 2

        if orig_mode == 'RGBA':
            canvas.paste(resized_logo, (x_offset, y_offset), resized_logo)
        else:
            # Composite onto white background for RGB
            temp = Image.new('RGBA', (target_w, target_h), (255, 255, 255, 255))
            temp.paste(resized_logo, (x_offset, y_offset), resized_logo)
            canvas = temp.convert('RGB')

        canvas.save(splash_path, 'PNG')
        print(f'Replaced: {d}/splash.png ({target_w}x{target_h})')

print('\nDone! All splash.png files replaced.')
