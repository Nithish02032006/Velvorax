import os
import re

frontend_dir = 'frontend'

for filename in os.listdir(frontend_dir):
    if filename.endswith('.html'):
        path = os.path.join(frontend_dir, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add high-res-logo class to assets/logo.jpg tags
        new_content = re.sub(r'(<img [^>]*assets/logo\.jpg[^>]*class=")', r'\1high-res-logo ', content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Enhanced {filename}')
