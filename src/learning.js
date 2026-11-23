/* SkyFire Education v0.2: all data below is FICTIONAL. No official training records. */
export const DEFAULT_LIMITS = Object.freeze({soft:4,hard:10,dueSoonDays:14});
export const LEARNING_STAGES = ['Learn','Interact','Practice / Apply','Assess Competency','Develop Mastery','Coach / Mentor'];
export const STARTER_PATHWAYS = [
  {id:'future-supervisor',title:'Future Mine Supervisor',academy:'Leadership & Supervision',description:'Build communication, coaching, inspection-readiness, and supervisory decision skills.',courseIds:['professionalism','leading-listening','inspection-ready','advanced-supervision'],requirements:{'advanced-supervision':{courseId:'leading-listening',type:'required'}},published:true},
  {id:'equipment-foundations',title:'Mobile Equipment Foundations',academy:'Technical & Role-Specific',description:'Understand haulage hazards, site-specific controls, and emergency communications.',courseIds:['powered-haulage','quartette-routes','emergency-tabletop'],requirements:{},published:true},
  {id:'emergency-ready',title:'Emergency Preparedness Essentials',academy:'Emergency Preparedness',description:'Build emergency communication skills and prepare for more advanced response responsibilities.',courseIds:['emergency-tabletop','inspection-ready'],requirements:{'inspection-ready':{courseId:'emergency-tabletop',type:'recommended'}},published:true}
];
export const addDays = (days, base = new Date()) => { const d=new Date(base);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10); };
const key = (learnerId,courseId)=>`${learnerId}:${courseId}`;
export function ensureLearningState(s){
  if(!s || !Array.isArray(s.courses) || !Array.isArray(s.learners) || !Array.isArray(s.assignments)) throw new Error('Incompatible fictional demo data');
  s.schema=2;
  s.enrollments ||= [];
  s.savedCourses ||= [];
  s.pathways ||= structuredClone(STARTER_PATHWAYS);
  s.pathwayPlans ||= [];
  s.completedHistory ||= [];
  s.preferences ||= {};
  s.trainingLimits ||= {...DEFAULT_LIMITS};
  for (let i=0;i<s.assignments.length;i++){
    const a=s.assignments[i];
    a.id ||= `assigned-${a.learnerId}-${a.courseId}-${i}`;
    a.cycle ||= 1;
    a.source ||= 'instructor';
    if(!a.dueAt && a.courseId==='powered-haulage' && a.learnerId==='W-001') a.dueAt=addDays(12);
    if(!a.dueAt && a.courseId==='powered-haulage' && a.learnerId!=='W-001') a.dueAt=addDays(45);
    if(a.courseId==='powered-haulage')a.recurring=true;
  }
  // Keep the demo useful after upgrading a browser that already held v0.1 progress.
  if(!s.assignments.some(a=>a.learnerId==='W-001' && a.courseId==='emergency-tabletop'))
    s.assignments.push({id:'sample-assign-emergency',learnerId:'W-001',courseId:'emergency-tabletop',source:'instructor',cycle:1,assignedAt:addDays(-1),dueAt:addDays(40),recurring:false});
  if(!s.assignments.some(a=>a.learnerId==='W-001' && a.courseId==='professionalism'))
    s.assignments.push({id:'sample-assign-upcoming',learnerId:'W-001',courseId:'professionalism',source:'instructor',cycle:1,assignedAt:addDays(-1),availableFrom:addDays(15),dueAt:addDays(55),recurring:false});
  if(!s.completedHistory.some(h=>h.learnerId==='W-001' && h.courseId==='powered-haulage' && h.demoSeed)) {
    s.completedHistory.push(
      {id:'history-001',learnerId:'W-001',courseId:'powered-haulage',completedAt:'2025-11-10',source:'SkyFire demo',mastered:false,demoSeed:true,cycle:0},
      {id:'history-002',learnerId:'W-001',courseId:'powered-haulage',completedAt:'2024-11-08',source:'SkyFire demo',mastered:true,demoSeed:true,cycle:-1}
    );
  }
  return s;
}
export const learnerSaved = (s, learnerId)=>s.savedCourses.filter(x=>x.learnerId===learnerId).map(x=>x.courseId);
export const learnerEnrolled = (s, learnerId)=>s.enrollments.filter(x=>x.learnerId===learnerId).map(x=>x.courseId);
export const learnerPlans = (s,learnerId)=>s.pathwayPlans.filter(x=>x.learnerId===learnerId);
export function progressForCycle(s,courseId,learnerId,cycle=1){return s.progress[`${courseId}:${learnerId}${cycle>1?':'+cycle:''}`]||{completed:[],quiz:null,scenario:null};}
export function completionFor(s,c,learnerId,cycle=1){const p=progressForCycle(s,c.id,learnerId,cycle);return {done:c.lessons.filter(l=>p.completed.includes(l.id)).length,total:c.lessons.length,ready:c.lessons.length>0 && c.lessons.every(l=>p.completed.includes(l.id))};}
export function courseHasCompletion(s,courseId,learnerId){const c=s.courses.find(x=>x.id===courseId);if(!c)return false;return s.completedHistory.some(h=>h.courseId===courseId&&h.learnerId===learnerId) || completionFor(s,c,learnerId,activeCycle(s,courseId,learnerId)).ready;}
export function activeCycle(s,courseId,learnerId){return s.assignments.find(x=>x.courseId===courseId && x.learnerId===learnerId)?.cycle || 1;}
export function coursePrerequisites(s,c,learnerId,pathwayId){
  const requirements=[...(c.prerequisites||[])];
  if(pathwayId){const pathway=s.pathways.find(x=>x.id===pathwayId),p=pathway?.requirements?.[c.id];if(p)requirements.push(p);}
  return requirements.filter(x=>x?.courseId).map(x=>({...x,course:s.courses.find(c=>c.id===x.courseId),met:courseHasCompletion(s,x.courseId,learnerId)}));
}
export function enrollmentCheck(s,courseId,learnerId,pathwayId=null){
  const c=s.courses.find(x=>x.id===courseId),learner=s.learners.find(x=>x.id===learnerId);
  if(!c||!learner)return {ok:false,reason:'Course or learner not found'};
  if(c.scope!=='all'&&c.scope!==learner.site)return {ok:false,reason:'Not available at this mine site'};
  const unmet=coursePrerequisites(s,c,learnerId,pathwayId).filter(p=>p.type==='required'&&!p.met);
  if(unmet.length)return {ok:false,reason:`Prerequisite required: ${unmet.map(p=>p.course?.name||p.courseId).join(', ')}`};
  if(s.enrollments.some(e=>e.learnerId===learnerId&&e.courseId===courseId))return {ok:false,reason:'Already enrolled'};
  if(s.assignments.some(a=>a.learnerId===learnerId&&a.courseId===courseId))return {ok:false,reason:'Already assigned by instructor'};
  if(courseHasCompletion(s,courseId,learnerId))return {ok:false,reason:'Already completed; review the course history'};
  return {ok:true,recommended:coursePrerequisites(s,c,learnerId,pathwayId).filter(p=>p.type==='recommended'&&!p.met)};
}
export function activeVoluntaryCount(s,learnerId){return s.enrollments.filter(e=>e.learnerId===learnerId).filter(e=>{const c=s.courses.find(x=>x.id===e.courseId);return c&&!completionFor(s,c,learnerId).ready}).length;}
export function enrollOne(s,courseId,learnerId,pathwayId=null){
  const check=enrollmentCheck(s,courseId,learnerId,pathwayId);if(!check.ok)return check;
  if(activeVoluntaryCount(s,learnerId)>=s.trainingLimits.hard)return {ok:false,reason:`Maximum ${s.trainingLimits.hard} active voluntary courses reached`};
  s.enrollments.push({courseId,learnerId,enrolledAt:new Date().toISOString(),pathwayId});
  s.savedCourses=s.savedCourses.filter(x=>!(x.courseId===courseId&&x.learnerId===learnerId));
  return {ok:true};
}
export function assignmentInfo(s,assignment,course,learnerId,now=new Date()){
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const days=(date)=>date?Math.ceil((new Date(date+'T12:00:00')-today)/(864e5)):null;
  const p=progressForCycle(s,course.id,learnerId,assignment.cycle||1);
  const complete=completionFor(s,course,learnerId,assignment.cycle||1);
  const daysUntil=days(assignment.dueAt),opensIn=days(assignment.availableFrom);
  let status='Assigned',kind='gray',priority=50;
  if(complete.ready){status='Completed';kind='green';priority=100;}
  else if(assignment.reviewState==='pending'){status='Pending Review';kind='purple';priority=6;}
  else if(p.quiz && p.quiz.passed===false){status='Reassessment Required';kind='red';priority=3;}
  else if(opensIn!==null&&opensIn>0){status='Upcoming';kind='gray';priority=80;}
  else if(daysUntil!==null&&daysUntil<0){status='Overdue';kind='red';priority=0;}
  else if(daysUntil!==null&&daysUntil<=s.trainingLimits.dueSoonDays){status='Due Soon';kind='orange';priority=1;}
  else if(complete.done>0){status='In Progress';kind='purple';priority=20;}
  return {status,kind,priority,daysUntil,opensIn,complete};
}
export function completedGroups(s,learnerId,source='all'){
  const groups=new Map();
  const add=(courseId,record)=>{if(!groups.has(courseId))groups.set(courseId,[]);groups.get(courseId).push(record);};
  for(const h of s.completedHistory.filter(h=>h.learnerId===learnerId)) add(h.courseId,h);
  for(const a of s.assignments.filter(a=>a.learnerId===learnerId)){
    const c=s.courses.find(x=>x.id===a.courseId);
    if(c&&completionFor(s,c,learnerId,a.cycle).ready)add(c.id,{id:a.id,learnerId,courseId:c.id,completedAt:progressForCycle(s,c.id,learnerId,a.cycle).updatedAt||new Date().toISOString(),source:'SkyFire demonstration',mastered:false,cycle:a.cycle});
  }
  for(const e of s.enrollments.filter(e=>e.learnerId===learnerId)){
    const c=s.courses.find(x=>x.id===e.courseId);
    if(c&&completionFor(s,c,learnerId).ready)add(c.id,{id:`elective-${c.id}`,courseId:c.id,completedAt:progressForCycle(s,c.id,learnerId).updatedAt||e.enrolledAt,source:'SkyFire demonstration · Personal Learning',mastered:false});
  }
  return [...groups.entries()].map(([courseId,records])=>({course:s.courses.find(c=>c.id===courseId),courseId,records:records.sort((a,b)=>String(b.completedAt).localeCompare(String(a.completedAt)))})).filter(g=>g.course && (source==='all'||(source==='voluntary'?g.records.some(r=>r.source?.includes('Personal Learning')):true))).sort((a,b)=>a.course.name.localeCompare(b.course.name));
}
export function addPathway(s,pathwayId,learnerId){if(!s.pathwayPlans.some(x=>x.pathwayId===pathwayId&&x.learnerId===learnerId))s.pathwayPlans.push({pathwayId,learnerId,addedAt:new Date().toISOString(),additionalCourseIds:[]});}
export function pathwayCourses(s,pathwayId,learnerId){const path=s.pathways.find(p=>p.id===pathwayId);if(!path)return [];const plan=s.pathwayPlans.find(x=>x.pathwayId===pathwayId&&x.learnerId===learnerId);return [...new Set([...(path.courseIds||[]),...(plan?.additionalCourseIds||[])])].map(id=>s.courses.find(c=>c.id===id)).filter(Boolean);}