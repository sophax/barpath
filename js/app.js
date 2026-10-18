/* App: pages (router), guided diagnosis, exercise library.
   Pages:  #/  ·  #/diagnosis/lift|faults|questions|plan  ·  #/video  ·  #/exercises */
const DEFAULT = {lift:"sn",sel:{sn:[],cl:[],jk:[]},ans:{}};
/* Die Diagnose lebt nur im Speicher der Seite: jeder Besuch beginnt neu, nichts wird gespeichert. */
let S = structuredClone(DEFAULT);
try{ localStorage.removeItem("lff-state"); }catch(e){} // gespeicherte Daten älterer Versionen entfernen
function freshDiagnosis(){ S.sel={sn:[],cl:[],jk:[]}; S.ans={}; }
const el = (tag, attrs={}, ...kids) => { const n=document.createElement(tag); for(const [k,v] of Object.entries(attrs)){ if(k==="class") n.className=v; else if(k.startsWith("on")) n.addEventListener(k.slice(2),v); else n.setAttribute(k,v); } kids.flat().forEach(k=>n.append(k)); return n; };
const $ = id => document.getElementById(id);

function resolveEx(item, lift){
  if(Array.isArray(item)){ if(lift==="jk") return item[0]||item[1]; return lift==="sn"?item[0]:item[1]; }
  return item;
}
function exFor(cause, lift){ const seen=new Set(); return CAUSES[cause].ex.map(i=>resolveEx(i,lift)).filter(i=>i&&BYID[i]&&!seen.has(i)&&seen.add(i)); }
const USED = new Set(); Object.keys(CAUSES).forEach(c=>["sn","cl","jk"].forEach(l=>exFor(c,l).forEach(i=>USED.add(i))));

/* ---------- Diagnosis state ---------- */
const key = (lift,q) => lift+":"+q;
const selFaults = () => LIFTS[S.lift].faults.filter(f=>S.sel[S.lift].includes(f.id));
const questionIds = () => [...new Set(selFaults().flatMap(f=>f.q))];
const answeredCount = () => questionIds().filter(q=>S.ans[key(S.lift,q)]!=null).length;
const allAnswered = () => questionIds().length>0 && answeredCount()===questionIds().length;

function compute(){
  const lift=S.lift, score={};
  const add=(c,w)=>{ if(w) score[c]=(score[c]||0)+w; };
  selFaults().forEach(f=>Object.entries(f.b).forEach(([c,w])=>add(c,w)));
  questionIds().forEach(q=>{ const a=S.ans[key(lift,q)]; const opt=a==null?null:Q[q].o[a]; if(opt) Object.entries(opt[1]).forEach(([c,w])=>add(c,w)); });
  return Object.entries(score).filter(([c])=>exFor(c,lift).length).sort((a,b)=>b[1]-a[1]).map(([c,s])=>({c,s}));
}
function resetLift(lift){ S.sel[lift]=[]; Object.keys(S.ans).forEach(k=>{ if(k.startsWith(lift+":")) delete S.ans[k]; }); }

