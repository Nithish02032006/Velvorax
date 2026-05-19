import os
import re

frontend_dir = 'frontend'
for filename in os.listdir(frontend_dir):
    if filename.endswith('.html'):
        path = os.path.join(frontend_dir, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Regex to find img tags with logo.jpg and add rounded-full
        # Also reduce height: h-12 -> h-10, h-10 -> h-8, h-8 -> h-7
        new_content = content
        
        # Add rounded-full, object-cover, aspect-square if not present
        # We target tags with assets/logo.jpg
        def update_logo_tag(match):
            tag = match.group(0)
            if 'rounded-full' not in tag:
                tag = tag.replace('class="', 'class="rounded-full object-cover aspect-square ')
            
            tag = tag.replace('h-12', 'h-10')
            tag = tag.replace('h-10', 'h-8')
            tag = tag.replace('h-8', 'h-7')
            return tag

        new_content = re.sub(r'<img [^>]*assets/logo.jpg[^>]*>', update_logo_tag, new_content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {filename}')
