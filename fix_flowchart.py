import json
import re

with open('admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Parse JSON
json_str = js.replace('const websiteData = ', '').strip()
if json_str.endswith(';'): json_str = json_str[:-1]

json_str = re.sub(r',\s*\]', ']', json_str)
json_str = re.sub(r',\s*\}', '}', json_str)

data = json.loads(json_str)

svg_flowchart = """<div class='flowchart-container' style='margin: 40px 0; background: var(--box-bg); padding: 30px; border-radius: 20px; box-shadow: var(--shadow); overflow-x: auto;'><svg viewBox='0 0 800 500' xmlns='http://www.w3.org/2000/svg'><defs><marker id='arrowhead' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'><polygon points='0 0, 10 3.5, 0 7' fill='var(--primary)'/></marker><filter id='glow'><feGaussianBlur stdDeviation='2.5' result='coloredBlur'/><feMerge><feMergeNode in='coloredBlur'/><feMergeNode in='SourceGraphic'/></feMerge></filter></defs><!-- Connections --><line x1='400' y1='70' x2='400' y2='110' stroke='var(--primary)' stroke-width='2' marker-end='url(#arrowhead)'/><line x1='300' y1='135' x2='190' y2='200' stroke='var(--primary)' stroke-width='2' marker-end='url(#arrowhead)'/><line x1='500' y1='135' x2='610' y2='200' stroke='var(--primary)' stroke-width='2' marker-end='url(#arrowhead)'/><line x1='190' y1='260' x2='350' y2='300' stroke='var(--primary)' stroke-width='2' marker-end='url(#arrowhead)'/><line x1='610' y1='260' x2='450' y2='300' stroke='var(--primary)' stroke-width='2' marker-end='url(#arrowhead)'/><line x1='400' y1='350' x2='400' y2='400' stroke='var(--primary)' stroke-width='2' marker-end='url(#arrowhead)'/><path d='M 350 350 Q 250 375 175 400' fill='none' stroke='var(--primary)' stroke-width='2' marker-end='url(#arrowhead)'/><path d='M 450 350 Q 550 375 625 400' fill='none' stroke='var(--primary)' stroke-width='2' marker-end='url(#arrowhead)'/><path d='M 450 350 Q 550 375 625 400' fill='none' stroke='var(--primary)' stroke-width='2' marker-end='url(#arrowhead)'/><!-- Nodes --><rect x='300' y='20' width='200' height='50' rx='25' fill='var(--primary)'/><text x='400' y='50' text-anchor='middle' fill='var(--white)' style='font-family:Inter,sans-serif;font-weight:bold;font-size:14px'>Patient Monitoring</text><rect x='300' y='110' width='200' height='50' rx='10' fill='var(--secondary)' stroke='var(--primary)' stroke-width='2'/><text x='400' y='140' text-anchor='middle' fill='var(--text-dark)' style='font-family:Inter,sans-serif;font-size:13px'>Sensors &amp; Data Collection</text><rect x='100' y='200' width='180' height='60' rx='10' fill='var(--box-bg)' stroke='var(--primary)' stroke-width='1'/><text x='190' y='225' text-anchor='middle' fill='var(--text-dark)' style='font-family:Inter,sans-serif;font-size:12px'>Vital Signs</text><text x='190' y='245' text-anchor='middle' fill='var(--text-light)' style='font-family:Inter,sans-serif;font-size:11px'>(ECG, Pulse, Temp)</text><rect x='520' y='200' width='180' height='60' rx='10' fill='var(--box-bg)' stroke='var(--primary)' stroke-width='1'/><text x='610' y='225' text-anchor='middle' fill='var(--text-dark)' style='font-family:Inter,sans-serif;font-size:12px'>Urine Analysis</text><text x='610' y='245' text-anchor='middle' fill='var(--text-light)' style='font-family:Inter,sans-serif;font-size:11px'>(pH, TDS, Color, Turbidity)</text><rect x='300' y='300' width='200' height='50' rx='10' fill='var(--primary)'/><text x='400' y='330' text-anchor='middle' fill='var(--white)' style='font-family:Inter,sans-serif;font-weight:bold;font-size:14px'>Data Processing (ML)</text><rect x='100' y='400' width='150' height='50' rx='10' fill='#4CAF50'/><text x='175' y='430' text-anchor='middle' fill='var(--white)' style='font-family:Inter,sans-serif;font-size:12px;font-weight:bold'>Normal: Record</text><rect x='325' y='400' width='150' height='50' rx='10' fill='#FFA500'/><text x='400' y='430' text-anchor='middle' fill='var(--white)' style='font-family:Inter,sans-serif;font-size:12px;font-weight:bold'>Moderate: Alert</text><rect x='550' y='400' width='150' height='50' rx='10' fill='#f44336'/><text x='625' y='430' text-anchor='middle' fill='var(--white)' style='font-family:Inter,sans-serif;font-size:12px;font-weight:bold'>Critical: Support</text></svg></div>"""

for page in data.get('customPages', []):
    if page.get('id') == 'page_1777795841217':
        # Replace the html block with the new svg flowchart
        for block in page.get('blocks', []):
            if block['type'] == 'html':
                block['content'] = svg_flowchart
        
        # Regenerate content
        html = ""
        for block in page.get('blocks', []):
            html += '<div class="custom-block-wrapper" style="margin-bottom: 20px;">\n'
            
            if block['type'] == 'header':
                html += f'<h2 style="color:var(--text-dark); margin:0; margin-bottom:10px;">{block["text"]}</h2>\n'
            elif block['type'] == 'text':
                html += f'<p style="color:var(--text-light); line-height:1.6;">{block["text"]}</p>\n'
            elif block['type'] == 'html':
                html += block.get('content', block.get('text', '')) + '\n'
            elif block['type'] == 'infocards':
                cols = int(block.get('columns', '1'))
                width = '100%' if cols == 1 else f'calc({100/cols}% - 20px)'
                html += '<div style="display:flex; flex-wrap:wrap; gap:30px; justify-content:center;">\n'
                for card in block.get('cards', []):
                    color = block.get('color', '#df68ab')
                    html += f'<div style="width:{width}; min-width:250px; background:var(--box-bg); border-radius:8px; padding:20px; box-shadow:var(--shadow); border-top: 4px solid {color}">'
                    if card.get('badge'):
                        html += f'<div style="background:{color}; color:white; padding:5px 10px; border-radius:15px; display:inline-block; font-weight:bold; margin-bottom:10px;">{card["badge"]}</div>'
                    if card.get('title'):
                        html += f'<h3 style="margin-bottom:10px; color:var(--text-dark);">{card["title"]}</h3>'
                    if card.get('text'):
                        html += f'<p style="color:var(--text-light); line-height:1.5;">{card["text"].replace(chr(10), "<br>")}</p>'
                    html += '</div>\n'
                html += '</div>\n'
            
            html += '</div>\n'
        
        page['content'] = html

# write back to js
new_js = "const websiteData = " + json.dumps(data, indent=4) + ";"
with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(new_js)
print("SUCCESS!")
