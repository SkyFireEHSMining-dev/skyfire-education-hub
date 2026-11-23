"""Build a standalone fictional-data demonstration with all code and artwork embedded."""
from pathlib import Path
import base64
import re
ROOT=Path(__file__).resolve().parent
css=(ROOT/'src/styles.css').read_text()
parts=[]
for path in ('src/seed.js','src/learning.js','src/store.js','src/learning-ui.js','src/app.js'):
    text=(ROOT/path).read_text()
    text=re.sub(r'^import \{[^}]+\} from [^;]+;\n','',text,flags=re.M)
    text=re.sub(r'\bexport (const|function|async function|let|class)\b',r'\1',text)
    parts.append(text)
bundle='\n'.join(parts)
logo_data='data:image/jpeg;base64,'+base64.b64encode((ROOT/'assets/skyfire-logo-192.jpg').read_bytes()).decode('ascii')
bundle=bundle.replace('src="assets/skyfire-logo-192.jpg"','src="'+logo_data+'"')
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SkyFire Education Hub v0.2 — Standalone Demo</title><meta name="theme-color" content="#f8fbfe"/>
<link rel="icon" type="image/jpeg" href="'''+logo_data+'''"/><style>'''+css+'''</style></head><body><a href="#content" class="skip-link">Skip to main content</a><div id="app"></div><script>'''+bundle+'''</script></body></html>'''
(ROOT/'demo-standalone.html').write_text(html)
Path('/mnt/data/SkyFire_Education_Demo_v0.2.html').write_text(html)
print('Standalone demo created',len(html),'characters')