import os
import glob
import re

base_dir = r"c:\Users\Sharan\internship\E-LEARNING\FRONTEND\src\pages\Admin"
css_files = glob.glob(os.path.join(base_dir, "**", "*.css"), recursive=True)
jsx_files = glob.glob(os.path.join(base_dir, "**", "*.jsx"), recursive=True)

for fpath in css_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = re.sub(r'cursor\s*:\s*none\s*;?', '', content)
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned CSS: {os.path.basename(fpath)}")

for fpath in jsx_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_content = re.sub(r'const\s+cursorRef\s*=\s*useRef\(null\);\s*', '', content)
    new_content = re.sub(r'const\s+cursorRingRef\s*=\s*useRef\(null\);\s*', '', new_content)
    
    new_content = re.sub(r'useEffect\(\(\)\s*=>\s*\{\s*const\s+cursor\s*=\s*cursorRef\.current;[\s\S]*?cancelAnimationFrame\(raf\);\s*\}\s*;\s*\}\,\s*\[\]\);\s*', '', new_content)
    
    new_content = re.sub(r'<div className="sc-cursor"\s*ref=\{cursorRef\}\s*/>\s*', '', new_content)
    new_content = re.sub(r'<div className="sc-cursor-ring"\s*ref=\{cursorRingRef\}\s*/>\s*', '', new_content)
    new_content = re.sub(r'cursor\s*:\s*"none"', 'cursor:"pointer"', new_content)
    
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned JSX: {os.path.basename(fpath)}")
