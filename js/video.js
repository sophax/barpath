/* Video page: choose a video, mark a lift, analyse on the device, show findings with exercises.
   Uses the global catalog and app functions (S, LIFTS, CAUSES, exFor, el, url, BYID, NOTE, SEC, save, go). */
import { initPose, track, analyze, seek, BONES } from "./analysis.js";

const $ = id => document.getElementById(id);
const vid = $("vid");
const FPS = 30;
const VIEWS = { side: "Side view", "oblique-front": "Diagonal front", "oblique-back": "Diagonal back", front: "Front view", back: "Rear view" };
const V = { a: null, b: null, ctl: null, busy: false, track: null, result: null };

function msg(t, err) { const m = $("vmsg"); m.textContent = t; m.classList.toggle("err", !!err); }
function progress(p) { const b = $("vprog"); b.hidden = p == null; if (p != null) b.firstElementChild.style.width = Math.round(p * 100) + "%"; }
function updateRange() {
  $("vrange").textContent = "Start " + (V.a == null ? "–" : V.a.toFixed(2) + " s") + " · End " + (V.b == null ? "–" : V.b.toFixed(2) + " s");
  const ok = V.a != null && V.b != null && V.b > V.a;
  $("vgo").disabled = !ok || V.busy;
  if (V.a != null && V.b != null && V.b <= V.a) msg("The end has to be after the start.", true);
  else if (ok && V.b - V.a > 6) msg("The clip is longer than 6 s. The analysis will take longer.", true);
  else if (!V.busy) msg("");
}

$("vfile").addEventListener("change", e => {
  const f = e.target.files[0]; if (!f) return;
  if (vid.src) URL.revokeObjectURL(vid.src);
  vid.src = URL.createObjectURL(f);
  V.a = V.b = null; $("vbox").hidden = false; $("vmarkstep").hidden = false; updateRange();
  vid.addEventListener("error", () => msg("This browser can't play the video. Try an MP4 file.", true), { once: true });
  initPose().catch(() => {}); // preload the model
});
const showTime = () => { $("vtime").textContent = vid.currentTime.toFixed(2) + " s"; };
vid.addEventListener("timeupdate", showTime); vid.addEventListener("seeked", showTime);
$("vback").addEventListener("click", () => { vid.pause(); vid.currentTime = Math.max(0, vid.currentTime - 1 / FPS); });
$("vfwd").addEventListener("click", () => { vid.pause(); vid.currentTime = Math.min(vid.duration || 0, vid.currentTime + 1 / FPS); });
$("vsetA").addEventListener("click", () => { V.a = vid.currentTime; updateRange(); });
$("vsetB").addEventListener("click", () => { V.b = vid.currentTime; updateRange(); });
$("vstop").addEventListener("click", () => V.ctl?.abort());

