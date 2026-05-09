import re

try:
    with open(r'C:\Users\HP\.gemini\antigravity\brain\7a6fb845-461f-4eff-970f-fc629aa37af1\.system_generated\logs\overview.txt', 'r', encoding='utf-8') as f:
        data = f.read()

    # Search for the content key inside page_1777795841217
    idx = data.rfind('"id": "page_1777795841217"')
    if idx != -1:
        substr = data[idx:idx+100000] # Get the rest of the block
        match = re.search(r'"content":\s*"(.*?)"\s*\}\s*\]', substr, re.DOTALL)
        if match:
            print('FOUND')
            with open('extracted_content.txt', 'w', encoding='utf-8') as out:
                out.write(match.group(1))
        else:
            print('CONTENT MATCH NOT FOUND')
    else:
        print('PAGE ID NOT FOUND')
except Exception as e:
    print(f"Error: {e}")
