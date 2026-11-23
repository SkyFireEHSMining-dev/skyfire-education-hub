"""SkyFire v0.2 browser UI tests. All data is fictional and local."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).parents[1]
SCREEN=ROOT/'tests'/'screenshots'; SCREEN.mkdir(exist_ok=True)

def launch(page):
    html=(ROOT/'demo-standalone.html').read_text()
    page.set_content(html,wait_until='domcontentloaded')
    assert page.locator('h1.brand-title').inner_text()=='SkyFire Education'

def nav(page,view):
    target=page.locator(f'[data-action="navigate"][data-view="{view}"]').first
    if not target.is_visible():
        page.locator('[data-action="v02-toggle-nav"]').click()
    target.click()

def act(page,name):
    page.locator(f'[data-action="{name}"]').first.click()

def no_overflow(page,label):
    a=page.evaluate('document.documentElement.scrollWidth'); b=page.evaluate('window.innerWidth');assert a<=b, f'{label}: overflow {a}>{b}'

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    # Same-origin browser storage works under a local HTTP server; set_content uses about:blank.
    launch(page)
    page.locator('#roleSelect').select_option('learner')
    assert 'My Learning' in page.locator('h1.page-title').inner_text()
    assert 'Assigned Learning' in page.locator('.learning-section-nav').inner_text()
    assert page.locator('.v02-assignment').count()>=3
    assert page.get_by_text('Due Soon',exact=True).count()>0
    assert page.get_by_text('Upcoming',exact=True).count()>0
    assert page.locator('.v02-assignment .badge.green').count()==0, 'Active assignment must not be marked completed'
    no_overflow(page,'assigned learner')
    page.screenshot(path=str(SCREEN/'v02-mobile-assigned.png'),full_page=True)
    page.locator('[data-action="v02-assignment-view"][data-view="compact"]').click()
    assert page.locator('.v02-compact').count()==1
    page.locator('[data-action="v02-assigned-tab"][data-tab="completed"]').click()
    assert page.get_by_text('2 completions',exact=False).count()>0
    act(page,'v02-history-toggle')
    assert page.get_by_text('Previously Mastered',exact=True).count()>0
    no_overflow(page,'completed history')
    page.locator('[data-action="v02-learning-section"][data-section="personal"]').click()
    assert 'Personal Learning' in page.locator('main').inner_text()
    assert 'Saved for Later' in page.locator('main').inner_text()
    no_overflow(page,'personal learning')
    page.locator('[data-action="v02-open-library"]').click()
    assert page.locator('.v02-mini-card').count()>=7
    page.locator('[data-action="v02-save"][data-course="leading-listening"]').click()
    assert page.get_by_text('Saved for Later',exact=True).count()>0
    page.locator('[data-action="v02-enroll"][data-course="advanced-supervision"]').count()==0
    assert page.get_by_text('Prerequisite required:',exact=False).count()>0
    page.locator('[data-action="v02-enroll"][data-course="leading-listening"]').click()
    nav(page,'my')
    page.locator('[data-action="v02-learning-section"][data-section="personal"]').click()
    assert 'Leading Through Listening' in page.locator('main').inner_text()
    page.locator('[data-action="v02-personal-tab"][data-tab="saved"]').click()
    assert 'Leading Through Listening' not in page.locator('main').inner_text()
    nav(page,'catalog')
    page.locator('[data-action="v02-library-tab"][data-tab="pathways"]').click()
    assert page.get_by_text('Future Mine Supervisor',exact=True).count()>0
    page.locator('[data-action="v02-save-pathway"][data-pathway="future-supervisor"]').click()
    nav(page,'my')
    page.locator('[data-action="v02-learning-section"][data-section="pathway"]').click()
    assert page.get_by_text('Future Mine Supervisor',exact=True).count()>0
    assert page.get_by_text('Locked',exact=True).count()>0
    assert page.locator('form[data-form="v02-add-course-to-pathway"]').count()>=1
    no_overflow(page,'pathway')
    page.screenshot(path=str(SCREEN/'v02-mobile-pathway.png'),full_page=True)
    # soft-limit warning: 4 voluntary courses already active, add fifth.
    page.evaluate('''() => {save(s => {s.enrollments=s.enrollments.filter(e=>e.learnerId!=="W-001");for(const cid of ["leading-listening","inspection-ready","emergency-tabletop","professionalism"])s.enrollments.push({learnerId:"W-001",courseId:cid,enrolledAt:new Date().toISOString()});})}''')
    nav(page,'catalog')
    page.locator('[data-action="v02-library-tab"][data-tab="courses"]').click()
    # Add a demo course with no prerequisite and click enroll.
    page.evaluate('''() => save(s=>s.courses.push({id:"sample-micro",name:"Extra Learning",academy:"Professional Development",audience:"Elective",scope:"all",duration:"10 min",status:"Demo",required:false,summary:"Extra course for checking soft limits.",objectives:[],lessons:[{id:"sample-read",title:"Read",type:"read",minutes:2,content:"Read this."}],checklist:[],instructorNotes:""}))''')
    page.locator('[data-action="v02-enroll"][data-course="sample-micro"]').click()
    assert page.get_by_role('dialog',name='Confirm voluntary enrollment').count()==1
    page.locator('[data-action="v02-save-pending"]').click()
    assert page.get_by_role('dialog',name='Confirm voluntary enrollment').count()==0
    page.locator('[data-action="v02-enroll"][data-course="sample-micro"]').click()
    page.locator('[data-action="v02-confirm-enroll"]').click()
    nav(page,'my')
    page.locator('[data-action="v02-learning-section"][data-section="personal"]').click()
    assert '5 / 10' in page.locator('main').inner_text()
    # Verify hard cap at exactly 10 voluntary courses.
    page.evaluate('''() => {save(s=>{for(let i=0;i<9;i++){const id="extra-"+i;s.courses.push({id,name:"Elective "+i,academy:"Professional Development",scope:"all",audience:"Open elective",duration:"5 min",status:"Demo",required:false,summary:"Fictional course",lessons:[{id:id+"-read",title:"Read",type:"read",minutes:5,content:"Read."}]});if(i<5)s.enrollments.push({learnerId:"W-001",courseId:id,enrolledAt:new Date().toISOString()});}})}''')
    nav(page,'catalog')
    page.locator('[data-action="v02-enroll"][data-course="extra-5"]').click()
    assert 'Enrollment limit:' in page.locator('.toast').inner_text()
    assert page.get_by_role('dialog',name='Confirm voluntary enrollment').count()==0
    page.locator('#roleSelect').select_option('instructor')
    act(page,'navigate') if False else None
    nav(page,'studio')
    assert page.get_by_text('Learning Pathway Builder',exact=True).count()>0
    page.locator('form[data-form="v02-create-pathway"] input[name="title"]').fill('My New Pathway')
    page.locator('form[data-form="v02-create-pathway"] textarea[name="description"]').fill('Instructor created example')
    page.locator('form[data-form="v02-create-pathway"] input[name="courseIds"]').first.check()
    page.get_by_role('button',name='Create pathway').click()
    assert page.locator('#v02StudioPathwaySelect').input_value().startswith('path-')
    no_overflow(page,'instructor studio')
    page.set_viewport_size({'width':1365,'height':850})
    nav(page,'my')
    no_overflow(page,'desktop learner')
    page.screenshot(path=str(SCREEN/'v02-desktop-learning.png'),full_page=True)
    assert not errors,repr(errors)
    browser.close()
print('PASS: v0.2 learner tabs, statuses/history, saved courses, pathways, prerequisite lock, soft/hard caps, instructor authoring and responsive layouts')