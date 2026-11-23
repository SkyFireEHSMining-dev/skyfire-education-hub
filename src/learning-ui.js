import {ACADEMIES,SITES} from './seed.js';
import {getState,save,courseCompletion,progressFor,assigned} from './store.js';
import {learnerSaved,learnerEnrolled,learnerPlans,activeVoluntaryCount,enrollmentCheck,enrollOne,assignmentInfo,completedGroups,courseHasCompletion,coursePrerequisites,pathwayCourses,addPathway,DEFAULT_LIMITS} from './learning.js';

const sfDate = value => value?new Date(`${String(value).slice(0,10)}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'No deadline';
const sfCount = (num,word)=>`${num} ${word}${num===1?'':'s'}`;
const sfA11y = (name,value)=>`<label class="filter-select">${name}<select ${value}</select></label>`;
const sfFake = '<p class="small muted">Fictional demonstration data — not a regulatory training certificate or equipment authorization.</p>';

export function renderMyLearningV02(ui,T){
 const {esc,badge,intro,button,worker,progressBar}=T,s=getState(),who=worker(ui.learnerId),plans=learnerPlans(s,ui.learnerId);
 const count=s.assignments.filter(a=>a.learnerId===ui.learnerId).length;
 const nav=[['assigned','Assigned Learning','clipboard'],['personal','Personal Learning','book'],['pathway','My Pathway','route'],['achievements','My Achievements','star'],['explore','Explore Learning','search']];
 const navMarkup=`<div class="learning-section-nav" role="tablist" aria-label="My Learning sections">${nav.map(([k,n])=>`<button role="tab" aria-selected="${ui.learningSection===k}" class="learning-nav-btn ${ui.learningSection===k?'selected':''}" data-action="v02-learning-section" data-section="${k}">${esc(n)}</button>`).join('')}</div>`;
 const selector=ui.role==='learner'?'':`<label class="filter-select demo-person-switcher">Fictional learner<select id="myLearnerSelect">${s.learners.slice(0,75).map(p=>`<option value="${esc(p.id)}" ${p.id===ui.learnerId?'selected':''}>${esc(p.name)} (${esc(p.id)})</option>`).join('')}</select></label>`;
 let content='';
 if(ui.learningSection==='assigned')content=renderAssignedV02(ui,T);
 else if(ui.learningSection==='personal')content=renderPersonalV02(ui,T);
 else if(ui.learningSection==='pathway')content=renderMyPathwayV02(ui,T);
 else if(ui.learningSection==='achievements')content=renderAchievementsV02(ui,T);
 else content=`<section class="section"><h2>Explore Learning</h2><p>Find courses and instructor-designed learning pathways. Save ideas for later without enrolling.</p><div class="flex">${button('Explore courses','v02-open-library','data-library="courses"','btn primary')}${button('Explore pathways','v02-open-library','data-library="pathways"')}</div></section>`;
 return intro('My Learning',`Your learning, career development, and training progress · ${who?esc(who.name):'fictional learner'}`)+
 `<div class="notice v02-notice">This is a functional prototype. All training records and dates are fictional; course completion does not establish MSHA certification or equipment qualification.</div>`+
 `<div class="v02-learning-overview"><div><strong>${count}</strong><span>Required assignments</span></div><div><strong>${activeVoluntaryCount(s,ui.learnerId)}</strong><span>Active personal courses</span></div><div><strong>${plans.length}</strong><span>Saved pathways</span></div></div>`+
 selector+navMarkup+content;
}

function renderAssignedV02(ui,T){
 const {esc,badge,button,progressBar}=T,s=getState();
 let assignedList=s.assignments.filter(a=>a.learnerId===ui.learnerId).map(a=>({a,c:s.courses.find(c=>c.id===a.courseId)})).filter(x=>x.c).map(x=>({...x,info:assignmentInfo(s,x.a,x.c,ui.learnerId)}));
 const active=assignedList.filter(x=>x.info.status!=='Completed'),completed=completedGroups(s,ui.learnerId).map(g=>({...g,records:g.records.filter(r=>!r.source?.includes('Personal Learning'))})).filter(g=>g.records.length);
 const tabs=`<div class="v02-tab-bar" role="tablist" aria-label="Assigned Learning status"><button role="tab" aria-selected="${ui.assignedTab==='active'}" data-action="v02-assigned-tab" data-tab="active" class="${ui.assignedTab==='active'?'current':''}">Active Assignments <span>${active.length}</span></button><button role="tab" aria-selected="${ui.assignedTab==='completed'}" data-action="v02-assigned-tab" data-tab="completed" class="${ui.assignedTab==='completed'?'current':''}">Completed <span>${completed.length}</span></button></div>`;
 let main='';
 if(ui.assignedTab==='completed'){
   main=completed.length?`<div class="v02-stack">${completed.map(g=>{
     const expanded=ui.expandedHistory===g.courseId;
     return `<article class="v02-course-row v02-history"><button type="button" class="v02-history-toggle" data-action="v02-history-toggle" data-course="${esc(g.courseId)}" aria-expanded="${expanded}"><div><strong>${esc(g.course.name)}</strong><div class="v02-badges">${badge('Completed','green')}<span class="muted small">${sfCount(g.records.length,'completion')}</span></div></div><span aria-hidden="true">${expanded?'▴':'▾'}</span></button>${expanded?`<div class="v02-history-detail"><h3>Full completion history</h3>${g.records.map(r=>`<div class="v02-timeline-entry"><div><strong>${sfDate(r.completedAt)}</strong><p class="muted small">${esc(r.source||'External training')}</p></div>${r.mastered?badge('Previously Mastered','purple'):badge('Completed','green')}</div>`).join('')}<p class="small muted">Previous completion does not replace a current recurring assignment or legal training requirement.</p></div>`:''}</article>`;}).join('')}</div>`:'<p class="empty">No completed assignment history for this fictional learner.</p>';
 } else {
   if(ui.assignmentFilter!=='all')assignedList=active.filter(x=>x.info.status===ui.assignmentFilter); else assignedList=active;
   if(ui.assignmentSort==='due')assignedList.sort((x,y)=>(x.info.daysUntil??Infinity)-(y.info.daysUntil??Infinity));
   else if(ui.assignmentSort==='name')assignedList.sort((x,y)=>x.c.name.localeCompare(y.c.name));
   else if(ui.assignmentSort==='progress')assignedList.sort((x,y)=>(y.info.complete.total?y.info.complete.done/y.info.complete.total:0)-(x.info.complete.total?x.info.complete.done/x.info.complete.total:0));
   else assignedList.sort((x,y)=>x.info.priority-y.info.priority || (x.info.daysUntil??Infinity)-(y.info.daysUntil??Infinity));
   const filter=`<div class="v02-controls"><label>Sort<select id="v02AssignmentSort"><option value="urgency" ${ui.assignmentSort==='urgency'?'selected':''}>Urgency (default)</option><option value="due" ${ui.assignmentSort==='due'?'selected':''}>Due date</option><option value="name" ${ui.assignmentSort==='name'?'selected':''}>Course name</option><option value="progress" ${ui.assignmentSort==='progress'?'selected':''}>Progress</option></select></label><label>Filter<select id="v02AssignmentFilter"><option value="all">All active</option>${['Due Soon','Overdue','Upcoming','In Progress','Reassessment Required','Pending Review','Assigned'].map(t=>`<option value="${t}" ${ui.assignmentFilter===t?'selected':''}>${t}</option>`).join('')}</select></label><div class="v02-view-toggle" aria-label="Assignment display"><button class="${ui.assignmentView==='cards'?'selected':''}" data-action="v02-assignment-view" data-view="cards" aria-pressed="${ui.assignmentView==='cards'}">▦ Cards</button><button class="${ui.assignmentView==='compact'?'selected':''}" data-action="v02-assignment-view" data-view="compact" aria-pressed="${ui.assignmentView==='compact'}">☰ Compact</button></div></div>`;
   main=filter+(assignedList.length?`<div class="v02-stack ${ui.assignmentView==='compact'?'v02-compact':''}">${assignedList.map(({a,c,info})=>{
     const prior=s.completedHistory.filter(r=>r.learnerId===ui.learnerId&&r.courseId===c.id).length,closed=info.opensIn!==null&&info.opensIn>0;
     return `<article class="v02-assignment ${ui.assignmentView==='compact'?'v02-assignment-compact':''}"><div class="v02-assignment-title"><h3>${esc(c.name)}</h3><span class="small muted">${esc(c.academy)}</span></div><div class="v02-current-row"><div>${badge(info.status,info.kind)}<p class="small muted">${info.status==='Due Soon'||info.status==='Overdue'?'Current training cycle':info.status==='Upcoming'?'Opens '+sfDate(a.availableFrom):'Instructor-assigned training'}</p></div>${info.daysUntil!==null?`<div class="v02-due"><strong>${sfDate(a.dueAt)}</strong><span class="small muted">${info.daysUntil<0?`${Math.abs(info.daysUntil)} days overdue`:info.daysUntil===0?'Due today':`${info.daysUntil} days remaining`}</span></div>`:''}</div>${ui.assignmentView==='cards'?progressBar(info.complete.done,info.complete.total):''}<div class="v02-assignment-actions">${closed?`<span class="small muted">Available in ${info.opensIn} days</span>`:button(info.complete.done>0?'Resume Course':'Start Course','open-course',`data-course="${esc(c.id)}"`,'btn primary small')}${a.recurring?`<span class="muted small">↻ Recurring</span>`:''}${prior?`<span class="muted small">${prior} prior ${prior===1?'completion':'completions'}</span>`:''}</div></article>`;}).join('')}</div>`:`<p class="empty">No assignments match this filter.</p>`);
 }
 return `<section class="section"><h2>Assigned Learning</h2><p class="muted small">Instructor-assigned training, separate from courses you choose yourself.</p>${tabs}${main}</section>`;
}

function renderPersonalV02(ui,T){
 const {esc,badge,button,progressBar}=T,s=getState(),learnerId=ui.learnerId;
 const enrolled=learnerEnrolled(s,learnerId),saved=learnerSaved(s,learnerId),completed=enrolled.filter(cid=>{const c=s.courses.find(x=>x.id===cid);return c&&courseCompletion(c,learnerId).ready;});
 const options=[['enrolled','My Enrollments'],['saved','Saved for Later'],['completed','Completed']];
 const tabs=`<div class="v02-tab-bar" role="tablist" aria-label="Personal Learning categories">${options.map(([v,n])=>`<button class="${ui.personalTab===v?'current':''}" role="tab" aria-selected="${ui.personalTab===v}" data-action="v02-personal-tab" data-tab="${v}">${n} <span>${v==='enrolled'?enrolled.filter(x=>!completed.includes(x)).length:v==='saved'?saved.length:completed.length}</span></button>`).join('')}</div>`;
 const active=enrolled.filter(x=>!completed.includes(x)); const list=(ui.personalTab==='enrolled'?active:ui.personalTab==='saved'?saved:completed).map(cid=>s.courses.find(x=>x.id===cid)).filter(Boolean);
 const head=`<div class="v02-personal-head"><div><strong>${active.length} / ${s.trainingLimits.hard}</strong><span class="small muted"> active voluntary enrollments</span></div><span class="small muted">Suggested maximum: ${s.trainingLimits.soft}</span></div>`;
 const body=list.length?`<div class="v02-card-grid">${list.map(c=>{
 const p=courseCompletion(c,learnerId),isSaved=ui.personalTab==='saved';
 return `<article class="v02-mini-card"><div class="v02-badges">${badge(c.academy)}${ui.personalTab==='completed'?badge('Completed','green'):''}</div><h3>${esc(c.name)}</h3><p>${esc(c.summary)}</p>${!isSaved?progressBar(p.done,p.total):''}<div class="flex">${button(ui.personalTab==='completed'?'Review Course':p.done?'Resume Course':'Open Course','open-course',`data-course="${esc(c.id)}"`,'btn primary small')}${isSaved?button('Enroll','v02-enroll',`data-course="${esc(c.id)}"`,'btn small'):''}${button(isSaved?'Remove saved':'Withdraw','v02-'+(isSaved?'unsave':'withdraw'),`data-course="${esc(c.id)}"`,'btn small')}</div></article>`;
 }).join('')}</div>`:'<p class="empty">Nothing here yet. Explore the library to find learning opportunities.</p>';
 return `<section class="section"><div class="spread"><h2>Personal Learning</h2>${button('Explore Library','v02-open-library','data-library="courses"','btn small')}</div><p class="muted small">Courses you choose. Saving does not create an assignment or deadline.</p>${head}${tabs}${body}</section>`;
}

function renderMyPathwayV02(ui,T){
 const {esc,badge,button,progressBar}=T,s=getState(),plans=learnerPlans(s,ui.learnerId);
 return `<section class="section"><div class="spread"><h2>My Pathway</h2>${button('Explore Pathways','v02-open-library','data-library="pathways"','btn primary small')}</div><p class="muted small">Save an instructor-created pathway to plan your development. Saving does not enroll you in its courses.</p>${!plans.length?'<p class="empty">No pathways saved. Explore the instructor-designed pathways to begin.</p>':plans.map(plan=>{
    const path=s.pathways.find(x=>x.id===plan.pathwayId);if(!path)return '';
    const cs=pathwayCourses(s,path.id,ui.learnerId),done=cs.filter(c=>courseHasCompletion(s,c.id,ui.learnerId)).length;
    return `<article class="v02-pathway-panel"><div class="spread"><div><h3>${esc(path.title)}</h3><p class="muted small">${esc(path.description)}</p></div>${badge(`${done} / ${cs.length} completed`,'purple')}</div>${progressBar(done,cs.length)}<div class="v02-pathway-steps">${cs.map((c,i)=>{
      const check=enrollmentCheck(s,c.id,ui.learnerId,path.id);const complete=courseHasCompletion(s,c.id,ui.learnerId);const enrolled=learnerEnrolled(s,ui.learnerId).includes(c.id),isAssigned=assigned(c.id,ui.learnerId),blocked=!check.ok&&!enrolled&&!isAssigned&&!complete;
      return `<div class="v02-pathway-step"><span class="v02-step-num">${i+1}</span><div class="v02-step-info"><strong>${esc(c.name)}</strong><div class="v02-badges">${complete?badge('Completed','green'):enrolled?badge('Enrolled','purple'):isAssigned?badge('Assigned','orange'):blocked?badge('Locked','gray'):badge('Available','green')}</div>${blocked?`<p class="small muted">${esc(check.reason)}</p>`:''}</div><div class="v02-step-actions">${!blocked&&!complete&&!enrolled&&!isAssigned?button('Enroll','v02-enroll',`data-course="${esc(c.id)}" data-pathway="${esc(path.id)}"`,'btn small'):button('View','open-course',`data-course="${esc(c.id)}"`,'btn small')}</div></div>`;
    }).join('')}</div><div class="flex" style="margin-top:13px">${button('Enroll in eligible courses','v02-enroll-eligible',`data-pathway="${esc(path.id)}"`,'btn primary small')}${button('Remove pathway','v02-remove-pathway',`data-pathway="${esc(path.id)}"`,'btn small')}</div><form data-form="v02-add-course-to-pathway" class="v02-inline-form"><input type="hidden" name="pathwayId" value="${esc(path.id)}"><label>Add a personal course <select name="courseId" required><option value="">Choose a course…</option>${s.courses.filter(c=>!cs.some(x=>x.id===c.id)).map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label><button class="btn small" type="submit">Add to pathway</button></form></article>`;
  }).join('')}</section>`;
}

function renderAchievementsV02(ui,T){const {esc,badge,button}=T,s=getState(),groups=completedGroups(s,ui.learnerId);
 const count=groups.reduce((n,g)=>n+g.records.length,0);return `<section class="section"><h2>My Achievements</h2><div class="v02-learning-overview"><div><strong>${groups.length}</strong><span>Courses completed</span></div><div><strong>${count}</strong><span>Training completions</span></div><div><strong>${groups.reduce((n,g)=>n+g.records.filter(x=>x.mastered).length,0)}</strong><span>Mastery examples</span></div></div><p class="muted small">This is a fictional summary. Official certification, external credentials, skill verification, mentoring, and the encrypted Portfolio Vault are future features—not available in v0.2.</p><div class="v02-stack">${groups.length?groups.map(g=>`<div class="v02-course-row"><strong>${esc(g.course.name)}</strong><div class="v02-badges">${badge('Completed','green')}<span class="small muted">${sfCount(g.records.length,'completion')}</span></div></div>`).join(''):'<p class="empty">No completed courses yet.</p>'}</div></section>`;
}

export function renderCatalogV02(ui,T){
 const {esc,badge,intro,button}=T,s=getState();
 let body='';
 if(ui.librarySection==='pathways'){
   const filtered=s.pathways.filter(p=>p.published && (ui.category==='all'||p.academy===ui.category) && `${p.title} ${p.description}`.toLowerCase().includes(ui.search.toLowerCase()));
   body=`<div class="v02-card-grid">${filtered.map(p=>{const saved=learnerPlans(s,ui.learnerId).some(plan=>plan.pathwayId===p.id);return `<article class="v02-mini-card"><div>${badge(p.academy,'purple')}</div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><p class="small muted">${sfCount(p.courseIds.length,'course')} · Instructor-designed</p><div class="flex">${button('View pathway','v02-view-pathway',`data-pathway="${esc(p.id)}"`,'btn primary small')}${button(saved?'Saved to My Pathway':'Save pathway',saved?'v02-remove-pathway':'v02-save-pathway',`data-pathway="${esc(p.id)}"`,'btn small')}</div></article>`;}).join('')}</div>`;
 } else {
   const filtered=s.courses.filter(c=>(ui.site==='all'||c.scope==='all'||c.scope===ui.site)&&(ui.category==='all'||c.academy===ui.category)&&`${c.name} ${c.summary} ${c.academy}`.toLowerCase().includes(ui.search.toLowerCase()));
   body=`<div class="v02-card-grid">${filtered.map(c=>renderLibraryCourseV02(c,ui,T)).join('')}</div>`;
 }
 return intro('Course Library','Explore courses or choose instructor-designed learning pathways.')+`<section class="section"><div class="v02-tab-bar" role="tablist" aria-label="Library content"><button class="${ui.librarySection==='courses'?'current':''}" role="tab" aria-selected="${ui.librarySection==='courses'}" data-action="v02-library-tab" data-tab="courses">Courses</button><button class="${ui.librarySection==='pathways'?'current':''}" role="tab" aria-selected="${ui.librarySection==='pathways'}" data-action="v02-library-tab" data-tab="pathways">Learning Pathways</button></div><div class="filter-row"><input aria-label="Search the learning library" id="courseSearch" value="${esc(ui.search)}" placeholder="Search courses or pathways…"><select id="categorySelect" aria-label="Filter by academy"><option value="all">All academies</option>${ACADEMIES.map(a=>`<option value="${esc(a)}" ${ui.category===a?'selected':''}>${esc(a)}</option>`).join('')}</select></div>${body||'<p class="empty">No learning matches this search.</p>'}</section>`;
}

function renderLibraryCourseV02(c,ui,T){const {esc,badge,button}=T,s=getState(),id=ui.learnerId,check=enrollmentCheck(s,c.id,id),enrolled=learnerEnrolled(s,id).includes(c.id),saved=learnerSaved(s,id).includes(c.id),assignedNow=assigned(c.id,id),complete=courseHasCompletion(s,c.id,id),locked=!check.ok&&!enrolled&&!assignedNow&&!complete;
 const requirements=coursePrerequisites(s,c,id);
 return `<article class="v02-mini-card"><div class="v02-badges">${badge(c.academy)}${c.scope!=='all'?badge(SITES.find(x=>x.id===c.scope)?.name||c.scope,'purple'):''}</div><h3>${esc(c.name)}</h3><p>${esc(c.summary)}</p><p class="small muted">${esc(c.duration)} · ${esc(c.audience)}</p>${requirements.length?`<div class="v02-requirements">${requirements.map(p=>`<p class="small">${p.type==='required'?'Required':'Recommended'} prerequisite: ${esc(p.course?.name||p.courseId)} ${p.met?'✓':'• Not completed'}</p>`).join('')}</div>`:''}<div class="v02-badges">${complete?badge('Completed','green'):enrolled?badge('Enrolled','purple'):assignedNow?badge('Assigned','orange'):locked?badge('Locked','gray'):badge('Available','green')}${saved?badge('Saved for Later','gray'):''}</div>${locked&&!complete&&!assignedNow?`<p class="small muted">${esc(check.reason)}</p>`:''}<div class="flex">${button('Preview Course','open-course',`data-course="${esc(c.id)}"`,'btn small')}${!assignedNow&&!enrolled&&!complete&&!locked?button('Enroll','v02-enroll',`data-course="${esc(c.id)}"`,'btn primary small'):''}${!saved&&!enrolled&&!assignedNow&&!complete?button('Save for Later','v02-save',`data-course="${esc(c.id)}"`,'btn small'):saved?button('Unsave','v02-unsave',`data-course="${esc(c.id)}"`,'btn small'):''}</div></article>`;
}

export function renderPathwaysV02(ui,T){const {esc,badge,button,intro}=T,s=getState(),p=s.pathways.find(p=>p.id===ui.pathwayId)||s.pathways[0];if(!p)return intro('Learning Pathways','No pathways available');
 const saved=learnerPlans(s,ui.learnerId).some(x=>x.pathwayId===p.id),cs=pathwayCourses(s,p.id,ui.learnerId);
 return intro('Learning Pathways','Combine existing courses into learning goals. Courses may be completed in parallel unless prerequisites require otherwise.')+`<section class="section"><label class="filter-select">Choose a pathway<select id="v02PathwaySelect">${s.pathways.filter(x=>x.published).map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.title)}</option>`).join('')}</select></label><div class="spread"><div><h2>${esc(p.title)}</h2><p class="muted">${esc(p.description)}</p></div>${badge(p.academy,'purple')}</div><p class="small muted">${cs.length} courses · Saved pathways are plans, not enrollments.</p><div class="flex">${button(saved?'Saved to My Pathway':'Save to My Pathway',saved?'v02-remove-pathway':'v02-save-pathway',`data-pathway="${esc(p.id)}"`,'btn primary')}${button('My Pathway','v02-learning-section','data-section="pathway"')}</div><div class="v02-pathway-steps" style="margin-top:19px">${cs.map((c,i)=>{const check=enrollmentCheck(s,c.id,ui.learnerId,p.id),done=courseHasCompletion(s,c.id,ui.learnerId),enrolled=learnerEnrolled(s,ui.learnerId).includes(c.id),locked=!check.ok&&!enrolled&&!done&&!assigned(c.id,ui.learnerId);return `<div class="v02-pathway-step"><span class="v02-step-num">${i+1}</span><div class="v02-step-info"><strong>${esc(c.name)}</strong><div class="v02-badges">${done?badge('Completed','green'):enrolled?badge('Enrolled','purple'):locked?badge('Locked','gray'):badge('Available','green')}</div>${locked?`<p class="muted small">${esc(check.reason)}</p>`:''}</div>${button('Preview','open-course',`data-course="${esc(c.id)}"`,'btn small')}</div>`;}).join('')}</div></section>`;
}

