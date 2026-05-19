import os
import re

frontend_dir = 'frontend'
target_text = 'group-hover:scale-105'

for filename in os.listdir(frontend_dir):
    if filename.endswith('.html'):
        path = os.path.join(frontend_dir, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Target the nav logo with h-7 or h-10 and change to h-12
        new_content = re.sub(r'assets/logo\.jpg"[^>]+h-[0-9]+', lambda m: m.group(0).replace('h-7', 'h-12').replace('h-10', 'h-12').replace('h-8', 'h-12'), content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Aligned {filename}')
