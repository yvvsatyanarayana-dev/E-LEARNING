import os
import re

dir_path = r'd:\E-LEARNING\FRONTEND\src\pages\Admin'
user_svg = '  user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,'

for root, dirs, files in os.walk(dir_path):
    for f in files:
        if f.endswith('.jsx'):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            if 'const icons = {' in content and 'user:' not in content:
                # Insert user: before the closing }; of the icons object
                new_content = re.sub(r'(  activity:.*?\n)(};)', lambda m: m.group(1) + user_svg + '\n' + m.group(2), content, flags=re.DOTALL)
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print('Updated ' + f)
                else:
                    print('No match in: ' + f)
