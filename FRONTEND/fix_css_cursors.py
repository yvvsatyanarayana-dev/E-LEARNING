import os
import glob

base_dir = r"c:\Users\Sharan\internship\E-LEARNING\FRONTEND\src\pages\Admin"
css_files = glob.glob(os.path.join(base_dir, "**", "*.css"), recursive=True)

cursor_rules = """
/* Added globally for cursor fixes */
button, .btn, .sb-link, .tb-icon-btn, .filter-chip, .pg-btn, .ut-action, .tab-btn {
    cursor: pointer !important;
}
input, textarea, select {
    cursor: text !important;
}
"""

for fpath in css_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "/* Added globally for cursor fixes */" not in content:
        with open(fpath, 'a', encoding='utf-8') as f:
            f.write("\n" + cursor_rules)
        print(f"Added cursor rules to {os.path.basename(fpath)}")
