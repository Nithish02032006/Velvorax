import os
import re

frontend_dir = 'frontend'
for filename in os.listdir(frontend_dir):
    if filename.endswith('.html'):
        path = os.path.join(frontend_dir, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        
        # Ensure perfect vertical alignment and slightly larger size for nav logos
        # Target the nav logo container
        def fix_alignment(match):
            tag = match.group(0)
            # Make nav logos h-12 for better alignment with 2-line text
            if 'h-10' in tag:
                tag = tag.replace('h-10', 'h-12')
            # Ensure items-center is on the parent (usually <a> or <header>)
            return tag

        new_content = re.sub(r'<img [^>]*assets/logo.jpg[^>]*>', fix_alignment, new_content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Aligned {filename}')
