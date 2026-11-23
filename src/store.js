import {freshState} from './seed.js';
import {ensureLearningState,progressForCycle} from './learning.js';
export const STORAGE_KEY = 'skyfire-education-demo-v01';
let state;
let inMemoryOnly=false;
const listeners=new Set();
const clone=x=>JSON.parse(JSON.stringify(x));
export function load(){
  if(state)return state;
  try {
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved){const parsed=JSON.parse(saved);if([1,2].includes(parsed.schema)&&Array.isArray(parsed.courses)&&Array.isArray(parsed.learners))state=ensureLearningState(parsed);}
  } catch {inMemoryOnly=true;}
  state ||=ensureLearningState(freshState());
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{inMemoryOnly=true;}
  return state;
}
export function getState(){return load();}
export function isMemoryOnly(){return inMemoryOnly;}
export function save(mutator){
  const draft=clone(load());mutator(draft);state=ensureLearningState(draft);
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));inMemoryOnly=false;} catch {inMemoryOnly=true;}
  for(const cb of listeners)cb(state);
}
export function subscribe(cb){listeners.add(cb);return()=>listeners.delete(cb);}
export function reset(){state=ensureLearningState(freshState());try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));inMemoryOnly=false;}catch{inMemoryOnly=true;}for(const cb of listeners)cb(state);}
export function exportDemo(){const blob=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='skyfire-education-fictional-demo-v02.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function importDemo(file){
 const value=JSON.parse(await file.text());
 if(![1,2].includes(value.schema)||!Array.isArray(value.courses)||!Array.isArray(value.learners)||!Array.isArray(value.assignments)||!value.progress||!Array.isArray(value.evaluations))throw new Error('Incompatible demo export');
 if(value.learners.some(x=>x.kind!=='fictional'))throw new Error('Only fictional demo records are accepted');
 state=ensureLearningState(value);
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));inMemoryOnly=false;}catch{inMemoryOnly=true;}
 for(const cb of listeners)cb(state);
}
export function progressFor(courseId,learnerId){const a=load().assignments.find(x=>x.courseId===courseId && x.learnerId===learnerId);return progressForCycle(load(),courseId,learnerId,a?.cycle||1);}
export function updateProgress(courseId,learnerId,patch){
 save(s=>{const a=s.assignments.find(x=>x.courseId===courseId&&x.learnerId===learnerId);const cycle=a?.cycle||1;const key=`${courseId}:${learnerId}${cycle>1?':'+cycle:''}`;const p=s.progress[key]||{completed:[],quiz:null,scenario:null};s.progress[key]={...p,...patch,updatedAt:new Date().toISOString()};});
}
export const assigned=(courseId,learnerId)=>getState().assignments.some(a=>a.courseId===courseId&&a.learnerId===learnerId);
export function assignCourse(courseId,ids,{dueAt=null,availableFrom=null,recurring=false}={}){
 save(s=>{for(const learnerId of ids){const c=s.courses.find(x=>x.id===courseId);if(!c)continue;const existing=s.assignments.find(a=>a.courseId===courseId&&a.learnerId===learnerId);
   if(existing){const old=courseCompletion(c,learnerId);if(old.ready){const prev=progressForCycle(s,courseId,learnerId,existing.cycle||1);s.completedHistory.push({id:`archive-${Date.now()}-${learnerId}`,courseId,learnerId,cycle:existing.cycle,completedAt:prev.updatedAt||new Date().toISOString(),source:'SkyFire demonstration',mastered:false});existing.cycle++;existing.dueAt=dueAt;existing.availableFrom=availableFrom;existing.recurring=recurring;}continue;}
   s.assignments.push({id:`assignment-${Date.now()}-${learnerId}-${courseId}`,courseId,learnerId,cycle:1,source:'instructor',assignedAt:new Date().toISOString().slice(0,10),dueAt,availableFrom,recurring});
 }});
}
export function courseCompletion(course,learnerId){const s=getState();const a=s.assignments.find(x=>x.courseId===course.id&&x.learnerId===learnerId);const p=progressForCycle(s,course.id,learnerId,a?.cycle||1);return {done:course.lessons.filter(l=>p.completed.includes(l.id)).length,total:course.lessons.length,ready:course.lessons.length>0&&course.lessons.every(l=>p.completed.includes(l.id))};}