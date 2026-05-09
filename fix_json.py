import re

try:
    with open('admin.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix leading commas in arrays
    content = re.sub(r'"blocks"\s*:\s*\[\s*,', '"blocks": [', content)
    
    with open('admin.js', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('Successfully fixed JSON syntax in admin.js!')
except Exception as e:
    print(f'Error: {e}')
