/* Video page: choose a video, mark a lift, analyse on the device, show findings with exercises.
   Uses the global catalog and app functions (S, LIFTS, CAUSES, exFor, el, url, BYID, NOTE, SEC, go). */
import { initPose, track, analyze, seek, BONES, findLifts, detectView } from "./analysis.js";
import { findingsImage, findingsText, shareFile } from "./share.js";

const $ = id => document.getElementById(id);
const vid = $("vid");
const FPS = 30;
const V = { a: null, b: null, ctl: null, busy: false, track: null, result: null, lift: null, cam: null, file: false };

function msg(t, err) { const m = $("vmsg"); m.textContent = t; m.classList.toggle("err", !!err); }
function progress(p) { const b = $("vprog"); b.hidden = p == null; if (p != null) b.firstElementChild.style.width = Math.round(p * 100) + "%"; }
function updateRange() {
  $("vrange").textContent = t("v.range", { a: V.a == null ? "–" : num(V.a) + " s", b: V.b == null ? "–" : num(V.b) + " s" });
  const ok = V.a != null && V.b != null && V.b > V.a;
  $("vgo").disabled = !ok || V.busy;
  $("vfind").disabled = V.busy;
  if (V.a != null && V.b != null && V.b <= V.a) msg(t("v.endBefore"), true);
  else if (ok && V.b - V.a > 6) msg(t("v.long"), true);
  else if (!V.busy) msg("");
}

$("vfile").addEventListener("change", e => {
  const f = e.target.files[0]; if (!f) return;
  V.file = true; $("vfilename").textContent = f.name.length > 24 ? f.name.slice(0, 21) + "…" : f.name;
  if (vid.src) URL.revokeObjectURL(vid.src);
  vid.src = URL.createObjectURL(f);
  V.a = V.b = null; $("vfound").replaceChildren(); $("vbox").hidden = false; $("vmarkstep").hidden = false; updateRange();
  vid.addEventListener("error", () => msg(t("v.cantPlay"), true), { once: true });
  initPose().catch(() => {}); // preload the model
});
const showTime = () => { $("vtime").textContent = num(vid.currentTime) + " s"; };
vid.addEventListener("timeupdate", showTime); vid.addEventListener("seeked", showTime);
$("vback").addEventListener("click", () => { vid.pause(); vid.currentTime = Math.max(0, vid.currentTime - 1 / FPS); });
$("vfwd").addEventListener("click", () => { vid.pause(); vid.currentTime = Math.min(vid.duration || 0, vid.currentTime + 1 / FPS); });
$("vsetA").addEventListener("click", () => { V.a = vid.currentTime; updateRange(); });
$("vsetB").addEventListener("click", () => { V.b = vid.currentTime; updateRange(); });
$("vstop").addEventListener("click", () => V.ctl?.abort());

/* Find lifts: scan the video, list each lift as a key; tapping one sets start and end */
const mmss = s => Math.floor(s / 60) + ":" + num(s % 60, 1).padStart(2, "0").replace(/^(\d)([.,]|$)/, "0$1$2");
function pickLift(btn, l) {
  $("vfound").querySelectorAll(".liftkey").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
  V.a = l.a; V.b = l.b; updateRange();
  vid.pause(); vid.currentTime = l.a;
}
$("vfind").addEventListener("click", async () => {
  const lift = S.lift;
  V.busy = true; updateRange(); $("vstop").hidden = false; V.ctl = new AbortController();
  $("vfound").replaceChildren();
  let final = ["", false];
  try {
    vid.pause();
    msg(t("v.loading")); progress(0);
    await initPose();
    const lifts = await findLifts(vid, lift, { signal: V.ctl.signal, onProgress: (i, n) => { msg(t("v.scanning", { p: Math.round(i / n * 100) })); progress(i / n); } });
    if (!lifts.length) {
      final = [t("v.noneFound", { lift: LIFTS[lift].t }), true];
      $("vmanual").open = true;
    } else {
      const keys = lifts.map((l, i) => el("button", { class: "liftkey", type: "button", "aria-pressed": "false", onclick: e => pickLift(e.currentTarget, l) },
        el("span", { class: "led" }), el("b", {}, LIFTS[lift].t + " " + (i + 1)), el("span", { class: "vtime" }, mmss(l.a) + " – " + mmss(l.b))));
      $("vfound").replaceChildren(...keys);
      pickLift(keys[0], lifts[0]);
      final = [tn("v.found", lifts.length), false];
    }
  } catch (e) {
    if (e?.code === "cancelled") final = [t("v.scanStopped"), false];
    else if (e?.code === "video") final = [t("v.noFrames"), true];
    else { console.error(e); final = [t("v.scanFailed"), true]; }
  } finally { V.busy = false; $("vstop").hidden = true; progress(null); updateRange(); msg(final[0], final[1]); }
});

