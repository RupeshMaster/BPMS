import os
import re

directories = [
    r"c:\Backup\Internship\bharat_petroleum\frontend\src\pages",
    r"c:\Backup\Internship\bharat_petroleum\frontend\src\components"
]

replacements = [
    # Upscale Text
    (r"text-sm", "text-base"),
    (r"text-base font-semibold", "text-xl font-bold"),
    (r"text-lg", "text-xl font-bold"),
    (r"text-2xl", "text-3xl font-bold"),
    (r"fontSize: '0\.875rem'", "fontSize: '1rem'"),
    
    # Upscale Heights / Widths for Buttons and Inputs
    (r"h-11", "h-12"),
    (r"w-10", "w-12"),
    (r"h-10", "h-12"),
    (r"w-8", "w-10"),
    (r"h-8", "h-10"),
    (r"width: '1\.5rem'", "width: '2rem'"),
    (r"height: '1\.5rem'", "height: '2rem'"),

    # Upscale Paddings and Gaps
    (r"p-4", "p-6"),
    (r"p-3", "p-5"),
    (r"p-5", "p-6"),
    (r"px-4", "px-6"),
    (r"py-3", "py-4"),
    (r"gap-3", "gap-5"),
    (r"gap-4", "gap-6"),
    
    (r"padding: '1rem'", "padding: '1.5rem'"),
    (r"padding: '0\.75rem 1rem'", "padding: '1rem 1.25rem'"),
    (r"padding: '1\.25rem'", "padding: '1.5rem'"),
    
    (r"gap: '1rem'", "gap: '1.5rem'"),

    # Rounding
    (r"borderRadius: '0\.5rem'", "borderRadius: '0.75rem'")
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for directory in directories:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx'):
                process_file(os.path.join(root, file))
print("Done.")
