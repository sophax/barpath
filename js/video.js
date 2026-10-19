/* Video page: upload a video, the app finds each lift and recognises which one it is, analyses on the device, shows findings with exercises.
   Uses the global catalog and app functions (S, LIFTS, CAUSES, exFor, el, url, BYID, NOTE, SEC, go). */
import { initPose, track, analyze, seek, BONES, findLifts, detectView, classify, liftName, sliceTrack } from "./analysis.js";
import { findingsImage, findingsText, shareFile } from "./share.js";

const $ = id => document.getElementById(id);
const vid = $("vid");
const FPS = 30;
const V = { a: null, b: null, ctl: null, busy: false, track: null, cls: null, parts: null, cam: null, file: false, key: null, lifts: [] };

/* Bildschirm wach halten, solange die Analyse läuft: im Hintergrund hält das Handy die Seite an */
let wake = null;
async function awake(on) {
  try {
    if (on && !wake && navigator.wakeLock && document.visibilityState === "visible") { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); }
    if (!on && wake) { const w = wake; wake = null; await w.release(); }
  } catch { /* nicht unterstützt oder abgelehnt: dann eben ohne */ }
}
document.addEventListener("visibilitychange", () => { if (V.busy) awake(true); }); // beim Zurückkommen wieder anfordern
function longWarn() {
  const w = $("vlongwarn"), d = vid.duration;
  w.hidden = !(d > 30);
  if (!w.hidden) w.textContent = t("v.longVideo", { s: Math.round(d) });
}
vid.addEventListener("loadedmetadata", longWarn);

function msg(t, err) { const m = $("vmsg"); m.textContent = t; m.classList.toggle("err", !!err); }
function progress(p) { const b = $("vprog"); b.hidden = p == null; if (p != null) b.firstElementChild.style.width = Math.round(p * 100) + "%"; }
function updateRange() {
  $("vrange").textContent = t("v.range", { a: V.a == null ? "–" : num(V.a) + " s", b: V.b == null ? "–" : num(V.b) + " s" });
  const ok = V.a != null && V.b != null && V.b > V.a;
  $("vgo").disabled = !ok || V.busy;
  $("vfind").disabled = V.busy;
  if (V.a != null && V.b != null && V.b <= V.a) msg(t("v.endBefore"), true);
  else if (ok && V.b - V.a > 14) msg(t("v.long"), true);
  else if (!V.busy) msg("");
}

$("vfile").addEventListener("change", e => {
  const f = e.target.files[0]; if (!f) return;
  V.ctl?.abort();
  V.file = true; $("vfilename").textContent = f.name.length > 24 ? f.name.slice(0, 21) + "…" : f.name;
  if (vid.src) URL.revokeObjectURL(vid.src);
  vid.src = URL.createObjectURL(f);
  V.a = V.b = null; V.track = V.cls = V.parts = V.key = null; $("vfound").replaceChildren(); $("vbox").hidden = false; $("vmarkstep").hidden = false; updateRange();
  vid.addEventListener("error", () => msg(t("v.cantPlay"), true), { once: true });
  initPose().catch(() => {}); // preload the model
  // No extra clicks: as soon as the video can be read, find the lifts and analyse the first one
  const start = () => (V.busy ? setTimeout(start, 100) : scan(true)); // wait for a stopped scan to finish
  if (vid.readyState >= 1) start(); else vid.addEventListener("loadedmetadata", start, { once: true });
});
const showTime = () => { $("vtime").textContent = num(vid.currentTime) + " s"; };
vid.addEventListener("timeupdate", showTime); vid.addEventListener("seeked", showTime);
$("vback").addEventListener("click", () => { vid.pause(); vid.currentTime = Math.max(0, vid.currentTime - 1 / FPS); });
$("vfwd").addEventListener("click", () => { vid.pause(); vid.currentTime = Math.min(vid.duration || 0, vid.currentTime + 1 / FPS); });
$("vsetA").addEventListener("click", () => { V.a = vid.currentTime; V.key = null; updateRange(); });
$("vsetB").addEventListener("click", () => { V.b = vid.currentTime; V.key = null; updateRange(); });
$("vstop").addEventListener("click", () => V.ctl?.abort());