$("vgo").addEventListener("click", async () => {
  const lift = S.lift;
  V.busy = true; updateRange(); $("vstop").hidden = false; V.ctl = new AbortController();
  let final = ["", false];
  try {
    vid.pause();
    msg(t("v.loading")); progress(0);
    await initPose();
    const tr = await track(vid, V.a, V.b, { fps: FPS, signal: V.ctl.signal, onProgress: (i, n) => { msg(t("v.detecting", { i, n })); progress(i / n); } });
    V.track = tr;
    msg(t("v.evaluating"));
    const cam = detectView(tr);
    const r = analyze(tr, lift, cam.view);
    V.result = r; V.lift = lift; V.cam = cam;
    await renderResult(r, lift, t("view." + cam.view));
    final = r.ok ? [t("v.done"), false] : [r.summary, true];
  } catch (e) {
    if (e?.code === "cancelled") final = [t("v.stopped"), false];
    else if (e?.code === "video") final = [t("v.noFrames"), true];
    else { console.error(e); final = [t("v.failed"), true]; }
  } finally { V.busy = false; $("vstop").hidden = true; progress(null); updateRange(); msg(final[0], final[1]); }
});

/* Draw a frame with the skeleton */
async function snapshot(i, label, w = 360) {
  const f = V.track.frames[i]; if (!f) return el("span");
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


async function renderResult(r, lift, viewLabel) {
  const box = $("vsheet"); box.replaceChildren();
  const L = LIFTS[lift];
  const share = { lift: L.t, view: viewLabel, summary: r.summary, findings: [], metrics: r.metrics.map(m => ({ label: m.label, value: m.value })) };
  const toast = el("span", { class: "toast", "aria-live": "polite" });
  const shareBtns = el("div", { class: "actions" },
    el("button", { class: "btn primary", type: "button", onclick: async e => {
      const b = e.currentTarget; b.disabled = true; toast.textContent = t("v.creating");
      try { const blob = await findingsImage(share); const res = await shareFile(blob, "barpath-" + L.t.toLowerCase() + ".png", "BarPath · " + L.t);
        toast.textContent = res === "shared" ? t("share.shared") : res === "downloaded" ? t("v.saved") : ""; }
      catch (err) { console.error(err); toast.textContent = t("v.imgFail"); }
      finally { b.disabled = false; } } }, t("v.shareImg")),
    el("button", { class: "btn", type: "button", onclick: () => shareText("BarPath · " + L.t, findingsText(share), toast) }, t("v.shareTxt")));
  box.append(el("div", { class: "sheethead" }, el("div", {}, el("span", { class: "stepnum" }, t("v.resultHead", { lift: L.t, view: viewLabel })), el("h2", {}, t("v.findings"))), r.ok && r.findings.length ? shareBtns : ""), toast);
  if (!r.ok) { box.append(el("div", { class: "empty" }, r.summary)); $("vframes").replaceChildren(); return; }
  box.append(el("p", { class: "why" }, r.summary));
  const faultIds = new Set();
  if (!r.findings.length) box.append(el("div", { class: "empty" }, t("v.noRule")));
  for (const f of r.findings.slice(0, 6)) {
    const lvl = f.sicherheit === "hoch" ? "hi" : f.sicherheit === "mittel" ? "mid" : "lo";
    f.fehler_ids.forEach(id => { if (L.faults.some(x => x.id === id)) faultIds.add(id); });
    const card = el("div", { class: "cause finding" },
      el("div", { class: "ctop" }, el("h3", {}, f.titel), el("span", { class: "pill " + lvl }, t("conf." + f.sicherheit))),
      el("span", { class: "frames" }, t("v.frame", { f: f.bilder[0] === f.bilder[1] ? String(f.bilder[0]) : f.bilder[0] + "–" + f.bilder[1] })),
      el("p", { class: "why" }, f.beobachtung));
    const shot = await snapshot(f.key, "", 320);
    card.append(shot);
    const sf = { titel: f.titel, sicherheit: f.sicherheit, beobachtung: f.beobachtung, shot, causes: [] };
    share.findings.push(sf);
    [...new Set(f.ursachen_ids)].filter(c => CAUSES[c] && exFor(c, lift).length).slice(0, 2).forEach(c => {
      const ids = exFor(c, lift).slice(0, 4);
      sf.causes.push({ t: CAUSES[c].t, cue: CAUSES[c].cue, ex: ids.map(id => BYID[id][1]), urls: ids.map(id => url(id)) });
      const ol = el("ol", { class: "ex" });
      exFor(c, lift).slice(0, 4).forEach((id, i) => {
        const row = BYID[id];
        ol.append(el("li", {}, el("span", { class: "n" }, String(i + 1).padStart(2, "0")),
          el("span", {}, el("a", { href: url(id), target: "_blank", rel: "noopener" }, row[1]), el("span", { class: "tag" }, SEC[row[2]] || "")),
          el("span", { class: "note" }, NOTE[id] || "")));
      });
      card.append(el("div", { class: "subcause" }, el("h4", {}, t("v.cause", { c: CAUSES[c].t })), cueEl(CAUSES[c].cue), ol));
    });
    box.append(card);
  }
  if (r.metrics.length) {
    const tb = el("table", { class: "metrics" }, el("tbody", {}, r.metrics.map(m => el("tr", {}, el("th", {}, m.label), el("td", {}, m.value, m.note ? el("small", {}, " (" + m.note + ")") : "")))));
    box.append(el("div", { class: "cause" }, el("h3", {}, t("v.meas")), el("div", { class: "tablewrap" }, tb)));
  }
  if (r.notAssessable.length) box.append(el("div", { class: "cause" }, el("h3", {}, t("v.na")), el("ul", { class: "na" }, r.notAssessable.map(x => el("li", {}, x)))));
  if (faultIds.size) box.append(el("div", { class: "actions" }, el("button", { class: "btn primary", onclick: () => { S.lift = lift; S.sel = { sn: [], cl: [], jk: [] }; S.ans = {}; S.sel[lift] = [...faultIds]; S.handoff = true; go("#/diagnosis/questions"); } }, t("v.narrow"))));
  box.append(el("p", { class: "foot" }, t("v.foot")));

  const fr = $("vframes"); fr.replaceChildren(el("h3", {}, t("v.phases")));
  const grid = el("div", { class: "snapgrid" }); fr.append(grid);
  for (const [k, i] of Object.entries(r.events)) if (i != null && i >= 0) grid.append(await snapshot(i, t("ev." + k), 260));
}

updateRange();

/* Sprache gewechselt: Texte neu setzen, eine vorhandene Auswertung aus den gespeicherten Körperpunkten neu formulieren */
addEventListener("langchange", async () => {
  updateRange();
  if (!V.file) $("vfilename").textContent = t("v.upload");
  if (!V.busy) msg("");
  if (V.track && V.result && !V.busy) {
    const r = analyze(V.track, V.lift, V.cam.view);
    V.result = r;
    await renderResult(r, V.lift, t("view." + V.cam.view));
  }
});
$("vfilename").textContent = t("v.upload");
