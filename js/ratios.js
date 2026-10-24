/* Bestwerte im Verhältnis (Diagnose, Schritt 1): Richtwerte nach Greg Everett, «Olympic Weightlifting», Tabelle 33.3.
   Die Werte leben nur in den Eingabefeldern: nichts wird gespeichert, eine neue Diagnose beginnt leer.
   Uses the global app functions (el, $, S, t, num, count). */
const RLIFTS = { sn:"Snatch", cj:"Clean & Jerk", cl:"Clean", jk:"Jerk", bs:"Back Squat", fs:"Front Squat",
  psn:"Power Snatch", pc:"Power Clean", dl:"Deadlift", pr:"Press", pp:"Push Press", ohs:"Overhead Squat" };
const RMAIN = ["sn","cj","bs","fs"];
// [Lift, im Verhältnis zu, Richtwert von, bis, Art der Deutung, betroffene Lifts der Diagnose]
const RATIOS = [
  ["sn","bs",60,65,"str",["sn"]],
  ["cj","bs",80,85,"str",["cl","jk"]],
  ["cj","fs",85,90,"str",["cl","jk"]],
  ["sn","cj",80,85,"sncj",["sn","cl","jk"]],
  ["fs","bs",85,93,"fsbs",["cl"]],
  ["psn","sn",80,85,"power",["sn"]],
  ["pc","cl",80,90,"power",["cl"]],
  ["cl","dl",70,75,"str",["cl"]],
  ["pr","pp",70,75,"press",["jk"]],
  ["pp","jk",75,85,"ppjk",["jk"]],
  ["ohs","bs",65,70,"ohs",["sn"]]
];
let ratiosCounted = false;
function rval(k){ const v=parseFloat(($("rv-"+k)?.value||"").replace(",",".")); return v>0 ? v : null; }
function ratioResults(){
  return RATIOS.map(([a,b,lo,hi,kind,lifts])=>{
    const va=rval(a), vb=rval(b); if(va==null||vb==null) return null;
    const p=va/vb*100, lvl = p<lo ? "low" : p>hi ? "high" : "ok";
    return { a, b, lo, hi, kind, lifts, p, lvl, text: lvl==="ok" ? t("r.ok") : t("r."+kind+"."+lvl, { a:RLIFTS[a], b:RLIFTS[b] }) };
  }).filter(Boolean);
}
function ratioRow(r){
  const pill={low:["hi",t("r.low")],high:["mid",t("r.high")],ok:["ok",t("r.inRange")]}[r.lvl];
  return el("li",{class:"ratio"},
    el("div",{class:"rtop"},el("span",{class:"rname"},RLIFTS[r.a]+" / "+RLIFTS[r.b]),el("span",{class:"pill "+pill[0]},pill[1])),
    el("div",{class:"rnums"},el("b",{class:"vtime"},Math.round(r.p)+" %"),el("span",{},t("r.target",{lo:r.lo,hi:r.hi}))),
    el("p",{class:"why"},r.text));
}
function renderRatios(){
  const res=ratioResults(), box=$("ratio-out");
  if(res.length && !ratiosCounted){ ratiosCounted=true; count("diagnosis-ratios", true); }
  box.replaceChildren(res.length ? el("ul",{class:"ratiolist"},...res.map(ratioRow)) : el("p",{class:"empty"},t("r.empty")));
}
/* Im Plan: nur die Verhältnisse zum gewählten Lift, die ausserhalb des Richtwerts liegen */
function ratioNote(lift){
  const res=ratioResults().filter(r=>r.lifts.includes(lift));
  if(!res.length) return "";
  const off=res.filter(r=>r.lvl!=="ok");
  return el("div",{class:"rationote"},el("span",{class:"label"},t("r.planH")),
    off.length ? el("ul",{class:"ratiolist"},...off.map(ratioRow)) : el("p",{class:"why"},t("r.planOk")));
}
function clearRatios(){ Object.keys(RLIFTS).forEach(k=>{ const i=$("rv-"+k); if(i) i.value=""; }); ratiosCounted=false; renderRatios(); }

/* Eingabefelder: die vier wichtigsten offen, die übrigen zum Aufklappen */
function ratioField(k){ return el("label",{class:"rfield"},el("span",{},RLIFTS[k]),
  el("span",{class:"rinput"},el("input",{id:"rv-"+k,type:"text",inputmode:"decimal",autocomplete:"off",oninput:renderRatios}),el("span",{class:"unit"},"kg"))); }
$("ratio-main").replaceChildren(...RMAIN.map(ratioField));
$("ratio-more").replaceChildren(...Object.keys(RLIFTS).filter(k=>!RMAIN.includes(k)).map(ratioField));
addEventListener("langchange", renderRatios);
renderRatios();
