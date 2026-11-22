import {freshState} from './seed.js';
export const STORAGE_KEY = 'skyfire-education-demo-v01';
let state;
let inMemoryOnly=false;
const listeners=new Set();
const clone=x=>JSON.parse(JSON.stringify(x));
export function load(){
  if(state)return state;
  try {
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved){const parsed=JSON.parse(saved);if(parsed.schema===1&&Array.isArray(parsed.courses)&&Array.isArray(parsed.learners))state=parsed;}
  } catch {inMemoryOnly=true;}
  state ||=freshState();return state;
}
export function getState(){return load();}
export function isMemoryOnly(){return inMemoryOnly;}
export function save(mutator){
  const draft=clone(load());mutator(draft);state=draft;
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));inMemoryOnly=false;} catch {inMemoryOnly=true;}
  for(const cb of listeners)cb(state);
}
export function subscribe(cb){listeners.add(cb);return()=>listeners.delete(cb);}
export function reset(){state=freshState();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));inMemoryOnly=false;}catch{inMemoryOnly=true;}for(const cb of listeners)cb(state);}
export function exportDemo(){const blob=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='skyfire-education-fictional-demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function importDemo(file){
 const value=JSON.parse(await file.text());
 if(value.schema!==1||!Array.isArray(value.courses)||!Array.isArray(value.learners)||!Array.isArray(value.assignments)||!value.progress||!Array.isArray(value.evaluations))throw new Error('Incompatible demo export');
 if(value.learners.some(x=>x.kind!=='fictional'))throw new Error('Only fictional demo records are accepted');
 state=value;
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));inMemoryOnly=false;}catch{inMemoryOnly=true;}
 for(const cb of listeners)cb(state);
}
export const progressFor=(courseId,learnerId)=>getState().progress[`${courseId}:${learnerId}`]||{completed:[],quiz:null,scenario:null};
export function updateProgress(courseId,learnerId,patch){
 save(s=>{const key=`${courseId}:${learnerId}`;const p=s.progress[key]||{completed:[],quiz:null,scenario:null};s.progress[key]={...p,...patch,updatedAt:new Date().toISOString()};});
}
export const assigned=(courseId,learnerId)=>getState().assignments.some(a=>a.courseId===courseId&&a.learnerId===learnerId);
export function assignCourse(courseId,ids){
 save(s=>{for(const learnerId of ids)if(!s.assignments.some(a=>a.courseId===courseId&&a.learnerId===learnerId))s.assignments.push({courseId,learnerId,assignedAt:new Date().toISOString().slice(0,10)});});
}
export function courseCompletion(course,learnerId){
 const p=progressFor(course.id,learnerId);return {done:course.lessons.filter(l=>p.completed.includes(l.id)).length,total:course.lessons.length,ready:course.lessons.every(l=>p.completed.includes(l.id))};
}
