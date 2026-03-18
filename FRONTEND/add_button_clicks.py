import os
import glob
import re

base_dir = r"c:\Users\Sharan\internship\E-LEARNING\FRONTEND\src\pages\Admin"
jsx_files = glob.glob(os.path.join(base_dir, "**", "*.jsx"), recursive=True)

# Regex to find <button ...> that does NOT contain onClick
# We capture everything from '<button' up to the closing '>'
pattern = re.compile(r'<button\b(?![^>]*onClick)([^>]*)>')

for fpath in jsx_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We add an onClick that alerts based on text context if possible
    # We'll just use a generic alert since capturing innerText in React inline is e.currentTarget.innerText
    replacement = r'<button onClick={(e) => alert(e.currentTarget.innerText.trim() + " action triggered!")}\1>'
    
    new_content = pattern.sub(replacement, content)
    
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Added onClick handlers to {os.path.basename(fpath)}")