/* Find lifts: scan the video, list each lift with the recognised name; tapping one analyses it */
const mmss = s => Math.floor(s / 60) + ":" + num(s % 60, 1).padStart(2, "0").replace(/^(\d)([.,]|$)/, "0$1$2");
function keyLabel(btn, i, name) { btn.querySelector("b").textContent = (i + 1) + " · " + name; }
function pickLift(btn, l, run) {
  if (V.busy) return;
  $("vfound").querySelectorAll(".liftkey").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
  V.a = l.a; V.b = l.b; V.key = btn; updateRange();
  vid.pause(); vid.currentTime = l.a;
  if (run) analyzeRange();
}
$("vfind").addEventListener("click", () => scan(false));
async function scan(auto) {
  if (V.busy) return;
  V.busy = true; updateRange(); $("vstop").hidden = false; V.ctl = new AbortController(); awake(true);
  $("vfound").replaceChildren();
  let final = ["", false], first = false;
  try {
    vid.pause();
    msg(t("v.loading")); progress(0);
    await initPose();
    const lifts = await findLifts(vid, { signal: V.ctl.signal, onProgress: (i, n) => { msg(t("v.scanning", { p: Math.round(i / n * 100) })); progress(i / n); } });
    if (!lifts.length) {
      final = [t("v.noneFound"), true];
      $("vmanual").open = true;
    } else {
      const keys = lifts.map((l, i) => {
        const b = el("button", { class: "liftkey", type: "button", "aria-pressed": "false", "data-i": String(i), onclick: e => pickLift(e.currentTarget, l, true) },
          el("span", { class: "led" }), el("b", {}), el("span", { class: "vtime" }, mmss(l.a) + " – " + mmss(l.b)));
        keyLabel(b, i, liftName(l));
        return b;
      });
      $("vfound").replaceChildren(...keys); V.lifts = lifts;
      V.busy = false; pickLift(keys[0], lifts[0]); V.busy = true;
      final = [tn("v.found", lifts.length), false];
      first = auto;
    }
  } catch (e) {
    if (e?.code === "cancelled") final = [t("v.scanStopped"), false];
    else if (e?.code === "video") final = [t("v.noFrames"), true];
    else { console.error(e); final = [t("v.scanFailed"), true]; }
  } finally { V.busy = false; $("vstop").hidden = true; progress(null); updateRange(); msg(final[0], final[1]); if (!first) awake(false); }
  if (first) analyzeRange(true);
}

/* Analyse the marked range: track it, recognise the lift, analyse each part (a clean & jerk has two) */
function evaluate() {
  return V.cls.parts.map(pt => {
    const tr = sliceTrack(V.track, pt.i0, pt.i1);
    return { lift: pt.lift, track: tr, r: analyze(tr, pt.lift, V.cam.view, pt.jerk) };
  });
}
$("vgo").addEventListener("click", () => { V.key = $("vfound").querySelector('[aria-pressed="true"]'); analyzeRange(); });
async function analyzeRange(auto) {
  if (V.busy || V.a == null || V.b == null || V.b <= V.a) return;
  V.busy = true; updateRange(); $("vstop").hidden = false; V.ctl = new AbortController(); awake(true);
  let final = ["", false], none = false;
  try {
    vid.pause();
    msg(t("v.loading")); progress(0);
    await initPose();
    const tr = await track(vid, V.a, V.b, { fps: FPS, signal: V.ctl.signal, onProgress: (i, n) => { msg(t("v.detecting", { i, n })); progress(i / n); } });
    V.track = tr;
    msg(t("v.evaluating"));
    V.cam = detectView(tr);
    V.cls = classify(tr);
    if (!V.cls) { V.parts = null; renderNone(); final = [t("v.unknown"), true]; none = true; }
    else {
      V.parts = evaluate();
      if (V.key) keyLabel(V.key, +V.key.dataset.i, liftName(V.cls));
      await renderResult();
      const bad = V.parts.find(p => !p.r.ok);
      final = bad ? [bad.r.summary, true] : [t("v.done"), false];
    }
  } catch (e) {
    if (e?.code === "cancelled") final = [t("v.stopped"), false];
    else if (e?.code === "video") final = [t("v.noFrames"), true];
    else { console.error(e); final = [t("v.failed"), true]; }
  } finally {
    V.busy = false; $("vstop").hidden = true; progress(null); updateRange(); msg(final[0], final[1]);
    if (!(auto && none)) { awake(false); if (V.parts) navigator.vibrate?.(120); } // fertig: kurz vibrieren (Android)
  }
  // Automatisch: war das kein erkennbarer Versuch, gleich den nächsten gefundenen nehmen
  if (auto && none && V.key) {
    const i = +V.key.dataset.i + 1, k = $("vfound").querySelectorAll(".liftkey")[i];
    if (k && V.lifts[i]) { pickLift(k, V.lifts[i]); analyzeRange(true); }
  }
}

