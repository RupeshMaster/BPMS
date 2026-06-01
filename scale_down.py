import os
import re

directories = [
    r"c:\Backup\Internship\bharat_petroleum\frontend\src\pages",
    r"c:\Backup\Internship\bharat_petroleum\frontend\src\components"
]

replacements = [
    (r"width: '2\.8125rem'", "width: '1.5rem'"),
    (r"height: '2\.8125rem'", "height: '1.5rem'"),
    (r"width: '2\.1875rem'", "width: '1.5rem'"),
    (r"height: '2\.1875rem'", "height: '1.5rem'"),
    (r"width: '1\.875rem'", "width: '1.25rem'"),
    (r"height: '1\.875rem'", "height: '1.25rem'"),
    (r"width: '15\.375rem'", "width: '12rem'"),
    (r"w-\[15\.375rem\]", "w-48"),
    (r"padding: '3px 0\.9375rem'", "padding: '4px 12px'"),
    (r"h-\[4rem\]", "h-11"),
    (r"text-\[1\.25rem\]", "text-sm"),
    (r"text-\[1\.75rem\]", "text-lg"),
    (r"max-w-\[37\.5rem\]", "max-w-xl"),
    (r"max-w-\[34\.375rem\]", "max-w-xl"),
    (r"padding-\[50px_30px\]", "py-8 px-6"),
    (r"marginBottom: '2\.1875rem'", "marginBottom: '1rem'"),
    (r"width: '2rem', height: '2rem'", "width: '1.5rem', height: '1.5rem'"),
    (r"paddingLeft: '2\.5rem'", "paddingLeft: '1rem'")
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
