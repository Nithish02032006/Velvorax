import os
import re

directory = 'frontend'
pattern = re.compile(r'<a href="registrations\.html".*?</a>', re.DOTALL)

for filename in os.listdir(directory):
    if filename.endswith('.html'):
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = pattern.sub('', content)

        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")

print("Done removing registrations.html links from sidebar.")