$("vgo").addEventListener("click", async () => {
  const lift = S.lift, viewKey = $("vangle").value, view = viewKey.startsWith("oblique") ? "oblique" : viewKey;
  V.busy = true; updateRange(); $("vstop").hidden = false; V.ctl = new AbortController();
  let final = ["", false];
  try {
    vid.pause();
    msg("Loading the pose model …"); progress(0);
    await initPose();
    const t = await track(vid, V.a, V.b, { fps: FPS, signal: V.ctl.signal, onProgress: (i, n) => { msg("Detecting body points: frame " + i + " of " + n); progress(i / n); } });
    V.track = t;
    msg("Evaluating …");
    const r = analyze(t, lift, view);
    V.result = r;
    await renderResult(r, lift, VIEWS[viewKey]);
    final = r.ok ? ["Analysis complete.", false] : [r.summary, true];
  } catch (e) {
    if (e?.code === "cancelled") final = ["Analysis stopped.", false];
    else if (e?.code === "video") final = ["The video can't be read frame by frame. Try an MP4 file.", true];
    else { console.error(e); final = ["The analysis failed. Reload the page and try again.", true]; }
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
  g.fillStyle = "#ffd21f"; g.font = "bold 15px monospace"; g.fillText((label ? label + " · " : "") + "Frame " + (i + 1) + " · " + f.t.toFixed(2) + " s", 6, 18);
  c.className = "snap"; c.setAttribute("role", "img"); c.setAttribute("aria-label", (label || "Frame") + " " + (i + 1));
  return c;
}

const EVENT_LABELS = { start: "Lift-off", knie: "Knee", streckung: "Extension", empfang: "Catch", tiefster: "Lowest point", stand: "Standing", dip: "Dip", drive: "Drive", fuesse: "Feet move", fest: "Lockout" };

async function renderResult(r, lift, viewLabel) {
  const box = $("vsheet"); box.replaceChildren();
  const L = LIFTS[lift];
  box.append(el("div", { class: "sheethead" }, el("div", {}, el("span", { class: "stepnum" }, "Result · " + L.t + " · " + viewLabel), el("h2", {}, "Video findings"))));
  if (!r.ok) { box.append(el("div", { class: "empty" }, r.summary)); $("vframes").replaceChildren(); return; }
  box.append(el("p", { class: "why" }, r.summary));
  const faultIds = new Set();
  if (!r.findings.length) box.append(el("div", { class: "empty" }, "No measurement rule was triggered. That doesn't mean everything is perfect: the app can't see every fault. The diagnosis questionnaire can help."));
  for (const f of r.findings.slice(0, 6)) {
    const lvl = f.sicherheit === "hoch" ? "hi" : f.sicherheit === "mittel" ? "mid" : "lo";
    f.fehler_ids.forEach(id => { if (L.faults.some(x => x.id === id)) faultIds.add(id); });
    const card = el("div", { class: "cause finding" },
      el("div", { class: "ctop" }, el("h3", {}, f.titel), el("span", { class: "pill " + lvl }, "Confidence " + ({hoch:"high",mittel:"medium",niedrig:"low"}[f.sicherheit]))),
      el("span", { class: "frames" }, "Frame " + (f.bilder[0] === f.bilder[1] ? f.bilder[0] : f.bilder[0] + "–" + f.bilder[1])),
      el("p", { class: "why" }, f.beobachtung));
    card.append(await snapshot(f.key, "", 320));
    [...new Set(f.ursachen_ids)].filter(c => CAUSES[c] && exFor(c, lift).length).slice(0, 2).forEach(c => {
      const ol = el("ol", { class: "ex" });
      exFor(c, lift).slice(0, 4).forEach((id, i) => {
        const row = BYID[id];
        ol.append(el("li", {}, el("span", { class: "n" }, String(i + 1).padStart(2, "0")),
          el("span", {}, el("a", { href: url(id), target: "_blank", rel: "noopener" }, row[1]), el("span", { class: "tag" }, SEC[row[2]] || "")),
          el("span", { class: "note" }, NOTE[id] || "")));
      });
      card.append(el("div", { class: "subcause" }, el("h4", {}, "Cause: " + CAUSES[c].t), ol));
    });
    box.append(card);
  }
  if (r.metrics.length) {
    const tb = el("table", { class: "metrics" }, el("tbody", {}, r.metrics.map(m => el("tr", {}, el("th", {}, m.label), el("td", {}, m.value, m.note ? el("small", {}, " (" + m.note + ")") : "")))));
    box.append(el("div", { class: "cause" }, el("h3", {}, "Measurements"), el("div", { class: "tablewrap" }, tb)));
  }
  if (r.notAssessable.length) box.append(el("div", { class: "cause" }, el("h3", {}, "Not assessable from this video"), el("ul", { class: "na" }, r.notAssessable.map(x => el("li", {}, x)))));
  if (faultIds.size) box.append(el("div", { class: "actions" }, el("button", { class: "btn primary", onclick: () => { S.lift = lift; S.sel[lift] = [...faultIds]; save(); go("#/diagnosis/questions"); } }, "Narrow it down in the diagnosis")));
  box.append(el("p", { class: "foot" }, "Automatic measurement from pose detection. The thresholds are guidelines and don't replace a coach."));

  const fr = $("vframes"); fr.replaceChildren(el("h3", {}, "Detected phases"));
  const grid = el("div", { class: "snapgrid" }); fr.append(grid);
  for (const [k, i] of Object.entries(r.events)) if (i != null && i >= 0) grid.append(await snapshot(i, EVENT_LABELS[k] || k, 260));
}

updateRange();
