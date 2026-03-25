import os
import re

dir_path = r'd:\E-LEARNING\FRONTEND\src\pages\Admin'
activity_svg = r'  activity:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,'
mail_svg = r'  mail:       <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,'

for root, dirs, files in os.walk(dir_path):
    for f in files:
        if f.endswith('.jsx'):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            if 'const icons = {' in content:
                new_content = content
                if 'activity:' not in content:
                    new_content = re.sub(r'(const icons = \{.*?)(};)', r'\1\n' + activity_svg + r'\n\2', new_content, flags=re.DOTALL)
                if 'mail:' not in new_content:
                    new_content = re.sub(r'(const icons = \{.*?)(};)', r'\1\n' + mail_svg + r'\n\2', new_content, flags=re.DOTALL)
                
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print('Updated ' + f)
