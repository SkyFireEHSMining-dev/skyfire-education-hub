"""UI smoke test. Uses a synthetic browser document because this execution
sandbox blocks all browser URL navigation, including localhost. Normal hosting
still uses the original ES module files without this test-only combination.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SCREENSHOTS=ROOT/'tests'/'screenshots'
SCREENSHOTS.mkdir(parents=True,exist_ok=True)
parts=[]
for path in ('src/seed.js','src/learning.js','src/store.js','src/learning-ui.js','src/app.js'):
    txt=(ROOT/path).read_text()
    txt=re.sub(r'^import \{[^}]+\} from [^;]+;\n','',txt,flags=re.M)
    txt=re.sub(r'\bexport (const|function|async function|let|class)\b',r'\1',txt)
    parts.append(txt)
bundle='\n'.join(parts)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
    errors=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_content('<!doctype html><html><head></head><body><div id="app"></div></body></html>')
    page.add_style_tag(content=(ROOT/'src/styles.css').read_text())
    # Mock browser storage; about:blank disallows ordinary localStorage in this sandbox.
    page.add_script_tag(content="""const demoStorage={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return demoStorage[k]||null},setItem(k,v){demoStorage[k]=v},removeItem(k){delete demoStorage[k]}}});""")
    page.add_script_tag(content=bundle)
    assert page.get_by_role('heading',name='SkyFire Education').count()==1
    page.screenshot(path=str(SCREENSHOTS/'home.png'),full_page=True)
    page.get_by_role('button',name='Open Powered Haulage Safety').first.click()
    assert page.get_by_role('heading',name='Powered Haulage Safety').count()==1
    page.get_by_role('button',name='Mark lesson reviewed').first.click()
    page.get_by_role('button',name='Next →').click()
    page.get_by_role('button',name='Mark lesson reviewed').click()
    page.get_by_role('button',name='Next →').click()
    page.locator('input[name="scenario-answer"][value="1"]').check()
    page.get_by_role('button',name='Submit decision').click()
    page.get_by_role('button',name='Next →').click()
    for idx,ans in enumerate([0,1,2,1]):
        page.locator(f'input[name="q{idx}"][value="{ans}"]').check()
    page.get_by_role('button',name='Score knowledge check').click()
    assert page.get_by_text('Score: 100%',exact=False).count()==1
    page.get_by_role('button',name='Training Matrix').first.click()
    assert page.get_by_role('heading',name='Training Matrix').count()==1
    assert page.locator('table tbody tr').count()==30
    page.get_by_role('button',name='Instructor Studio').first.click()
    page.get_by_role('button',name='Present this course').click()
    assert page.get_by_role('dialog',name='Instructor presentation').count()==1
    page.get_by_role('button',name='Next slide →').click()
    page.get_by_role('button',name='Close ✕').click()
    for check in page.locator('form[data-form="evaluation"] input[type="checkbox"]').all():check.check()
    page.get_by_role('button',name='Record fictional evaluation').click()
    page.get_by_role('button',name='Training Records').first.click()
    assert page.get_by_text('Practical evaluation: Powered Haulage Safety').count()>0
    page.screenshot(path=str(SCREENSHOTS/'records.png'),full_page=True)
    page.get_by_role('button',name='Instructor Studio').first.click()
    page.locator('#newTitle').fill('Custom Hazard Awareness')
    page.locator('#newCourseSummary').fill('A custom demonstration course created during testing.')
    page.get_by_role('button',name='Create demo course').click()
    assert page.locator('#studioCourseSelect').input_value().startswith('course-')
    page.locator('#lessonTitle').fill('A practical scenario')
    page.locator('#lessonText').fill('Stop, assess, and confirm the controls.')
    page.get_by_role('button',name='Add lesson to course').click()
    page.get_by_role('button',name='Open learner course').click()
    assert page.get_by_role('heading',name='A practical scenario').count()==1
    # Simulated mobile viewport and layout check
    page.set_viewport_size({'width':390,'height':844})
    page.locator('[data-action="v02-toggle-nav"]').click();page.get_by_role('button',name='Dashboard').first.click()
    assert page.evaluate('document.documentElement.scrollWidth') <= 390, 'Mobile document must not overflow horizontally';page.screenshot(path=str(SCREENSHOTS/'mobile.png'),full_page=True)
    assert page.locator('.nav-list').count()==1
    assert not errors,repr(errors)
    browser.close()
print('PASS: app startup, lesson progression, scenario, quiz, matrix, presenter, evaluation, records, course authoring and mobile display')