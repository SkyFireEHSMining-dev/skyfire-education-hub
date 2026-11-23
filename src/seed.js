// Entirely fictional demonstration records. No real workers, qualifications, or certifications.
export const SITE_ALL = 'all';
export const SITES = [
  {id:'quartette',name:'Quartette',operation:'Surface metal / nonmetal',region:'Southern Nevada',accent:'#0b84ff'},
  {id:'spirit',name:'Spirit Mountain',operation:'Underground metal / nonmetal (scenario)',region:'Southern Nevada',accent:'#a45ccc'},
];
export const ACADEMIES = [
  'Core Training','Technical & Role-Specific','Hazard Awareness','Site-Specific Training',
  'Emergency Preparedness','Leadership & Supervision','Professional Development',
];
const names = [
  ['Jordan','Reyes'],['Taylor','Morgan'],['Avery','Chen'],['Morgan','Patel'],['Casey','Brooks'],
  ['Riley','Young'],['Sam','Rivera'],['Cameron','Lee'],['Alex','Martinez'],['Jamie','Turner'],
  ['Drew','Miller'],['Dakota','Nguyen'],['Robin','Walker'],['Skyler','Hall'],['Kendall','Adams'],
  ['Bailey','Jackson'],['Parker','Davis'],['Sidney','Allen'],['Devin','Flores'],['Quinn','Garcia'],
  ['Rowan','Wilson'],['Jules','Carter'],['Shay','Moore'],['Finley','Scott'],['Emerson','King'],
];
export function makeLearners(){
  const jobs=['Haul Truck Operator','Plant Operator','Maintenance Technician','General Miner','Heavy Equipment Operator','Supervisor','Environmental Technician','Electrician','Contractor - Service'];
  return Array.from({length:240},(_,i)=>{
    const [first,last]=names[i%names.length];
    const site=i<140?'quartette':'spirit';
    const job=jobs[(i*7+Math.floor(i/17))%jobs.length];
    return {id:`W-${String(i+1).padStart(3,'0')}`,name:`${first} ${names[Math.floor(i/names.length)%names.length][1]}`,site,job,contractor:job.startsWith('Contractor'),kind:'fictional'};
  });
}
export const BASE_COURSES = [
  {
    id:'powered-haulage',name:'Powered Haulage Safety',academy:'Hazard Awareness',audience:'All workforce & participating contractors',scope:'all',duration:'35–50 min',status:'Demonstration course',required:true,
    summary:'Recognize mobile equipment risks, establish safe separation, communicate clearly, and apply site traffic controls.',
    objectives:['Identify blind spots and interaction hazards','Apply practical pedestrian and vehicle separation controls','Respond appropriately to unexpected mobile-equipment conditions'],
    lessons:[
      {id:'ph-intro',title:'Know the mobile equipment environment',type:'read',minutes:8,
        content:'Powered haulage hazards include moving equipment, restricted visibility, unstable or congested travel routes, unexpected pedestrian movement, backing, and improper communication. Identify designated traffic routes, exclusion zones, and warning devices before entering operating areas. This sample lesson is general safety education, not a mine-specific procedure.'},
      {id:'ph-audio',title:'Audio briefing: Pause, make contact, confirm',type:'audio',minutes:6,
        content:'Before approaching active mobile equipment, stop in a safe location. Make positive contact with the operator using the mine’s approved communication method. Do not assume the operator sees you. Wait for a clear acknowledgment and permission before proceeding. If communication fails, remain outside the operating zone and notify supervision.'},
      {id:'ph-scenario',title:'Scenario: Walking near an active haul route',type:'scenario',minutes:8,
        content:'You need to reach a service area across an active equipment route. A haul truck is preparing to reverse, and you cannot confirm the operator has seen you.',
        options:['Cross quickly while the truck is still stationary','Stop outside the operating zone and establish positive communication before crossing','Signal briefly and walk behind the reversing truck'],correct:1,
        feedback:'The safe response is to remain outside the operating zone until positive communication and the site’s crossing procedures are satisfied.'},
      {id:'ph-quiz',title:'Knowledge check: Mobile equipment interfaces',type:'quiz',minutes:10,
        questions:[
          {q:'What is the safest response when you cannot confirm that an operator sees you?',options:['Stay clear and establish positive communication','Walk faster through the area','Rely on reflective clothing alone'],correct:0,why:'Do not enter an operating zone without the site-required acknowledgment and controls.'},
          {q:'Why are blind spots important around large equipment?',options:['All blind spots are eliminated by backup alarms','Operators may be unable to see pedestrians or smaller vehicles','Blind spots occur only in poor weather'],correct:1,why:'Equipment geometry and operating conditions can severely restrict visibility.'},
          {q:'What should govern pedestrian crossings?',options:['The shortest walking route','An employee’s personal judgment only','Site traffic controls and confirmed operator communication'],correct:2,why:'Follow established traffic management and positive communication procedures.'},
          {q:'What should you do if a communication method fails?',options:['Proceed if the equipment appears stationary','Remain outside the hazard area and escalate appropriately','Use hand signals even if unseen'],correct:1,why:'A failed communication control must not be replaced by assumption.'}
        ]}
    ],
    checklist:['Describes site traffic controls and pedestrian exclusion areas','Demonstrates approved positive communication before entering operating zones','Identifies hazards in a realistic equipment interaction scenario'],
    instructorNotes:"Ask learners to connect each hazard to the actual site\'s traffic-management plan. A quiz score is not an operational authorization or a Part 48 certification."
  },
  {
    id:'inspection-ready',name:'When an MSHA Inspector Arrives',academy:'Leadership & Supervision',audience:'Supervisors / leadership',scope:'all',duration:'25 min',status:'Preview lesson',required:false,
    summary:'A professional introduction to inspection roles, accurate communication, records access, and escalation.',objectives:['Understand inspection coordination'],
    lessons:[{id:'ins-read',title:'Professional inspection readiness',type:'read',minutes:12,content:'Treat inspections as an opportunity to demonstrate actual operating conditions and correct hazards. Communicate accurately, preserve records, respect miner rights, and follow operator procedures for escorting visitors and escalating findings. Training must be checked against current law and site policy.'}],checklist:[],instructorNotes:'Validate with counsel and leadership before operational use.'
  },
  {
    id:'emergency-tabletop',name:'Emergency Communications Tabletop',academy:'Emergency Preparedness',audience:'All roles',scope:'all',duration:'25 min',status:'Preview lesson',required:false,
    summary:'Practice identifying an emergency, communicating essential details, and following command procedures.',objectives:['Communicate promptly and clearly'],lessons:[{id:'er-read',title:'The first report',type:'read',minutes:10,content:'Report the location, observed conditions, people affected, immediate hazards, and actions taken. Follow the approved emergency response plan and never enter an unsafe area to investigate without authorization.'}],checklist:[],instructorNotes:'Do not replace live drills or required mine rescue exercises.'
  },
  {
    id:'leading-listening',name:'Leading Through Listening',academy:'Leadership & Supervision',audience:'Open elective',scope:'all',duration:'20 min',status:'Preview lesson',required:false,
    summary:'Practice respectful coaching, open questions, and actionable feedback.',objectives:['Ask better coaching questions'],lessons:[{id:'listen-read',title:'Connect before correcting',type:'read',minutes:8,content:'Describe the observable behavior, ask what the employee saw or expected, listen without interrupting, and agree on a safer next step. Maintain clear standards while respecting experienced miners.'}],checklist:[],instructorNotes:'Use real-world examples that respect worker experience.'
  },
  {
    id:'quartette-routes',name:'Quartette Traffic Routes — Orientation',academy:'Site-Specific Training',audience:'Quartette personnel',scope:'quartette',duration:'15 min',status:'Concept preview',required:false,
    summary:'Placeholder structure for future approved traffic maps, routes, and pedestrian access rules.',objectives:['Recognize need for current site maps'],lessons:[{id:'q-read',title:'Site-specific controls required',type:'read',minutes:5,content:'This sample contains no actual Quartette traffic map or approved procedure. Before operational use, add and approve site routes, signage, speed restrictions, pedestrian crossings, and emergency access information.'}],checklist:[],instructorNotes:'Do not enter actual site procedures without approval.'
  },
  {
    id:'spirit-ground',name:'Underground Hazard Recognition',academy:'Hazard Awareness',audience:'Underground personnel',scope:'spirit',duration:'20 min',status:'Concept preview',required:false,
    summary:'A starting point for ground control, ventilation, visibility, and emergency escape awareness.',objectives:['Identify relevant underground hazards'],lessons:[{id:'u-read',title:'Pause and assess',type:'read',minutes:7,content:'Underground hazards may include unstable ground, air quality, restricted access, moving equipment, and limited escape routes. Follow site-specific ground control, ventilation, and emergency procedures. No underground mine plan is represented here.'}],checklist:[],instructorNotes:'Validate against applicable Part 48 Subpart A and mine operating conditions.'
  },
  {
    id:'advanced-supervision',name:'Advanced Supervisory Decisions',academy:'Leadership & Supervision',audience:'Supervisors & aspiring leaders',scope:'all',duration:'35 min',status:'Preview lesson',required:false,
    prerequisites:[{courseId:'leading-listening',type:'required'}],
    summary:'Apply coaching, communication, and professional judgment to complex shift decisions.',objectives:['Explain decisions under competing operational demands'],
    lessons:[{id:'adv-read',title:'Lead with clear expectations',type:'read',minutes:12,content:'In this fictional leadership scenario, a task is delayed because workers have conflicting information. Gather facts, hear affected personnel, communicate the standard, and verify the resulting corrective action. A digital lesson does not grant supervisory authority.'}],checklist:[],instructorNotes:'This is an educational preview; review against company policy before operational use.'
  },
  {
    id:'professionalism',name:'Professional Communication at Work',academy:'Professional Development',audience:'Open elective',scope:'all',duration:'18 min',status:'Preview lesson',required:false,
    summary:'Professional conduct, constructive feedback, and clear operational handoffs.',objectives:['Strengthen professional communication'],lessons:[{id:'pr-read',title:'Clear handoffs and accountability',type:'read',minutes:7,content:'A useful handoff explains what happened, what is still open, what risk remains, and who owns the next action. Avoid speculation and label unknowns clearly. Invite questions and repeat-back when consequences are significant.'}],checklist:[],instructorNotes:'Use scenarios from fictional work situations.'
  },
];
export function freshState(){
  const learners=makeLearners();
  return {
    schema:1,createdAt:'2026-11-21',courses:structuredClone(BASE_COURSES),learners,
    // First 48 workers have a fictional assignment. Everything else can be assigned from Studio.
    assignments:learners.slice(0,48).map(p=>({courseId:'powered-haulage',learnerId:p.id,assignedAt:'2026-11-21'})),
    progress:{},evaluations:[],activity:[]
  };
}