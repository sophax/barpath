/* Zustand: Beispiel vorausgewählt, damit der erste Blick zeigt, was die App tut. */
const DEFAULT = {lift:"sn",tab:"diag",sel:{sn:["jump_back"],cl:[],jk:[]},ans:{}};
let S = load();
function load(){ try{ const v=JSON.parse(localStorage.getItem("hfd-state")); if(v&&v.sel&&v.ans) return v; }catch(e){} return structuredClone(DEFAULT); }
function save(){ try{ localStorage.setItem("hfd-state",JSON.stringify(S)); }catch(e){} }
const el = (tag, attrs={}, ...kids) => { const n=document.createElement(tag); for(const [k,v] of Object.entries(attrs)){ if(k==="class") n.className=v; else if(k.startsWith("on")) n.addEventListener(k.slice(2),v); else n.setAttribute(k,v); } kids.flat().forEach(k=>n.append(k)); return n; };

function resolveEx(item, lift){
  if(Array.isArray(item)){ if(lift==="jk") return item[0]||item[1]; return lift==="sn"?item[0]:item[1]; }
  return item;
}
function exFor(cause, lift){ const seen=new Set(); return CAUSES[cause].ex.map(i=>resolveEx(i,lift)).filter(i=>i&&BYID[i]&&!seen.has(i)&&seen.add(i)); }
const USED = new Set(); Object.keys(CAUSES).forEach(c=>["sn","cl","jk"].forEach(l=>exFor(c,l).forEach(i=>USED.add(i))));

function key(lift,q){ return lift+":"+q; }
function compute(){
  const lift=S.lift, faults=LIFTS[lift].faults.filter(f=>S.sel[lift].includes(f.id));
  const score={}, from={};
  const add=(c,w,src)=>{ if(!w) return; score[c]=(score[c]||0)+w; (from[c]=from[c]||new Set()).add(src); };
  faults.forEach(f=>Object.entries(f.b).forEach(([c,w])=>add(c,w,f.t)));
  const qs=[...new Set(faults.flatMap(f=>f.q))];
  qs.forEach(q=>{ const a=S.ans[key(lift,q)]; if(a==null) return; const opt=Q[q].o[a]; if(opt) Object.entries(opt[1]).forEach(([c,w])=>add(c,w,"Antwort")); });
  return Object.entries(score).filter(([c])=>exFor(c,lift).length).sort((a,b)=>b[1]-a[1]).map(([c,s])=>({c,s,from:from[c]}));
}