/* ---------- Router ---------- */
const PAGES = ["home","diagnosis","video","exercises","clubs"];
const STEPS = ["lift","faults","questions","plan"];
function go(hash){ if(location.hash===hash) route(); else location.hash=hash; }
function parse(){
  const parts=(location.hash.replace(/^#\/?/,"")||"").split("/");
  const page=parts[0]||"home";
  return {page: PAGES.includes(page)?page:"home", sub: parts[1]};
}
let lastPage = null;
function route(keep){
  let {page, sub} = parse();
  // Von einer anderen Seite in die Diagnose: neu beginnen, ausser die Video-Analyse übergibt ihre Befunde
  if(page==="diagnosis" && lastPage!=="diagnosis"){ if(S.handoff) S.handoff=false; else { freshDiagnosis(); sub="lift"; } }
  lastPage = page;
  if(page==="diagnosis"){
    if(!STEPS.includes(sub)) sub = S.sel[S.lift].length ? (allAnswered()?"plan":"questions") : "lift";
    // Guards: no skipping ahead
    if(sub==="questions" && !S.sel[S.lift].length) sub="faults";
    if(sub==="plan" && !allAnswered()) sub = S.sel[S.lift].length ? "questions" : "faults";
    if(location.hash!=="#/diagnosis/"+sub){ history.replaceState(null,"","#/diagnosis/"+sub); }
  }
  PAGES.forEach(p=>{ $("page-"+p).hidden = p!==page; });
  document.querySelectorAll("nav.tabs .tab").forEach(t=>t.setAttribute("aria-current", t.dataset.page===page ? "page" : "false"));
  document.title = t("title."+page);
  if(page==="diagnosis") renderDiagnosis(sub);
  if(page==="video") renderLifts();
  if(page==="exercises") renderLib();
  if(page==="clubs" && typeof renderClubs==="function") renderClubs();
  if(keep) return;
  window.scrollTo({top:0});
  const h=$("page-"+page).querySelector("h1,h2"); if(h){ h.setAttribute("tabindex","-1"); h.focus({preventScroll:true}); }
}
addEventListener("hashchange", ()=>route());

/* ---------- Diagnosis ---------- */
function renderStepper(cur){
  const box=$("stepper"); box.replaceChildren();
  const idx=STEPS.indexOf(cur);
  STEPS.forEach((s,i)=>{
    const done=i<idx, active=i===idx;
    const reachable = i<=idx || (s==="faults") || (s==="questions"&&S.sel[S.lift].length) || (s==="plan"&&allAnswered());
    const node=el(reachable&&!active?"a":"span",{class:"node"+(done?" done":"")+(active?" active":""), ...(reachable&&!active?{href:"#/diagnosis/"+s}:{}), ...(active?{"aria-current":"step"}:{})},
      el("span",{class:"dot"},String(i+1)), el("span",{class:"nlabel"},t("step."+s)));
    box.append(node);
  });
}
function renderDiagnosis(sub){
  renderStepper(sub);
  STEPS.forEach(s=>{ $("dstep-"+s).hidden = s!==sub; });
  ({lift:renderLiftStep, faults:renderFaults, questions:renderQuestions, plan:renderPlan})[sub]();
}
function renderLiftStep(){
  const box=$("dlifts"); box.replaceChildren();
  Object.entries(LIFTS).forEach(([k,L])=>{
    const n=S.sel[k].length;
    box.append(el("button",{class:"lift lift-lg","aria-pressed":String(S.lift===k&&n>0),type:"button",onclick:e=>{
        S.lift=k; e.currentTarget.setAttribute("aria-pressed","true");
        setTimeout(()=>go("#/diagnosis/faults"),180);
      }},
      el("b",{},L.t), el("span",{},n?t("selected",{n}):L.s)));
  });
}
function renderFaults(){
  const L=LIFTS[S.lift];
  $("faults-lift").textContent=L.t;
  const box=$("faults"); box.replaceChildren();
  PHASES[S.lift].forEach(ph=>{
    const fs=L.faults.filter(f=>f.ph===ph); if(!fs.length) return;
    const chips=el("div",{class:"chips"});
    fs.forEach(f=>{ const on=S.sel[S.lift].includes(f.id);
      chips.append(el("button",{class:"chip",type:"button","aria-pressed":String(on),onclick:()=>{ const a=S.sel[S.lift]; S.sel[S.lift]=on?a.filter(x=>x!==f.id):[...a,f.id]; renderFaults(); }},f.t)); });
    box.append(el("div",{class:"phase"},el("span",{class:"lbl"},phName(ph)),chips));
  });
  const n=S.sel[S.lift].length, nq=questionIds().length;
  const next=$("faults-next");
  next.setAttribute("aria-disabled",String(!n));
  next.textContent = n ? tn("d2.next",nq) : t("d2.pick");
  $("faults-count").textContent = t("selected",{n});
}
function renderQuestions(){
  const box=$("questions"); box.replaceChildren();
  const owners={}; selFaults().forEach(f=>f.q.forEach(q=>(owners[q]=owners[q]||[]).push(f.t)));
  Object.keys(owners).forEach((q,i)=>{
    const k=key(S.lift,q), cur=S.ans[k];
    const opts=el("div",{class:"opts",role:"group","aria-label":Q[q].t});
    Q[q].o.forEach((o,j)=>opts.append(el("button",{class:"opt",type:"button","aria-pressed":String(cur===j),onclick:()=>{ if(S.ans[k]===j) delete S.ans[k]; else S.ans[k]=j; renderQuestions(); }},o[0])));
    const card=el("div",{class:"q"+(cur!=null?" answered":""),id:"q-"+q},
      el("div",{class:"qhead"},el("span",{class:"qn"},String(i+1).padStart(2,"0")),el("span",{class:"for"},owners[q].join(" · "))),
      el("span",{class:"text"},Q[q].t),opts);
    if(Q[q].how){ const d=el("details",{class:"how"},el("summary",{},t("selftest")),el("p",{},Q[q].how)); if(cur===Q[q].o.length-1) d.open=true; card.append(d); }
    box.append(card);
  });
  const total=questionIds().length, done=answeredCount();
  $("q-progress").textContent = done+" / "+total;
  const bar=$("q-meter"); bar.style.width = (total?Math.round(done/total*100):0)+"%";
  const next=$("questions-next");
  next.setAttribute("aria-disabled",String(done<total));
  next.textContent = done<total ? tn("d3.left",total-done) : t("d3.show");
}
function renderPlan(){
  const box=$("sheet"); box.replaceChildren();
  const L=LIFTS[S.lift], res=compute();
  const toast=el("span",{class:"toast",id:"toast","aria-live":"polite"});
  box.append(el("div",{class:"sheethead"},el("div",{},el("span",{class:"stepnum"},t("plan.result",{lift:L.t})),el("h2",{},t("plan.h"))),
    el("div",{class:"actions"},el("button",{class:"btn primary",type:"button",onclick:()=>sharePlan(res)},t("plan.share")))), toast);
  const faults=selFaults().map(f=>f.t);
  box.append(el("p",{class:"why"},t("plan.based",{list:faults.join(", ")})));
  if(!res.length){ box.append(el("div",{class:"empty"},t("plan.none"))); return; }
  const max=res[0].s;
  res.slice(0,5).forEach(({c,s})=>{
    const C=CAUSES[c];
    const lvl = s>=4?["hi",t("lvl.likely")]: s>=2?["mid",t("lvl.possible")]:["lo",t("lvl.check")];
    const ol=el("ol",{class:"ex"});
    exFor(c,S.lift).slice(0,6).forEach((id,i)=>{ const r=BYID[id];
      ol.append(el("li",{},el("span",{class:"n"},String(i+1).padStart(2,"0")),
        el("span",{},el("a",{href:url(id),target:"_blank",rel:"noopener"},r[1]),el("span",{class:"tag"},SEC[r[2]]||"")),
        el("span",{class:"note"},NOTE[id]||""))); });
    const meter=el("div",{class:"meter","aria-hidden":"true"}); const bar=el("i"); bar.style.width=Math.round(s/max*100)+"%"; meter.append(bar);
    box.append(el("div",{class:"cause"},
      el("div",{class:"ctop"},el("h3",{},C.t),el("span",{class:"pill "+lvl[0]},lvl[1])),
      meter, el("p",{class:"why"},C.why),
      cueEl(C.cue),
      el("p",{class:"test"},el("b",{},t("selfcheck")),C.test), ol));
  });
  if(res.length>5) box.append(el("p",{class:"lede"},t("plan.more",{n:res.length-5})));
}
/* Cue: a dark readout with an LED, the one thought to take into the next lift */
function cueEl(cue){ return cue ? el("p",{class:"cue"},el("span",{class:"led red"}),el("span",{},el("b",{},t("cue")),cue)) : ""; }

function planText(res){
  const L=LIFTS[S.lift], NL=String.fromCharCode(10);
  const faults=selFaults().map(f=>"- "+f.t).join(NL);
  const body=res.slice(0,5).map(({c})=>CAUSES[c].t+NL+"  "+t("txt.cue",{c:CAUSES[c].cue})+NL+exFor(c,S.lift).slice(0,6).map(id=>"  • "+BYID[id][1]+" – "+url(id)).join(NL)).join(NL+NL);
  return "BarPath · "+L.t+NL+NL+t("txt.faults")+NL+faults+NL+NL+t("txt.causes")+NL+body+NL;
}
/* Share: the phone's share sheet where available, otherwise copy to the clipboard */
async function shareText(title, text, toast){
  if(navigator.share){
    try{ await navigator.share({title, text}); toast.textContent=t("share.shared"); return; }
    catch(e){ if(e&&e.name==="AbortError") return; }
  }
  const fallback=()=>{ const ta=el("textarea",{style:"width:100%;min-height:160px;font:inherit",readonly:""}); ta.value=text; toast.after(ta); ta.select(); toast.textContent=t("share.manual"); };
  try{ await navigator.clipboard.writeText(text); toast.textContent=t("share.copied"); }catch(e){ fallback(); }
}
function sharePlan(res){ shareText("BarPath · "+LIFTS[S.lift].t, planText(res), $("toast")); }

/* Next buttons stay tappable: if a step isn't done, they point to what's missing */
$("faults-next").addEventListener("click",()=>{
  if(!S.sel[S.lift].length){ const m=$("faults-hint"); m.textContent=t("d2.hint"); m.classList.add("err"); return; }
  go("#/diagnosis/questions");
});
$("questions-next").addEventListener("click",()=>{
  if(!allAnswered()){
    const q=questionIds().find(q=>S.ans[key(S.lift,q)]==null), card=$("q-"+q);
    if(card){ card.scrollIntoView({behavior:"smooth",block:"center"}); card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash"); }
    return;
  }
  go("#/diagnosis/plan");
});
$("plan-new").addEventListener("click",()=>{ resetLift(S.lift); go("#/diagnosis/lift"); });

/* ---------- Lift selector on the video page ---------- */
function renderLifts(){
  const box=$("vlifts"); box.replaceChildren();
  Object.entries(LIFTS).forEach(([k,L])=>{
    box.append(el("button",{class:"lift",type:"button","aria-pressed":String(S.lift===k),onclick:()=>{S.lift=k;renderLifts();}},
      el("b",{},L.t)));
  });
}

/* ---------- Library ---------- */
function renderLib(){
  const q=$("libq").value.trim().toLowerCase(), sec=$("libsec").value, used=$("libused").checked;
  const rows=LIB.filter(r=>(!q||r[1].toLowerCase().includes(q))&&(!sec||r[2]===sec)&&(!used||USED.has(r[0]))).sort((a,b)=>a[1].localeCompare(b[1]));
  $("lib").replaceChildren(...rows.map(r=>el("li",{},el("a",{href:url(r[0]),target:"_blank",rel:"noopener"},r[1]),el("span",{class:"tag"},SEC[r[2]]||""),USED.has(r[0])?el("span",{class:"used"},t("lib.inDiag")):"")));
  $("libcount").textContent=t("lib.count",{n:rows.length,total:LIB.length});
}
const secSel=$("libsec");
function renderSecOptions(){ const v=secSel.value; secSel.replaceChildren(el("option",{value:""},t("lib.all")), ...Object.entries(SEC).map(([k,x])=>el("option",{value:k},x))); secSel.value=v; }
renderSecOptions();
["libq","libsec","libused"].forEach(id=>$(id).addEventListener("input",renderLib));

/* ---------- Language ---------- */
document.querySelectorAll(".langs button").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));
addEventListener("langchange",()=>{ renderSecOptions(); route(true); });
applyStatic();
route();
