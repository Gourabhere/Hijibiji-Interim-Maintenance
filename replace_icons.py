from PIL import Image
import os

base = r'c:\Users\abc\Hijibiji-Interim-Maintenance-1\android\app\src\main\res'
icon_path = r'c:\Users\abc\Hijibiji-Interim-Maintenance-1\resources\icon.png'

# Android icon dimensions
icon_sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

def replace_icons():
    if not os.path.exists(icon_path):
        print(f"Error: Icon file not found at {icon_path}")
        return

    try:
        logo = Image.open(icon_path).convert('RGBA')
        print(f"Loaded icon from {icon_path} ({logo.size})")

        for folder, size in icon_sizes.items():
            folder_path = os.path.join(base, folder)
            if os.path.exists(folder_path):
                # Standard square icon (Legacy)
                ic_launcher = os.path.join(folder_path, 'ic_launcher.png')
                resized_icon = logo.resize((size, size), Image.LANCZOS)
                resized_icon.save(ic_launcher, 'PNG')
                print(f"Replacing {folder}/ic_launcher.png ({size}x{size})")

                # Round icon (Legacy)
                ic_launcher_round = os.path.join(folder_path, 'ic_launcher_round.png')
                if os.path.exists(ic_launcher_round):
                    # Ideally mask, but resizing is quick fix
                    resized_icon.save(ic_launcher_round, 'PNG')
                    print(f"Replacing {folder}/ic_launcher_round.png ({size}x{size})")

                # Adaptive Foreground Icon
                # Scale relative to legacy size (108/48 = 2.25)
                adaptive_size = int(size * 108 / 48)
                ic_launcher_foreground = os.path.join(folder_path, 'ic_launcher_foreground.png')
                
                # Create transparent canvas for adaptive foreground
                adaptive_canvas = Image.new("RGBA", (adaptive_size, adaptive_size), (0, 0, 0, 0))
                
                # Logo inside foreground should be within safe zone (66% of full size)
                # Let's say 60% to be safe
                logo_target_size = int(adaptive_size * 0.6)
                adaptive_logo = logo.resize((logo_target_size, logo_target_size), Image.LANCZOS)
                
                # Center the logo
                offset = (adaptive_size - logo_target_size) // 2
                adaptive_canvas.paste(adaptive_logo, (offset, offset), adaptive_logo)
                
                adaptive_canvas.save(ic_launcher_foreground, 'PNG')
                print(f"Replacing {folder}/ic_launcher_foreground.png ({adaptive_size}x{adaptive_size})")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    replace_icons()
