import os
import re

frontend_dir = r'c:\Users\nithi\OneDrive\Desktop\Velvorax.AI\frontend'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add config.js script if not present
    if 'js/config.js' not in content:
        head_match = re.search(r'</head>', content, re.IGNORECASE)
        if head_match:
            script_tag = '  <script src="js/config.js"></script>\n'
            content = content[:head_match.start()] + script_tag + content[head_match.start():]

    # Clean up mistakes from previous runs
    content = content.replace("fetch('${CONFIG.API_BASE_URL}/api/", "fetch(CONFIG.API_BASE_URL + '/api/")
    content = content.replace("fetch(\"${CONFIG.API_BASE_URL}/api/", "fetch(CONFIG.API_BASE_URL + \"/api/")
    content = content.replace("fetch(`${CONFIG.API_BASE_URL}/api/", "fetch(CONFIG.API_BASE_URL + `/api/")
    
    # Fix the 'CONFIG.API_BASE_URL issue
    content = content.replace("fetch('CONFIG.API_BASE_URL + '/api/", "fetch(CONFIG.API_BASE_URL + '/api/")
    content = content.replace("fetch(\"CONFIG.API_BASE_URL + \"/api/", "fetch(CONFIG.API_BASE_URL + \"/api/")
    content = content.replace("fetch(`CONFIG.API_BASE_URL + `/api/", "fetch(CONFIG.API_BASE_URL + `/api/")

    # 2. Standardize relative calls (handles both fetch('/api/...') and fetch('/api/...', {...}))
    content = re.sub(r"fetch\(['\"]/api/([^'\"`]+)['\"]", r"fetch(CONFIG.API_BASE_URL + '/api/\1'", content)
    
    # 3. Standardize localhost calls
    content = re.sub(r"fetch\(['\"]http://localhost:3000/api/([^'\"`]+)['\"]", r"fetch(CONFIG.API_BASE_URL + '/api/\1'", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.html') or file.endswith('.js'):
            process_file(os.path.join(root, file))

print("Standardization finally fixed.")