function renderLifts(){ ["lifts","vlifts"].forEach(id=>{
  const box=document.getElementById(id); box.replaceChildren();
  Object.entries(LIFTS).forEach(([k,L])=>{
    const n=S.sel[k].length;
    box.append(el("button",{class:"lift","aria-pressed":String(S.lift===k),onclick:()=>{S.lift=k;save();render();}},
      el("b",{},L.t), el("span",{},L.s+(n?" · "+n+" gewählt":""))));
  });
}); }
function renderFaults(){
  const box=document.getElementById("faults"); box.replaceChildren();
  const L=LIFTS[S.lift];
  PHASES[S.lift].forEach(ph=>{
    const fs=L.faults.filter(f=>f.ph===ph); if(!fs.length) return;
    const chips=el("div",{class:"chips"});
    fs.forEach(f=>{ const on=S.sel[S.lift].includes(f.id);
      chips.append(el("button",{class:"chip","aria-pressed":String(on),onclick:()=>{ const a=S.sel[S.lift]; S.sel[S.lift]=on?a.filter(x=>x!==f.id):[...a,f.id]; save(); render(); }},f.t)); });
    box.append(el("div",{class:"phase"},el("span",{class:"lbl"},ph),chips));
  });
}
function renderQuestions(){
  const box=document.getElementById("questions"); box.replaceChildren();
  const L=LIFTS[S.lift], faults=L.faults.filter(f=>S.sel[S.lift].includes(f.id));
  if(!faults.length){ box.append(el("div",{class:"empty"},"Wähle in Schritt 1 mindestens einen Fehler, dann erscheinen hier die passenden Fragen.")); return; }
  const owners={}; faults.forEach(f=>f.q.forEach(q=>(owners[q]=owners[q]||[]).push(f.t)));
  Object.keys(owners).forEach(q=>{
    const k=key(S.lift,q), cur=S.ans[k];
    const opts=el("div",{class:"opts",role:"group","aria-label":Q[q].t});
    Q[q].o.forEach((o,i)=>opts.append(el("button",{class:"opt","aria-pressed":String(cur===i),onclick:()=>{ if(S.ans[k]===i) delete S.ans[k]; else S.ans[k]=i; save(); render(); }},o[0])));
    const card=el("div",{class:"q"},el("span",{class:"for"},owners[q].join(" · ")),el("span",{class:"text"},Q[q].t),opts);
    if(Q[q].how){ const d=el("details",{class:"how"},el("summary",{},"Selbsttest"),el("p",{},Q[q].how)); if(cur===Q[q].o.length-1) d.open=true; card.append(d); }
    box.append(card);
  });
}
function renderSheet(){
  const box=document.getElementById("sheet"); box.replaceChildren();
  const L=LIFTS[S.lift], res=compute();
  const answered=Object.keys(S.ans).filter(k=>k.startsWith(S.lift+":")).length;
  const toast=el("span",{class:"toast",id:"toast","aria-live":"polite"});
  const head=el("div",{class:"sheethead"},el("div",{},el("span",{class:"stepnum"},"Ergebnis · "+L.t),el("h2",{},"Dein Übungsplan")),
    el("div",{class:"actions"},
      el("button",{class:"btn primary",onclick:()=>copyPlan(res)},"Plan kopieren"),
      el("button",{class:"btn",onclick:()=>{ S.sel[S.lift]=[]; Object.keys(S.ans).forEach(k=>{ if(k.startsWith(S.lift+":")) delete S.ans[k]; }); save(); render(); }},"Zurücksetzen")));
  box.append(head,toast);
  if(!res.length){ box.append(el("div",{class:"empty"},"Noch keine Auswahl für "+L.t+". Wähle links, was du bei deinem Heben siehst.")); return; }
  if(S.lift==="sn" && S.sel.sn.length===1 && S.sel.sn[0]==="jump_back" && !answered)
    box.append(el("p",{class:"lede",style:"font-size:.9rem"},"Beispiel: „Ich springe nach hinten“ ist vorausgewählt. Beantworte die Fragen, um die Ursachen einzugrenzen."));
  const max=res[0].s;
  res.slice(0,5).forEach(({c,s})=>{
    const C=CAUSES[c], rel=s/max;
    const lvl = s>=4?["hi","wahrscheinlich"]: s>=2?["mid","möglich"]:["lo","prüfen"];
    const ol=el("ol",{class:"ex"});
    exFor(c,S.lift).slice(0,6).forEach((id,i)=>{ const r=BYID[id];
      ol.append(el("li",{},el("span",{class:"n"},String(i+1).padStart(2,"0")),
        el("span",{},el("a",{href:url(id),target:"_blank",rel:"noopener"},r[1]),el("span",{class:"tag"},SEC[r[2]]||"")),
        el("span",{class:"note"},NOTE[id]||""))); });
    const meter=el("div",{class:"meter","aria-hidden":"true"}); const bar=el("i"); bar.style.width=Math.round(rel*100)+"%"; meter.append(bar);
    box.append(el("div",{class:"cause"},
      el("div",{class:"ctop"},el("h3",{},C.t),el("span",{class:"pill "+lvl[0]},lvl[1])),
      meter, el("p",{class:"why"},C.why),
      el("p",{class:"test"},el("b",{},"Selbstcheck"),C.test), ol));
  });
  if(res.length>5) box.append(el("p",{class:"lede",style:"font-size:.9rem"},(res.length-5)+" weitere Ursachen mit geringerem Gewicht. Beantworte mehr Fragen, um sie zu klären."));
}
function copyPlan(res){
  const L=LIFTS[S.lift];
  const faults=L.faults.filter(f=>S.sel[S.lift].includes(f.id)).map(f=>"- "+f.t).join("\n");
  const body=res.slice(0,5).map(({c})=>CAUSES[c].t+"\n"+exFor(c,S.lift).slice(0,6).map(id=>"  • "+BYID[id][1]+" – "+url(id)).join("\n")).join("\n\n");
  const text="Fehlerdiagnose "+L.t+"\n\nFehler:\n"+faults+"\n\nUrsachen und Übungen:\n"+body+"\n";
  const t=document.getElementById("toast");
  const fallback=()=>{ const ta=el("textarea",{style:"width:100%;min-height:160px;font:inherit",readonly:"",id:"copybox"}); ta.value=text; t.after(ta); ta.select(); t.textContent="Kopieren nicht erlaubt. Text ist markiert, kopiere ihn manuell."; };
  try{ navigator.clipboard.writeText(text).then(()=>{ t.textContent="Plan kopiert."; },fallback); }catch(e){ fallback(); }
}

/* Bibliothek */
function renderLib(){
  const q=document.getElementById("libq").value.trim().toLowerCase(), sec=document.getElementById("libsec").value, used=document.getElementById("libused").checked;
  const rows=LIB.filter(r=>(!q||r[1].toLowerCase().includes(q))&&(!sec||r[2]===sec)&&(!used||USED.has(r[0]))).sort((a,b)=>a[1].localeCompare(b[1]));
  const ul=document.getElementById("lib"); ul.replaceChildren(...rows.map(r=>el("li",{},el("a",{href:url(r[0]),target:"_blank",rel:"noopener"},r[1]),el("span",{class:"tag"},SEC[r[2]]||""),USED.has(r[0])?el("span",{class:"used"},"Diagnose"):"")));
  document.getElementById("libcount").textContent=rows.length+" von "+LIB.length+" Übungen";
}
const TABS=["diag","video","lib"];
function setTab(t){ S.tab=t; save();
  TABS.forEach(x=>{ document.getElementById("tab-"+x).setAttribute("aria-selected",String(t===x)); document.getElementById("view-"+x).hidden=t!==x; });
  if(t==="lib") renderLib();
}
function render(){ renderLifts(); renderFaults(); renderQuestions(); renderSheet(); }

const secSel=document.getElementById("libsec");
Object.entries(SEC).forEach(([k,v])=>secSel.append(el("option",{value:k},v)));
["libq","libsec","libused"].forEach(id=>document.getElementById(id).addEventListener("input",renderLib));
TABS.forEach(x=>document.getElementById("tab-"+x).addEventListener("click",()=>setTab(x)));
render(); setTab(TABS.includes(S.tab)?S.tab:"diag");
