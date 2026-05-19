import os

frontend_dir = 'frontend'
for filename in os.listdir(frontend_dir):
    if filename.endswith('.html'):
        path = os.path.join(frontend_dir, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content.replace('assets/logo.png', 'assets/logo.jpg')
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {filename}')
