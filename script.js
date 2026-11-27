const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const today = new Date();
const iso = d => new Date(d).toISOString().slice(0,10);
const plusDays = n => { const d=new Date(); d.setDate(d.getDate()+n); return iso(d); };
const fmtDate = d => d ? new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : 'Not scheduled';
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seed = {
 clients:[
  {id:1,name:'Riya Sharma',email:'riya.sharma@email.com',phone:'+91 98765 43210'},
  {id:2,name:'Aarav Mehta',email:'aarav.mehta@email.com',phone:'+91 98765 12345'},
  {id:3,name:'Northstar Pvt. Ltd.',email:'legal@northstar.in',phone:'+91 98111 22334'}
 ],
 cases:[
  {id:101,title:'Sharma vs. State of Punjab',number:'CIV/2026/0142',clientId:1,type:'Civil Litigation',stage:'Evidence',status:'Active',hearing:plusDays(3),court:'District Court, Ludhiana'},
  {id:102,title:'Mehta Property Dispute',number:'CIV/2026/0108',clientId:2,type:'Property',stage:'Filing',status:'Pending',hearing:plusDays(8),court:'Civil Court, Ludhiana'},
  {id:103,title:'Northstar Contract Review',number:'COM/2026/0027',clientId:3,type:'Commercial',stage:'Arguments',status:'Active',hearing:plusDays(12),court:'High Court, Chandigarh'},
  {id:104,title:'Sharma Employment Matter',number:'LAB/2025/0089',clientId:1,type:'Employment',stage:'Disposed',status:'Closed',hearing:'',court:'Labour Court'}
 ],
 tasks:[
  {id:201,title:'Review witness statements',caseId:101,due:plusDays(1),priority:'High',done:false},
  {id:202,title:'Prepare property documents',caseId:102,due:plusDays(2),priority:'Medium',done:false},
  {id:203,title:'Send contract notes to client',caseId:103,due:plusDays(4),priority:'High',done:false},
  {id:204,title:'File vakalatnama',caseId:101,due:plusDays(-1),priority:'Low',done:true}
 ],
 hearings:[
  {id:301,caseId:101,date:plusDays(3),time:'10:30 AM',court:'District Court, Ludhiana',note:'Evidence submission'},
  {id:302,caseId:102,date:plusDays(8),time:'11:00 AM',court:'Civil Court, Ludhiana',note:'Initial hearing'},
  {id:303,caseId:103,date:plusDays(12),time:'02:00 PM',court:'High Court, Chandigarh',note:'Final arguments'}
 ],
 documents:[
  {id:401,name:'Witness_Statement.pdf',caseId:101,date:plusDays(-2),type:'PDF'},
  {id:402,name:'Property_Agreement.docx',caseId:102,date:plusDays(-4),type:'DOCX'},
  {id:403,name:'Service_Contract.pdf',caseId:103,date:plusDays(-6),type:'PDF'}
 ],
 events:[
  {id:1,icon:'＋',title:'New case added',detail:'Sharma vs. State of Punjab',date:plusDays(-1)},
  {id:2,icon:'▧',title:'Document added',detail:'Witness_Statement.pdf',date:plusDays(-2)},
  {id:3,icon:'✓',title:'Task completed',detail:'File vakalatnama',date:plusDays(-1)}
 ]
};
let db;
try { db=JSON.parse(localStorage.getItem('lexflow-data')) || seed; } catch { db=seed; }
function save(){localStorage.setItem('lexflow-data',JSON.stringify(db));}
function clientName(id){return db.clients.find(c=>c.id===id)?.name||'Unknown client'}
function caseName(id){return db.cases.find(c=>c.id===id)?.title||'Unlinked case'}
function statusClass(s){return String(s).toLowerCase()}
function emptyRow(cols,msg='Nothing to show yet'){return `<tr><td colspan="${cols}"><div class="empty-state"><strong>${msg}</strong>Add a record to see it here.</div></td></tr>`}
function render(){
 $('#todayLabel').textContent=today.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}).toUpperCase();
 $('#totalCases').textContent=db.cases.length; $('#activeCases').textContent=db.cases.filter(c=>c.status==='Active').length;
 $('#upcomingHearings').textContent=db.hearings.filter(h=>h.date>=iso(today)).length;
 $('#pendingTasks').textContent=db.tasks.filter(t=>!t.done).length; $('#caseNavCount').textContent=db.cases.length;
 const recent=[...db.cases].sort((a,b)=>b.id-a.id).slice(0,5);
 $('#recentCasesBody').innerHTML=recent.map(c=>`<tr><td><div class="case-name"><strong>${escapeHTML(c.title)}</strong><span>${escapeHTML(c.number)}</span></div></td><td class="client-cell">${escapeHTML(clientName(c.clientId))}</td><td>${fmtDate(c.hearing)}</td></tr>`).join('')||emptyRow(3);
 const taskHTML=t=>`<div class="task-row"><input class="task-check" type="checkbox" data-task="${t.id}" ${t.done?'checked':''} aria-label="Complete ${escapeHTML(t.title)}"><div class="task-copy ${t.done?'done':''}"><strong>${escapeHTML(t.title)}</strong><span>${escapeHTML(caseName(t.caseId))} · Due ${fmtDate(t.due)}</span></div>${!t.done?`<span class="priority">${escapeHTML(t.priority)}</span>`:''}</div>`;
 $('#overviewTasks').innerHTML=db.tasks.filter(t=>!t.done).slice(0,4).map(taskHTML).join('')||'<div class="empty-state">No pending tasks. You’re all caught up.</div>';
 $('#allTasksList').innerHTML=db.tasks.map(taskHTML).join('')||'<div class="empty-state">No tasks have been created yet.</div>';
 $('#timelineList').innerHTML=[...db.events].sort((a,b)=>b.id-a.id).slice(0,4).map(e=>`<div class="timeline-item"><div class="timeline-dot">${e.icon}</div><div class="timeline-copy"><strong>${escapeHTML(e.title)}</strong><p>${escapeHTML(e.detail)} · ${fmtDate(e.date)}</p></div></div>`).join('')||'<div class="empty-state">No recent activity.</div>';
 const upcoming=[...db.hearings].filter(h=>h.date>=iso(today)).sort((a,b)=>a.date.localeCompare(b.date));
 $('#overviewHearings').innerHTML=upcoming.slice(0,3).map(hearingHTML).join('')||'<div class="empty-state">No upcoming hearings scheduled.</div>';
 $('#allCasesBody').innerHTML=db.cases.map(c=>`<tr><td><div class="case-name"><strong>${escapeHTML(c.title)}</strong><span>${escapeHTML(c.number)}</span></div></td><td>${escapeHTML(clientName(c.clientId))}</td><td>${escapeHTML(c.type)}</td><td>${escapeHTML(c.stage)}</td><td><span class="status ${statusClass(c.status)}">${c.status}</span></td><td><button class="row-actions" data-delete="case" data-id="${c.id}" aria-label="Delete case">···</button></td></tr>`).join('')||emptyRow(6);
 $('#clientsBody').innerHTML=db.clients.map(c=>`<tr><td class="client-cell">${escapeHTML(c.name)}</td><td>${escapeHTML(c.email)}</td><td>${escapeHTML(c.phone)}</td><td>${db.cases.filter(x=>x.clientId===c.id).length}</td><td><button class="row-actions" data-delete="client" data-id="${c.id}" aria-label="Delete client">···</button></td></tr>`).join('')||emptyRow(5);
 $('#hearingCards').innerHTML=upcoming.map(h=>{const d=new Date(h.date+'T00:00:00');return `<article class="hearing-card"><div class="date-tile"><strong>${d.getDate()}</strong><span>${d.toLocaleDateString('en-IN',{month:'short'})}</span></div><div><h3>${escapeHTML(caseName(h.caseId))}</h3><p>${fmtDate(h.date)} · ${escapeHTML(h.time)}<br>${escapeHTML(h.court)}<br>${escapeHTML(h.note||'Court appearance')}</p></div></article>`}).join('')||'<div class="panel empty-state">No upcoming hearings.</div>';
 $('#documentsBody').innerHTML=db.documents.map(d=>`<tr><td class="client-cell">▧ &nbsp;${escapeHTML(d.name)}</td><td>${escapeHTML(caseName(d.caseId))}</td><td>${fmtDate(d.date)}</td><td>${escapeHTML(d.type)}</td><td><button class="row-actions" data-delete="document" data-id="${d.id}" aria-label="Delete document">×</button></td></tr>`).join('')||emptyRow(5);
 applyFilters();
}
function hearingHTML(h) {
  return `
    <div class="hearing-item">
      <div class="hearing-copy">
        <strong>${escapeHTML(caseName(h.caseId))}</strong>
        <span>${escapeHTML(h.court)}</span>
      </div>
      <span class="hearing-time">${escapeHTML(h.time)}</span>
    </div>`;
}
function applyFilters(){
 const q=($('#caseSearch')?.value||'').toLowerCase(), st=$('#caseStatusFilter')?.value||'';
 $$('#allCasesBody tr').forEach(r=>{const match=r.textContent.toLowerCase().includes(q)&&(!st||r.textContent.includes(st));r.style.display=match?'':'none'});
 const cq=($('#clientSearch')?.value||'').toLowerCase(); $$('#clientsBody tr').forEach(r=>r.style.display=r.textContent.toLowerCase().includes(cq)?'':'none');
 const tq=($('#taskSearch')?.value||'').toLowerCase(), tf=$('#taskFilter')?.value||'all';
 $$('#allTasksList .task-row').forEach(r=>{const done=$('.task-check',r).checked;r.style.display=r.textContent.toLowerCase().includes(tq)&&(tf==='all'||(tf==='done'&&done)||(tf==='pending'&&!done))?'':'none'});
}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400)}
function showView(view){$$('.page-view').forEach(v=>v.classList.toggle('active',v.id==='view-'+view));$$('.nav-link').forEach(n=>n.classList.toggle('active',n.dataset.view===view));$('#breadcrumbCurrent').textContent=view.charAt(0).toUpperCase()+view.slice(1);$('#sidebar').classList.remove('open');}
$$('.nav-link').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.goto)));
$('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){showView('cases');$('#caseSearch').value=e.target.value;applyFilters()}});
['caseSearch','caseStatusFilter','clientSearch','taskSearch','taskFilter'].forEach(id=>$('#'+id).addEventListener('input',applyFilters));
document.addEventListener('change',e=>{if(e.target.matches('.task-check')){const t=db.tasks.find(x=>x.id===Number(e.target.dataset.task));if(t){t.done=e.target.checked;save();render();toast(t.done?'Task marked complete':'Task reopened')}}});
document.addEventListener('click',e=>{const del=e.target.closest('[data-delete]');if(del){const type=del.dataset.delete,id=Number(del.dataset.id);if(!confirm('Delete this '+type+'?'))return;if(type==='case'){db.cases=db.cases.filter(x=>x.id!==id);db.hearings=db.hearings.filter(x=>x.caseId!==id);db.tasks=db.tasks.filter(x=>x.caseId!==id);db.documents=db.documents.filter(x=>x.caseId!==id)}else if(type==='client')db.clients=db.clients.filter(x=>x.id!==id);else db.documents=db.documents.filter(x=>x.id!==id);save();render();toast('Record deleted')}});
const backdrop=$('#modalBackdrop'), fields=$('#modalFields'), form=$('#modalForm');let currentType='';
function field(label,name,type='text',opts=null,full=false,required=true){let control=opts?`<select name="${name}" ${required?'required':''}>${opts.map(o=>`<option value="${escapeHTML(o.value??o)}">${escapeHTML(o.label??o)}</option>`).join('')}</select>`:type==='textarea'?`<textarea name="${name}" ${required?'required':''}></textarea>`:`<input name="${name}" type="${type}" ${required?'required':''} ${type==='date'?'':''}>`;return `<div class="field ${full?'full':''}"><label>${label}</label>${control}</div>`}
function openModal(type){
 currentType=type;let title='',html='';
 const caseOpts=db.cases.map(c=>({value:c.id,label:c.title})),clientOpts=db.clients.map(c=>({value:c.id,label:c.name}));
 if(type==='case'){title='Create a new case';html=field('Case title','title','text',null,true)+field('Case number','number')+field('Client','clientId','select',clientOpts)+field('Case type','caseType','select',['Civil Litigation','Criminal','Property','Commercial','Family','Employment'])+field('Current stage','stage','select',['Filing','Notice','Evidence','Arguments','Judgment','Disposed'])+field('Status','status','select',['Active','Pending','Closed'])+field('Next hearing','hearing','date',null,false,false)+field('Court','court','text',null,true,false)}
 if(type==='client'){title='Add a client';html=field('Full name / Organisation','name','text',null,true)+field('Email address','email','email')+field('Phone number','phone','tel')}
 if(type==='task'){title='Add a task';html=field('Task title','title','text',null,true)+field('Related case','caseId','select',caseOpts)+field('Due date','due','date')+field('Priority','priority','select',['Low','Medium','High'])}
 if(type==='hearing'){title='Schedule a hearing';html=field('Related case','caseId','select',caseOpts)+field('Hearing date','date','date')+field('Time','time','text')+field('Court / Location','court','text',null,true)+field('Hearing note','note','text',null,true,false)}
 if(type==='document'){title='Add a document record';html=field('Document name','name','text',null,true)+field('Related case','caseId','select',caseOpts)+field('Document type','docType','select',['PDF','DOCX','Image','Other'])+field('Date added','date','date')}
 $('#modalTitle').textContent=title;fields.innerHTML=html;backdrop.classList.add('open');backdrop.setAttribute('aria-hidden','false');
}
function closeModal(){backdrop.classList.remove('open');backdrop.setAttribute('aria-hidden','true');form.reset()}
['closeModal','cancelModal'].forEach(id=>$('#'+id).addEventListener('click',closeModal));
backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal()});
$('#addCaseBtn').onclick=$('#addCaseBtn2').onclick=()=>openModal('case');
$('#addClientBtn').onclick=()=>openModal('client');
$('#addTaskBtn').onclick=$('#addTaskInline').onclick=()=>openModal('task');
$('#addHearingBtn').onclick=()=>openModal('hearing');
$('#uploadDocBtn').onclick=()=>openModal('document');
form.addEventListener('submit',e=>{
 e.preventDefault();const data=Object.fromEntries(new FormData(form));const id=Date.now();
 if(currentType==='case'){db.cases.unshift({id,title:data.title,number:data.number,clientId:Number(data.clientId),type:data.caseType,stage:data.stage,status:data.status,hearing:data.hearing,court:data.court});db.events.unshift({id,icon:'＋',title:'New case added',detail:data.title,date:iso(today)})}
 if(currentType==='client')db.clients.unshift({id,name:data.name,email:data.email,phone:data.phone});
 if(currentType==='task')db.tasks.unshift({id,title:data.title,caseId:Number(data.caseId),due:data.due,priority:data.priority,done:false});
 if(currentType==='hearing'){db.hearings.push({id,caseId:Number(data.caseId),date:data.date,time:data.time,court:data.court,note:data.note});const c=db.cases.find(c=>c.id===Number(data.caseId));if(c)c.hearing=data.date}
 if(currentType==='document'){db.documents.unshift({id,name:data.name,caseId:Number(data.caseId),date:data.date,type:data.docType});db.events.unshift({id,icon:'▧',title:'Document added',detail:data.name,date:iso(today)})}
 save();render();closeModal();toast('Saved successfully');
});
render();
// Demo-only login session for the separate login.html page.
const LOGIN_SESSION_KEY='lexflow-demo-session';
const REMEMBER_SESSION_KEY='lexflow-remember-session';
function hasActiveLogin(){return sessionStorage.getItem(LOGIN_SESSION_KEY)==='active'||localStorage.getItem(REMEMBER_SESSION_KEY)==='active'}
function openWorkspace(){window.location.href='login.html'}
['getStarted','landingLogin','aboutGetStarted'].forEach(id=>{const button=document.getElementById(id);if(button)button.addEventListener('click',openWorkspace)});
function logout(){if(!confirm('Log out of the workspace? Your saved cases and project data will remain on this browser.'))return;sessionStorage.removeItem(LOGIN_SESSION_KEY);localStorage.removeItem(REMEMBER_SESSION_KEY);window.location.href='index.html'}
$('#profileMenuToggle').addEventListener('click',()=>$('#accountMenu').hidden=!$('#accountMenu').hidden);
$('#logoutButton').addEventListener('click',logout);
document.querySelectorAll('[data-account]').forEach(button=>button.addEventListener('click',()=>{alert(button.dataset.account==='My Profile'?'Adv. Alex Smith\nAdministrator':'Account settings are part of this educational project.');$('#accountMenu').hidden=true}));
if(new URLSearchParams(location.search).get('workspace')==='1'&&hasActiveLogin()){$('#landingPage').hidden=true;$('#appShell').hidden=false;render()}else{$('#landingPage').hidden=false;$('#appShell').hidden=true}