export function renderPathwayStudioV02(ui,T){const {esc,button}=T,s=getState(),path=s.pathways.find(x=>x.id===ui.studioPathwayId)||s.pathways[0];
 return `<section class="section"><h2>Learning Pathway Builder</h2><p class="muted small">Instructor-designed pathways reuse courses without duplicating them. Prerequisite rules apply to the pathway; existing course-specific prerequisites still apply.</p><div class="two-col"><form data-form="v02-create-pathway" class="stack"><h3>Create pathway</h3><label class="form-field">Pathway name<input name="title" required maxlength="90" placeholder="e.g. Mine Supervisor Foundations"></label><label class="form-field">Description<textarea name="description" required maxlength="400" placeholder="What will learners achieve?"></textarea></label><label class="form-field">Academy<select name="academy">${ACADEMIES.map(a=>`<option>${esc(a)}</option>`).join('')}</select></label><fieldset class="v02-course-picker"><legend>Select existing courses</legend>${s.courses.map(c=>`<label><input type="checkbox" name="courseIds" value="${esc(c.id)}">${esc(c.name)}</label>`).join('')}</fieldset><button class="btn primary" type="submit">Create pathway</button></form><div class="stack"><h3>Edit pathway and prerequisites</h3><label class="form-field">Existing pathway<select id="v02StudioPathwaySelect">${s.pathways.map(p=>`<option value="${esc(p.id)}" ${p.id===path?.id?'selected':''}>${esc(p.title)}</option>`).join('')}</select></label>${path?`<form data-form="v02-edit-pathway" class="stack"><input type="hidden" name="pathwayId" value="${esc(path.id)}"><label class="form-field">Title<input name="title" required maxlength="90" value="${esc(path.title)}"></label><label class="form-field">Description<textarea name="description" maxlength="400">${esc(path.description)}</textarea></label><p class="small muted">Select a prerequisite for a course. Only earlier courses in this pathway can be prerequisites.</p>${path.courseIds.map((id,i)=>{const c=s.courses.find(x=>x.id===id);if(!c)return '';const prereq=path.requirements?.[id];return `<div class="v02-editor-step"><strong>${i+1}. ${esc(c.name)}</strong><label class="form-field">Prerequisite<select name="req:${esc(id)}"><option value="none">None</option>${path.courseIds.slice(0,i).map(pid=>{const p=s.courses.find(x=>x.id===pid);return `<option value="required:${esc(pid)}" ${prereq?.type==='required'&&prereq.courseId===pid?'selected':''}>Required: ${esc(p?.name||pid)}</option><option value="recommended:${esc(pid)}" ${prereq?.type==='recommended'&&prereq.courseId===pid?'selected':''}>Recommended: ${esc(p?.name||pid)}</option>`;}).join('')}</select></label><div class="flex">${button('↑','v02-path-move',`data-pathway="${esc(path.id)}" data-course="${esc(id)}" data-direction="up"`,'btn small')}${button('↓','v02-path-move',`data-pathway="${esc(path.id)}" data-course="${esc(id)}" data-direction="down"`,'btn small')}${button('Remove','v02-path-remove-course',`data-pathway="${esc(path.id)}" data-course="${esc(id)}"`,'btn small')}</div></div>`;}).join('')}<button class="btn primary" type="submit">Save pathway settings</button></form><form data-form="v02-studio-add-course" class="v02-inline-form"><input type="hidden" name="pathwayId" value="${esc(path.id)}"><label>Add existing course<select name="courseId" required><option value="">Choose course…</option>${s.courses.filter(c=>!path.courseIds.includes(c.id)).map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label><button type="submit" class="btn small">Add</button></form>`:''}</div></div></section>`;
}

export function renderLearningDialogV02(ui,T){const {esc,button}=T;if(!ui.pendingEnrollment?.length)return '';const n=ui.pendingEnrollment.length,s=getState(),active=activeVoluntaryCount(s,ui.learnerId);
 return `<div class="modal-overlay" role="presentation"><div class="modal v02-modal" role="dialog" aria-modal="true" aria-label="Confirm voluntary enrollment" tabindex="-1"><h2>Keep your learning manageable</h2><p>You already have <strong>${active} active voluntary courses</strong>. Enrolling in ${sfCount(n,'additional course')} will put you over the recommended ${s.trainingLimits.soft}-course limit.</p><p>You can save these courses for later or enroll anyway, up to the ${s.trainingLimits.hard}-course maximum.</p><div class="flex">${button('Save for Later','v02-save-pending','','btn')}${button('Enroll Anyway','v02-confirm-enroll','','btn primary')}${button('Cancel','v02-cancel-enroll','','btn')}</div></div></div>`;
}

export function onLearningClickV02(act,btn,ui,T){const {snack,render,navigate,selectCourse}=T,s=getState(),learn=ui.learnerId,courseId=btn.dataset.course, pathwayId=btn.dataset.pathway;
 const enter=(ids,fromPath=null)=>{const unique=[...new Set(ids)].filter(id=>enrollmentCheck(getState(),id,learn,fromPath).ok);if(!unique.length){snack('No eligible courses to enroll in. Check prerequisite or assignment status.');return;}
 const st=getState(),active=activeVoluntaryCount(st,learn),remaining=st.trainingLimits.hard-active;
 if(unique.length>remaining){snack(`Enrollment limit: ${remaining} slot(s) available before reaching ${st.trainingLimits.hard}.`);return;}
 if(active+unique.length>st.trainingLimits.soft){ui.pendingEnrollment=unique;ui.pendingPathway=fromPath;render();return;}
 save(s=>{for(const id of unique)enrollOne(s,id,learn,fromPath)});snack(`${sfCount(unique.length,'course')} enrolled in Personal Learning.`);
 };
 switch(act){
 case 'v02-toggle-nav':ui.mobileNavOpen=!ui.mobileNavOpen;render();return true;
 case 'v02-learning-section':ui.learningSection=btn.dataset.section;ui.view='my';render();return true;
 case 'v02-assigned-tab':ui.assignedTab=btn.dataset.tab;render();return true;
 case 'v02-personal-tab':ui.personalTab=btn.dataset.tab;ui.learningSection='personal';render();return true;
 case 'v02-history-toggle':ui.expandedHistory=ui.expandedHistory===courseId?null:courseId;render();return true;
 case 'v02-assignment-view':ui.assignmentView=btn.dataset.view;save(s=>{s.preferences[learn] ||= {};s.preferences[learn].assignmentView=ui.assignmentView;});return true;
 case 'v02-library-tab':ui.librarySection=btn.dataset.tab;render();return true;
 case 'v02-open-library':ui.librarySection=btn.dataset.library||'courses';navigate('catalog');return true;
 case 'v02-view-pathway':ui.pathwayId=pathwayId;navigate('pathways');return true;
 case 'v02-save':if(!s.savedCourses.some(x=>x.courseId===courseId&&x.learnerId===learn))save(s=>s.savedCourses.push({courseId,learnerId:learn,savedAt:new Date().toISOString()}));snack('Saved for Later. No enrollment or deadline created.');return true;
 case 'v02-unsave':save(s=>s.savedCourses=s.savedCourses.filter(x=>!(x.courseId===courseId&&x.learnerId===learn)));snack('Removed from Saved for Later.');return true;
 case 'v02-enroll':{const check=enrollmentCheck(s,courseId,learn,btn.dataset.pathway||null);if(!check.ok){snack(check.reason);return true;}enter([courseId],btn.dataset.pathway||null);return true;}
 case 'v02-save-pending':{const ids=ui.pendingEnrollment||[];save(s=>{for(const courseId of ids)if(!s.savedCourses.some(x=>x.learnerId===learn&&x.courseId===courseId))s.savedCourses.push({courseId,learnerId:learn,savedAt:new Date().toISOString()})});ui.pendingEnrollment=[];snack(`${sfCount(ids.length,'course')} saved for later.`);return true;}
 case 'v02-confirm-enroll':{const ids=ui.pendingEnrollment||[],path=ui.pendingPathway;ui.pendingEnrollment=[];ui.pendingPathway=null;const ok=[];save(s=>{for(const courseId of ids){const x=enrollOne(s,courseId,learn,path);if(x.ok)ok.push(courseId)}});snack(`${sfCount(ok.length,'course')} enrolled.`);return true;}
 case 'v02-cancel-enroll':ui.pendingEnrollment=[];ui.pendingPathway=null;render();return true;
 case 'v02-withdraw':save(s=>s.enrollments=s.enrollments.filter(x=>!(x.learnerId===learn&&x.courseId===courseId)));snack('Withdrawn from voluntary enrollment; progress remains in this demo.');return true;
 case 'v02-save-pathway':save(s=>addPathway(s,pathwayId,learn));snack('Learning pathway saved. Enroll in courses when ready.');return true;
 case 'v02-remove-pathway':save(s=>s.pathwayPlans=s.pathwayPlans.filter(p=>!(p.pathwayId===pathwayId&&p.learnerId===learn)));snack('Pathway removed from your personal plan. Completed courses remain recorded.');return true;
 case 'v02-enroll-eligible':enter(pathwayCourses(s,pathwayId,learn).map(c=>c.id),pathwayId);return true;
 case 'v02-path-move':{const direction=btn.dataset.direction==='up'?-1:1;save(s=>{const p=s.pathways.find(x=>x.id===pathwayId);if(!p)return;const i=p.courseIds.indexOf(courseId),j=i+direction;if(i<0||j<0||j>=p.courseIds.length)return;[p.courseIds[i],p.courseIds[j]]=[p.courseIds[j],p.courseIds[i]];for(const [cid,pre] of Object.entries(p.requirements||{}))if(p.courseIds.indexOf(pre.courseId)>=p.courseIds.indexOf(cid))delete p.requirements[cid];});snack('Pathway order updated. Any invalidated prerequisite links were removed.');return true;}
 case 'v02-path-remove-course':save(s=>{const p=s.pathways.find(x=>x.id===pathwayId);if(!p)return;p.courseIds=p.courseIds.filter(c=>c!==courseId);delete p.requirements[courseId];for(const [cid,pre] of Object.entries(p.requirements))if(pre.courseId===courseId)delete p.requirements[cid];});snack('Course removed from pathway, not from Course Library.');return true;
 default:return false;
 }
}
export function onLearningChangeV02(el,ui,T){if(el.id==='v02AssignmentSort'){ui.assignmentSort=el.value;save(s=>{s.preferences[ui.learnerId] ||= {};s.preferences[ui.learnerId].assignmentSort=el.value;});return true;}
 if(el.id==='v02AssignmentFilter'){ui.assignmentFilter=el.value;T.render();return true;}
 if(el.id==='v02PathwaySelect'){ui.pathwayId=el.value;T.render();return true;}
 if(el.id==='v02StudioPathwaySelect'){ui.studioPathwayId=el.value;T.render();return true;}
 return false;}
export function onLearningSubmitV02(form,values,ui,T){const s=getState(),name=form.dataset.form;
 if(name==='v02-add-course-to-pathway'){
 const pid=String(values.get('pathwayId')),cid=String(values.get('courseId'));
 if(!cid)return true;
 save(s=>{const p=s.pathwayPlans.find(x=>x.pathwayId===pid&&x.learnerId===ui.learnerId);if(p&&!p.additionalCourseIds.includes(cid)&&!s.pathways.find(x=>x.id===pid)?.courseIds.includes(cid))p.additionalCourseIds.push(cid)});T.snack('Course added to your personal pathway.');return true;
 }
 if(name==='v02-studio-add-course'){
 const pid=String(values.get('pathwayId')),cid=String(values.get('courseId'));if(!cid)return true;
 save(s=>{const p=s.pathways.find(x=>x.id===pid);if(p&&!p.courseIds.includes(cid))p.courseIds.push(cid)});T.snack('Existing course added to instructor pathway.');return true;
 }
 if(name==='v02-create-pathway'){
 const title=String(values.get('title')||'').trim(),description=String(values.get('description')||'').trim(),courses=values.getAll('courseIds').map(String);
 if(!title||!description||courses.length===0){T.snack('Enter a name, description, and at least one course.');return true;}
 const id='path-'+Date.now().toString(36);save(s=>s.pathways.push({id,title,description,academy:String(values.get('academy')),courseIds:courses,requirements:{},published:true}));ui.studioPathwayId=id;T.snack('Instructor pathway created in fictional demo.');return true;
 }
 if(name==='v02-edit-pathway'){
 const id=String(values.get('pathwayId'));
 save(s=>{const p=s.pathways.find(x=>x.id===id);if(!p)return;p.title=String(values.get('title')||'').trim().slice(0,90);p.description=String(values.get('description')||'').trim().slice(0,400);p.requirements={};for(const cid of p.courseIds){const val=String(values.get('req:'+cid)||'none');const [type,other]=val.split(':');if(['required','recommended'].includes(type)&&p.courseIds.indexOf(other)>=0&&p.courseIds.indexOf(other)<p.courseIds.indexOf(cid))p.requirements[cid]={courseId:other,type};}});
 T.snack('Pathway requirements saved.');return true;
 }
 if(name==='v02-training-settings'){
 const soft=Number(values.get('soft')),hard=Number(values.get('hard')),days=Number(values.get('dueSoonDays'));
 if(!Number.isInteger(soft)||!Number.isInteger(hard)||soft<1||hard<soft||hard>25||!Number.isInteger(days)||days<1||days>90){T.snack('Choose limits between 1 and 25, with soft ≤ hard; due-soon window 1–90 days.');return true;}
 save(s=>s.trainingLimits={soft,hard,dueSoonDays:days});T.snack('Fictional training settings saved.');return true;
 }
 return false;
}
export function renderTrainingSettingsV02(T){const s=getState(),v=s.trainingLimits;return `<section class="section"><h2>Learning configuration · Demo</h2><p class="small muted">In production, training policy and permissions must be approved by mine leadership. These values are only local demonstration settings.</p><form data-form="v02-training-settings" class="form-grid"><label class="form-field">Suggested voluntary course limit<input type="number" name="soft" min="1" max="25" value="${v.soft}" required></label><label class="form-field">Maximum voluntary course limit<input type="number" name="hard" min="1" max="25" value="${v.hard}" required></label><label class="form-field">Due-soon warning window (days)<input type="number" name="dueSoonDays" min="1" max="90" value="${v.dueSoonDays}" required></label><div class="form-field"><span class="section-label">Apply</span><button class="btn primary" type="submit">Save demo settings</button></div></form></section>`;}