/* Draw a frame with the skeleton */
async function snapshot(tr, i, label, w = 360) {
  const f = tr.frames[i]; if (!f) return el("span");
  await seek(vid, f.t);
  const ratio = vid.videoHeight / vid.videoWidth, c = document.createElement("canvas");
  c.width = w; c.height = Math.round(w * ratio);
  const g = c.getContext("2d"); g.drawImage(vid, 0, 0, c.width, c.height);
  if (f.p) {
    const sx = c.width / vid.videoWidth, sy = c.height / vid.videoHeight;
    g.lineWidth = 3; g.strokeStyle = "rgba(255,210,31,.95)"; g.fillStyle = "#0b4fa8";
    BONES.forEach(([a, b]) => { if (f.p[a].v > 0.3 && f.p[b].v > 0.3) { g.beginPath(); g.moveTo(f.p[a].x * sx, f.p[a].y * sy); g.lineTo(f.p[b].x * sx, f.p[b].y * sy); g.stroke(); } });
    [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach(k => { if (f.p[k].v > 0.3) { g.beginPath(); g.arc(f.p[k].x * sx, f.p[k].y * sy, 4, 0, 7); g.fill(); } });
  }
  g.fillStyle = "rgba(0,0,0,.65)"; g.fillRect(0, 0, c.width, 26);
  g.fillStyle = "#ffd21f"; g.font = "bold 15px monospace"; g.fillText((label ? label + " · " : "") + t("v.frame", { f: i + 1 }) + " · " + num(f.t) + " s", 6, 18);
  c.className = "snap"; c.setAttribute("role", "img"); c.setAttribute("aria-label", (label ? label + " · " : "") + t("v.frame", { f: i + 1 }));
  return c;
}

function renderNone() {
  $("vsheet").replaceChildren(el("div", { class: "sheethead" }, el("div", {}, el("span", { class: "stepnum" }, t("v.result")), el("h2", {}, t("v.findings")))), el("div", { class: "empty" }, t("v.unknown")));
  $("vframes").replaceChildren();
}

async function renderResult() {
  const box = $("vsheet"); box.replaceChildren();
  const name = liftName(V.cls), viewLabel = t("view." + V.cam.view), multi = V.parts.length > 1;
  const share = { lift: name, view: viewLabel, summary: V.parts.map(p => p.r.summary).join(" "), findings: [], metrics: [] };
  const toast = el("span", { class: "toast", "aria-live": "polite" });
  const shareBtns = el("div", { class: "actions" },
    el("button", { class: "btn primary", type: "button", onclick: async e => {
      const b = e.currentTarget; b.disabled = true; toast.textContent = t("v.creating");
      try { const blob = await findingsImage(share); const res = await shareFile(blob, "barpath-" + name.toLowerCase().replace(/[^a-z]+/g, "-") + ".png", "BarPath · " + name);
        toast.textContent = res === "shared" ? t("share.shared") : res === "downloaded" ? t("v.saved") : ""; }
      catch (err) { console.error(err); toast.textContent = t("v.imgFail"); }
      finally { b.disabled = false; } } }, t("v.shareImg")),
    el("button", { class: "btn", type: "button", onclick: () => shareText("BarPath · " + name, findingsText(share), toast) }, t("v.shareTxt")));
  const anyFindings = V.parts.some(p => p.r.ok && p.r.findings.length);
  box.append(el("div", { class: "sheethead" }, el("div", {}, el("span", { class: "stepnum" }, t("v.resultHead", { lift: name, view: viewLabel })), el("h2", {}, t("v.findings"))), anyFindings ? shareBtns : ""), toast);
  const faults = { sn: [], cl: [], jk: [] };
  const fr = $("vframes"); fr.replaceChildren(el("h3", {}, t("v.phases")));
  for (const { lift, track: tr, r } of V.parts) {
    const L = LIFTS[lift], part = multi ? L.t : "";
    if (multi) box.append(el("h3", { class: "parthead" }, part));
    if (!r.ok) { box.append(el("div", { class: "empty" }, r.summary)); continue; }
    box.append(el("p", { class: "why" }, r.summary));
    if (!r.findings.length) box.append(el("div", { class: "empty" }, t("v.noRule")));
    for (const f of r.findings.slice(0, 6)) {
      const lvl = f.sicherheit === "hoch" ? "hi" : f.sicherheit === "mittel" ? "mid" : "lo";
      f.fehler_ids.forEach(id => { if (L.faults.some(x => x.id === id) && !faults[lift].includes(id)) faults[lift].push(id); });
      const card = el("div", { class: "cause finding" },
        el("div", { class: "ctop" }, el("h3", {}, f.titel), el("span", { class: "pill " + lvl }, t("conf." + f.sicherheit))),
        el("span", { class: "frames" }, t("v.frame", { f: f.bilder[0] === f.bilder[1] ? String(f.bilder[0]) : f.bilder[0] + "–" + f.bilder[1] })),
        el("p", { class: "why" }, f.beobachtung));
      const shot = await snapshot(tr, f.key, part, 320);
      card.append(shot);
      const sf = { titel: (part ? part + " · " : "") + f.titel, sicherheit: f.sicherheit, beobachtung: f.beobachtung, shot, causes: [] };
      share.findings.push(sf);
      [...new Set(f.ursachen_ids)].filter(c => CAUSES[c] && exFor(c, lift).length).slice(0, 2).forEach(c => {
        const ids = exFor(c, lift).slice(0, 4);
        sf.causes.push({ t: CAUSES[c].t, cue: CAUSES[c].cue, ex: ids.map(id => BYID[id][1]), urls: ids.map(id => url(id)) });
        const ol = el("ol", { class: "ex" });
        ids.forEach((id, i) => {
          const row = BYID[id];
          ol.append(el("li", {}, el("span", { class: "n" }, String(i + 1).padStart(2, "0")),
            el("span", {}, el("a", { href: url(id), target: "_blank", rel: "noopener" }, row[1]), el("span", { class: "tag" }, SEC[row[2]] || "")),
            el("span", { class: "note" }, NOTE[id] || "")));
        });
        card.append(el("div", { class: "subcause" }, el("h4", {}, t("v.cause", { c: CAUSES[c].t })), cueEl(CAUSES[c].cue), ol));
      });
      box.append(card);
    }
    r.metrics.forEach(m => share.metrics.push({ label: (part ? part + " · " : "") + m.label, value: m.value }));
    if (r.metrics.length) {
      const tb = el("table", { class: "metrics" }, el("tbody", {}, r.metrics.map(m => el("tr", {}, el("th", {}, m.label), el("td", {}, m.value, m.note ? el("small", {}, " (" + m.note + ")") : "")))));
      box.append(el("div", { class: "cause" }, el("h3", {}, t("v.meas") + (part ? " · " + part : "")), el("div", { class: "tablewrap" }, tb)));
    }
    if (multi) fr.append(el("h4", { class: "parthead" }, part));
    const grid = el("div", { class: "snapgrid" }); fr.append(grid);
    for (const [k, i] of Object.entries(r.events)) if (i != null && i >= 0) grid.append(await snapshot(tr, i, (part ? part + " · " : "") + t("ev." + k), 260));
  }
  const na = [...new Set(V.parts.flatMap(p => p.r.notAssessable))];
  if (na.length) box.append(el("div", { class: "cause" }, el("h3", {}, t("v.na")), el("ul", { class: "na" }, na.map(x => el("li", {}, x)))));
  const first = V.parts.map(p => p.lift).find(l => faults[l].length);
  if (first) box.append(el("div", { class: "actions" }, el("button", { class: "btn primary", onclick: () => { S.lift = first; S.sel = faults; S.ans = {}; S.handoff = true; go("#/diagnosis/questions"); } }, t("v.narrow"))));
  box.append(el("p", { class: "foot" }, t("v.foot")));
}

updateRange();

/* Sprache gewechselt: Texte neu setzen, eine vorhandene Auswertung aus den gespeicherten Körperpunkten neu formulieren */
addEventListener("langchange", async () => {
  updateRange();
  if (!V.file) $("vfilename").textContent = t("v.upload");
  if (!V.busy) msg("");
  if (vid.src) longWarn();
  if (V.busy || !V.track) return;
  if (V.parts) { V.parts = evaluate(); await renderResult(); }
  else renderNone();
});
$("vfilename").textContent = t("v.upload");
