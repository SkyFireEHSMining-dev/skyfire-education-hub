"""Generate one-file demo for direct browser opening; no external JS libraries."""
from pathlib import Path
from urllib.parse import quote
import re
ROOT=Path(__file__).resolve().parent
css=(ROOT/'src/styles.css').read_text()
parts=[]
for path in ('src/seed.js','src/store.js','src/app.js'):
    text=(ROOT/path).read_text()
    text=re.sub(r'^import \{[^}]+\} from [^;]+;\n','',text,flags=re.M)
    text=re.sub(r'\bexport (const|function|async function|let|class)\b',r'\1',text)
    parts.append(text)
bundle='\n'.join(parts)
svg=(ROOT/'assets/skyfire-mark.svg').read_text()
# Self-contained local branding when opened without a network.
svgdata='data:image/svg+xml,'+quote(svg,safe='')
bundle=bundle.replace('https://raw.githubusercontent.com/SkyFireEHSMining-dev/skyfire-safety-library/main/Icons/icon-192.png',svgdata)
# Embed app without source maps; this artifact is compiled demo output, not the source of truth.
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SkyFire Education Hub v0.1 — Standalone Demo</title><meta name="theme-color" content="#f8fbfe"/>
<style>'''+css+'''</style></head><body><a href="#content" class="skip-link">Skip to main content</a><div id="app"></div><script>'''+bundle+'''</script></body></html>'''
(ROOT/'demo-standalone.html').write_text(html)
Path('/mnt/data/SkyFire_Education_Demo.html').write_text(html)
print('Standalone demo created',len(html),'bytes')
