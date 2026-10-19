/* Video-Analyse auf dem Gerät: MediaPipe Pose findet die Körperpunkte, Messregeln leiten daraus Fehler ab.
   Koordinaten: Pixel, y wächst nach unten. Höhen werden auf die Körperlänge L (Schulter–Knöchel im Stand) normiert. */
import { PoseLandmarker, FilesetResolver } from "../vendor/mediapipe/vision_bundle.mjs";

let landmarker = null;
let ts = 0;

export async function initPose() {
  if (landmarker) return landmarker;
  const files = await FilesetResolver.forVisionTasks(new URL("../vendor/mediapipe/wasm", import.meta.url).href);
  const opts = delegate => ({
    baseOptions: { modelAssetPath: new URL("../models/pose_landmarker_full.task", import.meta.url).href, delegate },
    runningMode: "VIDEO", numPoses: 2,
    minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5
  });
  try { landmarker = await PoseLandmarker.createFromOptions(files, opts("GPU")); }
  catch (e) { landmarker = await PoseLandmarker.createFromOptions(files, opts("CPU")); }
  return landmarker;
}

export function seek(video, t) {
  return new Promise((resolve, reject) => {
    const done = () => { clearTimeout(timer); video.removeEventListener("seeked", done); resolve(); };
    const timer = setTimeout(() => { video.removeEventListener("seeked", done); reject({ code: "video" }); }, 5000);
    video.addEventListener("seeked", done);
    video.currentTime = Math.abs(video.currentTime - t) < 1e-3 ? t + 0.002 : t;
  });
}

/* Bilder lesen durch Abspielen statt Springen. Springen dekodiert jedes Mal ab dem letzten Schlüsselbild,
   bei Handyvideos (1080p, HEVC) dauert das pro Bild ein Vielfaches der Erkennung. Beim Abspielen liefert
   requestVideoFrameCallback jedes Bild mit seiner Zeit. step(t) läuft höchstens alle `every` Sekunden Videozeit;
   die Abspielgeschwindigkeit passt sich laufend an, wie lange die Erkennung pro Bild braucht.
   Ohne requestVideoFrameCallback oder wenn das Abspielen nicht startet: wie bisher Bild für Bild springen. */
const RVFC = typeof HTMLVideoElement !== "undefined" && "requestVideoFrameCallback" in HTMLVideoElement.prototype;
function playRead(video, a, b, every, step, { signal, maxRate = 8, minRate = 0.25 } = {}) {
  return new Promise(async (resolve, reject) => {
    try { await seek(video, a); } catch (e) { return reject(e); }
    const muted = video.muted, rate0 = video.playbackRate;
    let next = a, cost = 35, done = false, last = performance.now(), got = 0, mode = RVFC ? "frames" : "poll";
    const rateFor = () => Math.min(maxRate, Math.max(minRate, 0.85 * every * 1000 / (cost + 4)));
    const finish = err => {
      if (done) return; done = true; clearInterval(watch);
      video.pause(); video.playbackRate = rate0; video.muted = muted;
      err ? reject(err) : resolve();
    };
    const handle = t => {
      last = performance.now();
      if (t >= b - 1e-3) return finish(got ? null : { code: "noplay" });
      if (t + 1e-3 < next) return;
      const t0 = performance.now();
      try { step(t); } catch (e) { return finish(e); }
      got++;
      cost = cost * 0.7 + (performance.now() - t0) * 0.3;
      video.playbackRate = rateFor();
      next = t + every * 0.6;
    };
    // Normalfall: jedes angezeigte Bild mit seiner genauen Zeit
    const onFrame = (now, meta) => { if (done || mode !== "frames") return; handle(meta.mediaTime); if (!done) video.requestVideoFrameCallback(onFrame); };
    // Ersatz, falls der Browser keine Bilder meldet (z.B. nicht sichtbar): aktuelle Zeit ablesen
    const poll = () => { if (done) return; if (!video.paused && !video.seeking) handle(video.currentTime); setTimeout(poll, 4); };
    const watch = setInterval(() => {
      if (signal?.aborted) return finish({ code: "cancelled" });
      if (video.ended) return finish(got ? null : { code: "noplay" });
      if (document.hidden) { last = performance.now(); return; } // im Hintergrund hält der Browser das Video an
      if (video.paused && !video.seeking) video.play().catch(() => {});
      if (performance.now() - last > 6000) finish({ code: got ? "video" : "noplay" });
    }, 400);
    video.muted = true; video.playbackRate = rateFor();
    if (mode === "frames") {
      video.requestVideoFrameCallback(onFrame);
      // Keine Bilder gemeldet: zurück an den Anfang und die Zeit ablesen
      setTimeout(() => {
        if (done || got || mode !== "frames") return;
        mode = "poll"; video.pause();
        seek(video, a).then(() => { next = a; last = performance.now(); video.play().catch(() => {}); poll(); }, finish);
      }, 700);
    } else poll();
    video.addEventListener("ended", () => finish(got ? null : { code: "noplay" }), { once: true });
    video.play().catch(() => finish({ code: "noplay" }));
  });
}
async function readFrames(video, a, b, every, step, { signal, maxRate } = {}) {
  try { return await playRead(video, a, b, every, step, { signal, maxRate }); }
  catch (e) { if (e?.code !== "noplay") throw e; }
  const n = Math.max(1, Math.round((b - a) / every));
  for (let i = 0; i < n; i++) {
    if (signal?.aborted) throw { code: "cancelled" };
    const t = a + i * every;
    await seek(video, t);
    step(t);
    if (i % 4 === 3) await new Promise(r => setTimeout(r, 0));
  }
}

/* MediaPipe-Indizes */
const K = { nose: 0, earL: 7, earR: 8, shL: 11, shR: 12, elL: 13, elR: 14, wrL: 15, wrR: 16, hipL: 23, hipR: 24, knL: 25, knR: 26, anL: 27, anR: 28, heelL: 29, heelR: 30, toeL: 31, toeR: 32 };
export const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28], [27, 29], [29, 31], [27, 31], [28, 30], [30, 32], [28, 32]];

function center(p) { const h = mid(p, K.hipL, K.hipR); return h; }
function size(p) { const xs = p.map(q => q.x), ys = p.map(q => q.y); return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)); }

/* Bei mehreren Personen: zuerst die grösste, danach die, deren Hüfte am nächsten an der vorherigen liegt. */
/* box = {x, y, s}: quadratischer Ausschnitt in Videopixeln, auf den die Erkennung lief */
function pick(poses, prev, box) {
  if (!poses || !poses.length) return null;
  const conv = poses.map(lm => lm.map(q => ({ x: box.x + q.x * box.s, y: box.y + q.y * box.s, v: q.visibility ?? 1 })));
  if (!prev) return conv.sort((a, b) => size(b) - size(a))[0];
  const c = center(prev);
  return conv.sort((a, b) => dist(center(a), c) - dist(center(b), c))[0];
}

const CROP = 512;
/* Ausschnitt um die Person aus mehreren Momenten: alle Punkte umschliessen, oben viel Platz für die Stange über dem Kopf. */
function cropBox(poses, W, H) {
  const pts = poses.flat();
  const x0 = Math.min(...pts.map(q => q.x)), x1 = Math.max(...pts.map(q => q.x));
  const y0 = Math.min(...pts.map(q => q.y)), y1 = Math.max(...pts.map(q => q.y));
  const hgt = y1 - y0, wid = x1 - x0;
  const s = Math.min(Math.max(W, H), Math.max(hgt * 1.7, wid * 1.8, 220));
  if (s >= Math.max(W, H) * 0.8) return { x: 0, y: 0, s: Math.max(W, H) }; // Person füllt das Bild schon: kein Zoom
  const cx = (x0 + x1) / 2, bottom = Math.min(H + s * 0.05, y1 + hgt * 0.12);
  return { x: cx - s / 2, y: bottom - s, s };
}

export async function track(video, a, b, { fps = 30, onProgress, signal } = {}) {
  const lm = await initPose();
  const W = video.videoWidth, H = video.videoHeight;
  const n = Math.max(2, Math.round((b - a) * fps) + 1);
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = CROP;
  const g = canvas.getContext("2d", { willReadFrequently: false });
  // 1. Durchgang: Person im ganzen Bild finden, am Anfang, in der Mitte und am Ende des Ausschnitts
  const full = { x: 0, y: 0, s: Math.max(W, H) };
  const draw = box => { g.fillStyle = "#000"; g.fillRect(0, 0, CROP, CROP); const k = CROP / box.s; g.drawImage(video, -box.x * k, -box.y * k, W * k, H * k); };
  const probes = [];
  let first = null;
  for (const t of [a, a + (b - a) * 0.5, a + (b - a) * 0.8, b]) {
    await seek(video, t); draw(full); ts += 34;
    const p = pick(lm.detectForVideo(canvas, ts).landmarks, first, full);
    if (p) { probes.push(p.filter(q => q.v > 0.3)); if (!first) first = p; }
  }
  const box = probes.length ? cropBox(probes, W, H) : full;
  // 2. Durchgang: jedes Bild im vergrösserten Ausschnitt
  // Feste Bildfolge mit `fps`; jedes gelesene Bild kommt in den nächstgelegenen Platz
  const frames = Array.from({ length: n }, (_, i) => ({ i, t: a + i / fps, p: null }));
  const seen = new Uint8Array(n);
  let prev = first, filled = 0;
  await readFrames(video, a, b + 0.5 / fps, 1 / fps, t => {
    const i = Math.round((t - a) * fps);
    if (i < 0 || i >= n || seen[i]) return;
    draw(box); ts += 34;
    const p = pick(lm.detectForVideo(canvas, ts).landmarks, prev, box);
    if (p) prev = p;
    frames[i].p = p; seen[i] = 1; filled++;
    onProgress?.(Math.min(n, i + 1), n);
  }, { signal, maxRate: 2 });
  // Beim Abspielen ausgelassene Bilder aus den Nachbarn ergänzen (nur kurze Lücken)
  for (let i = 0; i < n; i++) {
    if (seen[i]) continue;
    let l = i - 1, r = i + 1;
    while (l >= 0 && !seen[l]) l--;
    while (r < n && !seen[r]) r++;
    const L = l >= 0 ? frames[l].p : null, R = r < n ? frames[r].p : null;
    if ((r - l) > 6 || !(L || R)) continue;
    if (!L || !R) { frames[i].p = (L || R).map(q => ({ ...q })); continue; }
    const u = (i - l) / (r - l);
    frames[i].p = L.map((q, k) => ({ x: q.x + (R[k].x - q.x) * u, y: q.y + (R[k].y - q.y) * u, v: Math.min(q.v, R[k].v) }));
  }
  return { frames, W, H, fps, box, read: filled };
}

/* ---------- Geometrie ---------- */
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function mid(p, l, r) {
  const A = p[l], B = p[r], wa = Math.max(A.v, 0.05), wb = Math.max(B.v, 0.05);
  return { x: (A.x * wa + B.x * wb) / (wa + wb), y: (A.y * wa + B.y * wb) / (wa + wb), v: (A.v + B.v) / 2 };
}
function angle(a, b, c) { // Winkel bei b in Grad
  const v1 = { x: a.x - b.x, y: a.y - b.y }, v2 = { x: c.x - b.x, y: c.y - b.y };
  const d = (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y) || 1);
  return Math.acos(Math.max(-1, Math.min(1, d))) * 180 / Math.PI;
}
function sideAngle(p, a, b, c, a2, b2, c2) { // besser sichtbare Seite, bei beiden gut der Mittelwert
  const v1 = Math.min(p[a].v, p[b].v, p[c].v), v2 = Math.min(p[a2].v, p[b2].v, p[c2].v);
  const x1 = angle(p[a], p[b], p[c]), x2 = angle(p[a2], p[b2], p[c2]);
  if (v1 > 0.6 && v2 > 0.6) return (x1 + x2) / 2;
  return v1 >= v2 ? x1 : x2;
}
const median = arr => { const s = arr.filter(Number.isFinite).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const pct = (arr, q) => { const s = arr.filter(Number.isFinite).sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : NaN; };
function fill(arr) { // Lücken linear füllen
  const out = arr.slice(); let last = -1;
  for (let i = 0; i < out.length; i++) {
    if (Number.isFinite(out[i])) {
      if (last >= 0 && i - last > 1) for (let k = last + 1; k < i; k++) out[k] = out[last] + (out[i] - out[last]) * (k - last) / (i - last);
      else if (last < 0) for (let k = 0; k < i; k++) out[k] = out[i];
      last = i;
    }
  }
  if (last >= 0) for (let k = last + 1; k < out.length; k++) out[k] = out[last];
  return out;
}
function smooth(arr) { return arr.map((_, i) => { let s = 0, c = 0; for (let k = i - 1; k <= i + 1; k++) if (k >= 0 && k < arr.length) { s += arr[k]; c++; } return s / c; }); }
function med5(arr) { return arr.map((_, i) => median(arr.slice(Math.max(0, i - 2), i + 3))); }
const S = arr => smooth(med5(fill(arr)));

/* ---------- Reihen ---------- */
function series(track) {
  const F = track.frames, n = F.length;
  const g = (fn) => S(F.map(f => (f.p ? fn(f.p) : NaN)));
  const pt = (l, r) => F.map(f => (f.p ? (r == null ? f.p[l] : mid(f.p, l, r)) : null));
  const sh = pt(K.shL, K.shR), hip = pt(K.hipL, K.hipR), kn = pt(K.knL, K.knR), an = pt(K.anL, K.anR), wr = pt(K.wrL, K.wrR), ear = pt(K.earL, K.earR), nose = pt(K.nose);
  const L = pct(F.map((f, i) => (f.p ? dist(sh[i], an[i]) : NaN)), 0.95) || track.H / 2;
  const floor = median(an.slice(0, Math.min(8, n)).map(q => q?.y));
  const h = arr => S(arr.map(q => (q ? (floor - q.y) / L : NaN)));
  const xs = arr => S(arr.map(q => (q ? q.x / L : NaN)));
  // Blickrichtung aus Ferse→Zehe, sonst Ohr→Nase
  const dirs = F.map(f => {
    if (!f.p) return NaN;
    const heel = mid(f.p, K.heelL, K.heelR), toe = mid(f.p, K.toeL, K.toeR);
    if (Math.min(heel.v, toe.v) > 0.5 && Math.abs(toe.x - heel.x) > 3) return Math.sign(toe.x - heel.x);
    const e = mid(f.p, K.earL, K.earR);
    return Math.abs(f.p[K.nose].x - e.x) > 2 ? Math.sign(f.p[K.nose].x - e.x) : NaN;
  });
  const face = Math.sign(median(dirs)) || 1;
  const vis = median(F.map(f => (f.p ? median([K.shL, K.shR, K.hipL, K.hipR, K.knL, K.knR, K.anL, K.anR, K.wrL, K.wrR].map(k => f.p[k].v)) : 0)));
  return {
    n, L, face, vis, found: F.filter(f => f.p).length / n,
    hWr: h(wr), hSh: h(sh), hHip: h(hip), hKn: h(kn), hNose: h(nose), hAn: h(an),
    xHip: xs(hip), xSh: xs(sh), xWr: xs(wr), xAn: xs(an),
    xAnL: xs(F.map(f => f.p?.[K.anL])), xAnR: xs(F.map(f => f.p?.[K.anR])),
    hAnL: h(F.map(f => f.p?.[K.anL])), hAnR: h(F.map(f => f.p?.[K.anR])),
    // Oberkörperneigung: + = nach vorne (in Blickrichtung), − = nach hinten
    lean: g(p => { const s = mid(p, K.shL, K.shR), hp = mid(p, K.hipL, K.hipR); return Math.atan2(face * (s.x - hp.x), hp.y - s.y) * 180 / Math.PI; }),
    // Kopfneigung: wie weit die Nase über dem Ohr liegt (Grad), grösser = Kopf im Nacken
    head: g(p => { const e = mid(p, K.earL, K.earR), no = p[K.nose]; return Math.atan2(e.y - no.y, Math.abs(no.x - e.x) + 1e-3) * 180 / Math.PI; }),
    elbow: g(p => sideAngle(p, K.shL, K.elL, K.wrL, K.shR, K.elR, K.wrR)),
    knee: g(p => sideAngle(p, K.hipL, K.knL, K.anL, K.hipR, K.knR, K.anR)),
    hipAng: g(p => sideAngle(p, K.shL, K.hipL, K.knL, K.shR, K.hipR, K.knR)),
    elbowH: h(F.map(f => (f.p ? mid(f.p, K.elL, K.elR) : null)))
  };
}

function firstIdx(n, from, cond, hold = 1) {
  for (let i = Math.max(0, from); i < n; i++) { let ok = true; for (let k = 0; k < hold; k++) if (i + k >= n || !cond(i + k)) { ok = false; break; } if (ok) return i; }
  return -1;
}
function argmax(arr, a, b) { let m = -Infinity, k = -1; for (let i = Math.max(0, a); i <= Math.min(arr.length - 1, b); i++) if (arr[i] > m) { m = arr[i]; k = i; } return k; }
function argmin(arr, a, b) { let m = Infinity, k = -1; for (let i = Math.max(0, a); i <= Math.min(arr.length - 1, b); i++) if (arr[i] < m) { m = arr[i]; k = i; } return k; }
const r2 = x => Math.round(x * 100) / 100;
const deg = x => Math.round(x);

/* ---------- Kamerawinkel ---------- */
/* Schulterbreite im Bild im Verhältnis zur Körperlänge im Stand (Schulter bis Knöchel).
   Von vorne oder hinten etwa 0.27, schräg (45°) etwa 0.19, von der Seite fast 0.
   Die z-Werte von MediaPipe sind dafür zu ungenau. */
export function detectView(track) {
  const P = track.frames.filter(f => f.p).map(f => f.p);
  const len = pct(P.map(p => dist(mid(p, K.shL, K.shR), mid(p, K.anL, K.anR))), 0.95);
  const ratio = median(P.filter(p => Math.min(p[K.shL].v, p[K.shR].v) > 0.3).map(p => Math.abs(p[K.shL].x - p[K.shR].x) / len));
  const view = !Number.isFinite(ratio) ? "oblique" : ratio < VIEW_SIDE ? "side" : ratio < VIEW_FRONT ? "oblique" : "front";
  return { view, ratio };
}
const VIEW_SIDE = 0.07, VIEW_FRONT = 0.22;

/* ---------- Which lift? ----------
   Start: bar on the floor, in the hang (standing, bar at the thighs) or in the rack (jerk).
   Finish: bar overhead (snatch, jerk) or on the shoulders (clean). Standing in the rack before
   the bar goes overhead means a clean, then a jerk. Hip at or below knee height in the catch
   means a squat lift, otherwise a power lift. Jerk: feet apart front to back = split jerk,
   knees bent at lockout = push jerk, legs straight = push press. Names stay English. */
export function liftName(c) {
  if (!c) return "Lift";
  if (c.kind === "cj") return "Clean & Jerk";
  if (c.kind === "jk") return { split: "Split Jerk", push: "Push Jerk", press: "Push Press", squat: "Squat Jerk" }[c.jerk] || "Jerk";
  return (c.hang ? "Hang " : "") + (c.power ? "Power " : "") + (c.kind === "sn" ? "Snatch" : "Clean");
}
function lastRun(end, cond, minLen) {
  let best = null;
  for (let i = 0; i < end; i++) { if (!cond(i)) continue; let j = i; while (j + 1 < end && cond(j + 1)) j++; if (j - i + 1 >= minLen) best = [i, j]; i = j; }
  return best;
}
function jerkKind(s, fps, view, a, iW) {
  const n = s.n, w = Math.min(n - 1, iW + Math.round(0.6 * fps));
  const at0 = arr => median(arr.slice(a, a + 6));
  const iL = Math.max(iW, firstIdx(n, iW, i => s.hWr[i] > s.hNose[i] && s.elbow[i] > 158, 2));
  const b0 = Math.abs(at0(s.xAnL) - at0(s.xAnR)), h0 = Math.abs(at0(s.hAnL) - at0(s.hAnR));
  let spread = 0, rise = 0, low = Infinity;
  for (let i = iW; i <= w; i++) {
    spread = Math.max(spread, Math.abs(s.xAnL[i] - s.xAnR[i]) - b0);
    rise = Math.max(rise, Math.abs(s.hAnL[i] - s.hAnR[i]) - h0);
    low = Math.min(low, s.hHip[i] - s.hKn[i]);
  }
  // From the side the feet move apart in the picture, from the front the back foot sits higher in the picture
  const split = view === "side" ? spread > 0.18 : view === "oblique" ? spread > 0.15 || rise > 0.06 : rise > 0.06;
  if (split) return "split";
  if (low < 0.05) return "squat";
  const iD = argmin(s.hHip, a, iW), iT = argmax(s.hHip, iD, Math.min(n - 1, iW + 3));
  const rebend = s.hHip[iT] - Math.min(...s.hHip.slice(iT, w + 1));
  return rebend > 0.04 || at0(s.knee) - s.knee[iL] > 15 ? "push" : "press";
}
export function classify(track) {
  const s = series(track), n = s.n, fps = track.fps, sec = x => Math.round(x * fps);
  if (s.found < 0.6 || n < 6) return null;
  const view = detectView(track).view;
  const at0 = arr => median(arr.slice(0, Math.min(6, n)));
  const over = i => s.hWr[i] > s.hNose[i] && s.elbow[i] > 135;
  const rack = i => Math.abs(s.hWr[i] - s.hSh[i]) < 0.15 && s.elbow[i] < 110 && s.hWr[i] > s.hHip[i] + 0.2;
  const stand = i => s.knee[i] > 150 && s.hipAng[i] > 145;
  // Squat lift: hip at or below the knee somewhere in the catch window
  const deep = (a, b) => { let m = Infinity, k = Infinity; for (let i = Math.max(0, a); i <= Math.min(n - 1, b); i++) { m = Math.min(m, s.hHip[i] - s.hKn[i]); k = Math.min(k, s.knee[i]); } return m < 0.05 || k < 95; };
  const base = at0(s.hWr);
  const start = Math.abs(base - at0(s.hSh)) < 0.15 ? "rack" : base < at0(s.hKn) + 0.08 ? "floor" : "hang";
  const hang = start === "hang";
  const iW = firstIdx(n, 0, over, 2);
  if (start === "rack") {
    if (iW < 0) return null;
    const jerk = jerkKind(s, fps, view, 0, iW);
    return { kind: "jk", jerk, parts: [{ lift: "jk", i0: 0, i1: n - 1, jerk }] };
  }
  const iR = firstIdx(n, 0, rack, 2);
  const hold = iW >= 0 ? lastRun(iW, i => rack(i) && stand(i), sec(0.5)) : null;
  if (hold) {
    const j0 = Math.max(hold[0], hold[1] - sec(0.4)); // the hold ends when the dip starts
    const jerk = jerkKind(s, fps, view, j0, iW);
    return { kind: "cj", hang, power: iR >= 0 && !deep(iR, hold[0]), jerk,
      parts: [{ lift: "cl", i0: 0, i1: Math.max(hold[0] + 3, j0 - 1) }, { lift: "jk", i0: j0, i1: n - 1, jerk }] };
  }
  if (iW >= 0) return { kind: "sn", hang, power: !deep(iW - sec(0.25), iW + sec(1.5)), parts: [{ lift: "sn", i0: 0, i1: n - 1 }] };
  if (iR >= 0) return { kind: "cl", hang, power: !deep(iR, iR + sec(1.5)), parts: [{ lift: "cl", i0: 0, i1: n - 1 }] };
  return null;
}
export const sliceTrack = (track, i0, i1) => ({ ...track, frames: track.frames.slice(i0, i1 + 1) });

/* ---------- Auswertung ---------- */
/* view: "side" | "oblique" | "front" | "back"  · lift: "sn" | "cl" | "jk" · jerk: "split" | "push" | "press" | "squat" */
export function analyze(track, lift, view, jerk) {
  const s = series(track), fps = track.fps, n = s.n;
  const out = { events: {}, metrics: [], findings: [], notAssessable: [], ok: true, summary: "" };
  const sideways = view === "side" || view === "oblique";
  const capFA = view === "side" ? "hoch" : "mittel"; // Vor-/Rückwärts-Messungen bei schräger Sicht höchstens „mittel“
  if (s.found < 0.7 || s.vis < 0.35) {
    out.ok = false;
    out.summary = t("a.fail.detect");
    return out;
  }
  if (!sideways) out.notAssessable.push(t("a.na.view"));
  out.notAssessable.push(t("a.na.foot"));
  out.notAssessable.push(t("a.na.bar"));
  const add = f => out.findings.push(f);
  const lvl = (v, mid, hi) => (v >= hi ? "hoch" : v >= mid ? "mittel" : null);
  const cap = (a, c) => (a === "hoch" && c === "mittel" ? "mittel" : a);
  const sec = i => r2(track.frames[i]?.t ?? 0);
  const fr = (a, b) => [a + 1, (b ?? a) + 1];

  if (lift === "jk") return analyzeJerk(s, track, out, { sideways, capFA, add, lvl, cap, sec, fr, fps, n, jerk });

  /* Abheben: Handgelenke steigen deutlich über die Ausgangshöhe */
  const base = median(s.hWr.slice(0, Math.min(6, n)));
  let i0 = firstIdx(n, 0, i => s.hWr[i] > base + 0.05 && s.hWr[Math.min(n - 1, i + 3)] > s.hWr[i]);
  if (i0 < 0) { out.ok = false; out.summary = t("a.fail.liftoff"); return out; }
  while (i0 > 0 && s.hWr[i0 - 1] > base + 0.015) i0--;
  const iK = firstIdx(n, i0, i => s.hWr[i] >= s.hKn[i]);
  const reach = lift === "sn" ? (i => s.hWr[i] > s.hSh[i]) : (i => s.hWr[i] > s.hSh[i] - 0.15);
  const iS = firstIdx(n, i0 + 1, reach);
  if (iS < 0) { out.ok = false; out.summary = t("a.fail.shoulder"); return out; }
  // Volle Streckung: erstes Bild, in dem Knie und Hüfte gestreckt sind. Danach steigt die Hüfte oft nur noch durch Zehenstand.
  // Relativ zum gestrecktesten Knie im Zug, weil gestreckte Gelenke aus schräger Sicht nicht 180° messen.
  const kStart = Math.max(i0 + 1, iK), kneeMax = s.knee[argmax(s.knee, kStart, iS)], hipMax = s.hipAng[argmax(s.hipAng, kStart, iS)];
  let iE = firstIdx(n, kStart, i => i <= iS && s.knee[i] >= Math.min(160, kneeMax - 8) && s.hipAng[i] >= Math.min(170, hipMax - 4), 2);
  if (iE < 0 || iE > iS) iE = argmax(s.hHip, i0, iS);
  const iL = lift === "sn"
    ? firstIdx(n, iS, i => s.hWr[i] > s.hNose[i] && s.elbow[i] > 147, 2)
    : firstIdx(n, iE + 1, i => Math.abs(s.hWr[i] - s.hSh[i]) < 0.13 && s.elbow[i] < 95 && s.hHip[i] < s.hHip[iE] - 0.03, 2);
  if (iL >= 0 && (iL - iS) / fps > 0.8) {
    out.ok = false;
    out.summary = t("a.fail.arms");
    return out;
  }
  if (iL < 0) { out.ok = false; out.summary = t(lift === "sn" ? "a.fail.lock.sn" : "a.fail.lock.cl"); return out; }
  const iB = argmin(s.hHip, iL, n - 1);
  const iU = firstIdx(n, iB, i => s.knee[i] >= 158 && s.hipAng[i] >= 160, 3);
  out.events = { start: i0, knie: iK, streckung: iE, empfang: iL, tiefster: iB, stand: iU };

  /* 1. Zurücklehnen am Ende des Zuges */
  if (sideways) {
    const w0 = Math.max(i0, iE - 2), w1 = Math.min(iL, iS + 2);
    const iLean = argmin(s.lean, w0, w1), back = -s.lean[iLean];
    out.metrics.push({ label: t("m.lean"), value: Math.max(0, deg(back)) + "°", note: view === "oblique" ? t("a.note.under") : "" });
    const a = lvl(back, 8, 15);
    if (a) add({ rule: "lean", titel: t("f.lean.t"), sicherheit: cap(a, capFA), bilder: fr(iLean), key: iLean,
      beobachtung: t("f.lean.o", { d: deg(back), f: iLean + 1, s: sec(iLean) }),
      fehler_ids: [], ursachen_ids: ["lean_back", "transition_timing"] });
  }

  /* 2. Kopf in den Nacken */
  {
    const baseHead = median(s.head.slice(Math.max(0, i0 - 8), i0 + 1));
    const iH = argmax(s.head, iE - 2, Math.min(iL, iS + 3)), dHead = s.head[iH] - baseHead;
    out.metrics.push({ label: t("m.head"), value: "+" + Math.max(0, deg(dHead)) + "°" });
    const a = lvl(dHead, 25, 40);
    if (a) add({ rule: "head", titel: t("f.head.t"), sicherheit: a === "hoch" ? "mittel" : "niedrig", bilder: fr(iH), key: iH,
      beobachtung: t("f.head.o", { d: deg(dHead), f: iH + 1 }),
      fehler_ids: [], ursachen_ids: ["lean_back"] });
  }

  /* 3. Übergang unter die Stange */
  {
    const tt = (iL - iE) / fps;
    out.metrics.push({ label: t(lift === "sn" ? "m.trans.sn" : "m.trans.cl"), value: num(r2(tt)) + " s" });
    const lim = lift === "sn" ? [0.38, 0.48] : [0.32, 0.42];
    const a = lvl(tt, lim[0], lim[1]);
    if (a) add({ titel: t("f.trans.t"), sicherheit: a, bilder: fr(iE, iL), key: iE,
      beobachtung: t(lift === "sn" ? "f.trans.o.sn" : "f.trans.o.cl", { a: iE + 1, b: iL + 1, s: r2(tt) }),
      fehler_ids: ["slow_under"], ursachen_ids: ["slow_turnover", "transition_timing"] });
  }

  /* 4. Hoch empfangen, dann gerutscht */
  {
    const drop = s.hHip[iL] - s.hHip[iB];
    const hipAboveKneeAtCatch = s.hHip[iL] > s.hKn[iL] + 0.02;
    out.metrics.push({ label: t("m.drop"), value: t("a.pct", { n: Math.round(drop * 100) }) });
    out.metrics.push({ label: t("m.catchH"), value: t(hipAboveKneeAtCatch ? "m.catchH.power" : "m.catchH.low") });
    const a = lvl(drop, 0.09, 0.18);
    if (a) add({ titel: t("f.high.t"), sicherheit: a, bilder: fr(iL, iB), key: iL,
      beobachtung: t(hipAboveKneeAtCatch ? "f.high.o.above" : "f.high.o.fair", { a: iL + 1, b: iB + 1 }),
      fehler_ids: ["catch_high"], ursachen_ids: ["receive_conf", "meet_bar"] });
  }

  /* 5. Arme beugen zu früh */
  if (iK >= 0 && iE - 1 > iK) {
    const iA = argmin(s.elbow, iK, iE - 1), ang = s.elbow[iA];
    out.metrics.push({ label: t("m.elbow"), value: deg(ang) + "°" });
    const a = ang < 140 ? "mittel" : ang < 152 ? "niedrig" : null;
    if (a) add({ titel: t("f.arms.t"), sicherheit: a, bilder: fr(iA), key: iA,
      beobachtung: t("f.arms.o", { f: iA + 1, d: deg(ang) }),
      fehler_ids: ["early_arms"], ursachen_ids: ["early_arms"] });
  }

  /* 6. Hüfte steigt zuerst */
  if (iK > i0 + 2) {
    const dHip = s.hHip[iK] - s.hHip[i0], dSh = s.hSh[iK] - s.hSh[i0], ratio = dHip / Math.max(0.01, dSh);
    out.metrics.push({ label: t("m.hip"), value: num(r2(ratio)) + " ×" });
    const a = ratio > 2.2 ? "mittel" : ratio > 1.6 ? "niedrig" : null;
    if (a) add({ titel: t("f.hips.t"), sicherheit: a, bilder: fr(i0, iK), key: iK,
      beobachtung: t("f.hips.o", { f: iK + 1, r: r2(ratio) }),
      fehler_ids: ["hips_first"], ursachen_ids: ["pull_posture", "pull_balance"] });
  }

  /* 7. Füsse: Sprung und Breite */
  if (sideways) {
    const pre = [Math.max(0, i0 - 6), i0], land = [iL, Math.min(n - 1, iL + 4)];
    const mx = (arr, [a, b]) => median(arr.slice(a, b + 1));
    const dx = s.face * (mx(s.xAn, land) - mx(s.xAn, pre));
    out.metrics.push({ label: t("m.feet"), value: t("m.feet.v", { v: (dx >= 0 ? "+" : "") + Math.round(dx * 100) }), note: view === "oblique" ? t("a.note.rough") : "" });
    if (dx < -0.08) add({ titel: t("f.jback.t"), sicherheit: dx < -0.14 ? cap("hoch", capFA) : "niedrig", bilder: fr(iL), key: iL,
      beobachtung: t("f.jback.o", { n: Math.round(-dx * 100) }),
      fehler_ids: ["jump_back"], ursachen_ids: ["lean_back", "footwork"] });
    if (dx > 0.08) add({ titel: t("f.jfwd.t"), sicherheit: dx > 0.14 ? cap("hoch", capFA) : "niedrig", bilder: fr(iL), key: iL,
      beobachtung: t("f.jfwd.o", { n: Math.round(dx * 100) }),
      fehler_ids: ["jump_fwd"], ursachen_ids: ["bar_away", "heels_early"] });
  }

  /* 8. Lange Stabilisierung unten und Aufstehen */
  {
    let k = iB; while (k > iL && s.hHip[k - 1] < s.hHip[iB] + 0.03) k--;
    let m = iB; while (m < n - 1 && s.hHip[m + 1] < s.hHip[iB] + 0.03) m++;
    const hold = (m - k) / fps;
    out.metrics.push({ label: t("m.hold"), value: num(r2(hold)) + " s" });
    if (hold > 0.8) add({ titel: t("f.hold.t"), sicherheit: "niedrig", bilder: fr(k, m), key: k,
      beobachtung: t("f.hold.o", { s: r2(hold), a: k + 1, b: m + 1 }),
      fehler_ids: [], ursachen_ids: lift === "sn" ? ["overhead_stab", "mobility"] : ["trunk_receive", "mobility"] });
    if (iU > 0) {
      const up = (iU - m) / fps;
      out.metrics.push({ label: t("m.up"), value: num(r2(up)) + " s" });
      if (up > 1.6) add({ titel: t("f.up.t"), sicherheit: "niedrig", bilder: fr(m, iU), key: m,
        beobachtung: t("f.up.o", { s: r2(up) }), fehler_ids: [lift === "sn" ? "recover" : "recover_cl"], ursachen_ids: ["squat_strength"] });
    } else out.notAssessable.push(t("a.na.recovery"));
  }

  /* 9. Überkopf-Stabilität (Reissen) */
  if (lift === "sn" && sideways && iU > iL) {
    const rel = []; for (let i = iL; i <= iU; i++) rel.push(s.face * (s.xWr[i] - s.xAn[i]));
    const span = Math.max(...rel) - Math.min(...rel);
    out.metrics.push({ label: t("m.drift"), value: t("a.pct", { n: Math.round(span * 100) }) });
    if (span > (view === "side" ? 0.14 : 0.22)) add({ titel: t("f.drift.t"), sicherheit: "niedrig", bilder: fr(iL, iU), key: iL,
      beobachtung: t("f.drift.o", { n: Math.round(span * 100) }),
      fehler_ids: [], ursachen_ids: ["overhead_stab"] });
  }

  smallCheck(s, out);
  finish(out);
  return out;
}

/* Kleine Person im Bild: Hand- und Fusspunkte werden unruhig. Sicherheit herabstufen, Ausreisser-Regeln abschwächen. */
function smallCheck(s, out) {
  if (s.L >= 130) return;
  out.notAssessable.unshift(t("a.na.small"));
  const robust = f => f.rule === "lean" || f.rule === "head";
  out.findings.forEach(f => { if (!robust(f)) f.sicherheit = "niedrig"; else if (f.sicherheit === "hoch") f.sicherheit = "mittel"; });
}

function analyzeJerk(s, track, out, { sideways, capFA, add, lvl, cap, sec, fr, fps, n, jerk }) {
  const press = jerk === "press"; // Push Press: the feet stay put and the arms press the bar out, that's the point of it
  const startHip = median(s.hHip.slice(0, Math.min(6, n)));
  const iW = firstIdx(n, 0, i => s.hWr[i] > s.hNose[i]);
  if (iW < 0) { out.ok = false; out.summary = t("a.fail.overhead"); return out; }
  const iD = argmin(s.hHip, 0, iW);
  const iD0 = Math.max(0, firstIdx(n, 0, i => s.hHip[i] < startHip - 0.01));
  const iT = argmax(s.hHip, iD, Math.min(n - 1, iW + 3));
  const iL = firstIdx(n, iW, i => s.hWr[i] > s.hNose[i] && s.elbow[i] > 158, 2);
  const anL0 = median(s.xAnL.slice(0, 6)), anR0 = median(s.xAnR.slice(0, 6));
  const iF = firstIdx(n, iD, i => Math.max(Math.abs(s.xAnL[i] - anL0), Math.abs(s.xAnR[i] - anR0)) > 0.05);
  out.events = { start: iD0, dip: iD, drive: iT, fuesse: iF, fest: iL };

  const depth = startHip - s.hHip[iD];
  out.metrics.push({ label: t("m.dip"), value: t("a.pct", { n: Math.round(depth * 100) }) });
  if (depth > 0.16) add({ titel: t("f.dipdeep.t"), sicherheit: "niedrig", bilder: fr(iD), key: iD,
    beobachtung: t("f.dipdeep.o", { n: Math.round(depth * 100) }), fehler_ids: ["j_dip"], ursachen_ids: ["dip_balance", "dip_posture"] });

  if (sideways) {
    const tilt = s.lean[iD] - median(s.lean.slice(0, 6));
    out.metrics.push({ label: t("m.tilt"), value: deg(tilt) + "°" });
    const a = lvl(tilt, 7, 12);
    if (a) add({ titel: t("f.tilt.t"), sicherheit: cap(a, capFA), bilder: fr(iD), key: iD,
      beobachtung: t("f.tilt.o", { f: iD + 1, d: deg(tilt) }),
      fehler_ids: ["j_dip", "j_fwd"], ursachen_ids: ["dip_balance", "dip_posture"] });
  }

  if (iF >= 0 && !press) {
    const early = (iT - iF) / fps;
    out.metrics.push({ label: t("m.early"), value: num(early > 0 ? r2(early) : 0) + " s" });
    if (early > 0.04) add({ titel: t("f.early.t"), sicherheit: early > 0.08 ? "mittel" : "niedrig", bilder: fr(iF, iT), key: iF,
      beobachtung: t("f.early.o", { a: iF + 1, b: iT + 1 }),
      fehler_ids: ["j_drive", "j_pressout"], ursachen_ids: ["patience", "drive_short"] });
  }

  if (iL >= 0) {
    const land = firstIdx(n, Math.max(iF, iT), i => i > 0 && Math.abs(s.xAnL[i] - s.xAnL[i - 1]) < 0.01 && Math.abs(s.xAnR[i] - s.xAnR[i - 1]) < 0.01, 2);
    if (land >= 0 && !press) {
      const el = s.elbow[land];
      out.metrics.push({ label: t("m.elbowLand"), value: deg(el) + "°" });
      if (el < 150) add({ titel: t("f.bent.t"), sicherheit: el < 135 ? "mittel" : "niedrig", bilder: fr(land, iL), key: land,
        beobachtung: t("f.bent.o", { a: land + 1, d: deg(el), b: iL + 1 }),
        fehler_ids: ["j_pressout"], ursachen_ids: ["foot_speed", "drive_short", "overhead_jerk"] });
    }
    if (sideways && (!jerk || jerk === "split")) {
      const split = Math.abs(s.xAnL[iL] - s.xAnR[iL]);
      out.metrics.push({ label: t("m.split"), value: t("a.pct", { n: Math.round(split * 100) }), note: t("a.note.rough") });
      if (split > 0.22 && split < 0.38) add({ titel: t("f.split.t"), sicherheit: "niedrig", bilder: fr(iL), key: iL,
        beobachtung: t("f.split.o", { n: Math.round(split * 100) }), fehler_ids: ["j_split"], ursachen_ids: ["split_position"] });
      const fwd = s.lean[iL];
      out.metrics.push({ label: t("m.torso"), value: t("m.torso.v", { d: deg(fwd) }) });
      if (fwd > 10) add({ titel: t("f.dive.t"), sicherheit: cap(fwd > 16 ? "hoch" : "mittel", capFA), bilder: fr(iL), key: iL,
        beobachtung: t("f.dive.o", { f: iL + 1, d: deg(fwd) }), fehler_ids: ["j_dive", "j_frontleg"], ursachen_ids: ["chest_dive"] });
    }
  } else out.notAssessable.push(t("a.na.lockout"));

  smallCheck(s, out);
  finish(out);
  return out;
}

const RANK = { hoch: 0, mittel: 1, niedrig: 2 };
function finish(out) {
  out.findings.sort((a, b) => RANK[a.sicherheit] - RANK[b.sicherheit]);
  const top = out.findings.filter(f => f.sicherheit !== "niedrig").map(f => f.titel);
  // Titel im Satz: Englisch und Französisch klein weiterführen, Deutsch in Anführungszeichen (Gross-/Kleinschreibung bleibt richtig)
  const low = x => (LANG === "de" ? "«" + x + "»" : x.charAt(0).toLowerCase() + x.slice(1));
  out.summary = out.findings.length
    ? (top.length ? t("sum.top", { list: top.slice(0, 2).map(low).join(t("sum.and")) }) : t("sum.weak")) + t("sum.basis")
    : t("sum.none");
}

/* ---------- Find lifts automatically ----------
   Scans the whole video at a low frame rate, without knowing which lift it is. A lift ends with the
   wrists overhead (snatch, jerk) or at the shoulders (clean). Looking back from there: bar on the
   floor or held still in the hang = snatch or clean, standing in the rack first = clean & jerk,
   nothing before the rack = jerk. Returns windows {a, b, kind, hang}; the exact variant
   (power, push press, split jerk ...) comes from classify() on the full track. */
export async function findLifts(video, { fps = 5, onProgress, signal, debug } = {}) {
  const lm = await initPose();
  const W = video.videoWidth, H = video.videoHeight, dur = video.duration;
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = CROP;
  const g = canvas.getContext("2d");
  const full = { x: 0, y: 0, s: Math.max(W, H) };
  const samples = [];
  let prev = null;
  await readFrames(video, 0, dur - 0.05, 1 / fps, t => {
    g.fillStyle = "#000"; g.fillRect(0, 0, CROP, CROP);
    const k = CROP / full.s; g.drawImage(video, 0, 0, W * k, H * k);
    ts += 200;
    const p = pick(lm.detectForVideo(canvas, ts).landmarks, prev, full);
    if (p) prev = p;
    samples.push({ t, p });
    onProgress?.(t, dur);
  }, { signal, maxRate: 5 });
  // Per sample: heights relative to the ankles, normalised by shoulder–ankle length
  const rows = samples.map(({ t, p }) => {
    if (!p) return { t, ok: false };
    const sh = mid(p, K.shL, K.shR), an = mid(p, K.anL, K.anR), wr = mid(p, K.wrL, K.wrR), kn = mid(p, K.knL, K.knR), hp = mid(p, K.hipL, K.hipR), no = p[K.nose];
    const L = Math.max(dist(sh, an), 20);
    const h = q => (an.y - q.y) / L;
    const knee = sideAngle(p, K.hipL, K.knL, K.anL, K.hipR, K.knR, K.anR);
    return { t, ok: Math.min(wr.v, sh.v, an.v) > 0.3, wr: h(wr), sh: h(sh), kn: h(kn), hip: h(hp), nose: h(no), knee };
  });
  const over = r => r.ok && r.wr > r.nose - 0.02 && r.wr > r.sh + 0.08;
  const rack = r => r.ok && !over(r) && Math.abs(r.wr - r.sh) < 0.14 && r.wr > r.hip + 0.2;
  const high = r => over(r) || rack(r);
  const floor = r => r.ok && r.wr < r.kn + 0.08;
  const hang = r => r.ok && !floor(r) && r.knee > 150 && r.wr < r.hip + 0.12;
  // Runs of "high" samples (at least 2). Missed detections (e.g. a small lifter deep in the squat) are bridged for up to 1.2 s
  const runs = [];
  for (let i = 0; i < rows.length; i++) {
    if (!high(rows[i])) continue;
    let j = i, hits = 1;
    for (let k = i + 1; k < rows.length; k++) {
      if (high(rows[k])) { j = k; hits++; continue; }
      if (rows[k].t - rows[j].t > 1.2) break;
      if (floor(rows[k]) || hang(rows[k])) break;
    }
    if (hits >= 2) runs.push([i, j]);
    i = j;
  }
  const lifts = [];
  const put = l => {
    l.b = Math.min(dur, l.b);
    if (l.b - l.a < 0.8) return;
    const last = lifts[lifts.length - 1];
    if (last && l.a < last.b) { last.b = Math.max(last.b, l.b); return; } // same lift
    lifts.push(l);
  };
  // End: standing again with straight knees while the bar is still up
  const endAt = (from, to, cond) => { for (let k = from + 1; k <= to; k++) if (rows[k].ok && rows[k].knee >= 160 && cond(rows[k])) return rows[k].t + 0.4; return rows[to].t + 0.4; };
  for (const [i, j] of runs) {
    // Start: walk back up to 5 s to the bar on the floor, or to the bar held still in the hang
    let st = -1, hangStart = false, still = 0, latest = -1;
    for (let k = i - 1; k >= 0 && rows[i].t - rows[k].t <= 5; k--) {
      const r = rows[k]; if (!r.ok) continue;
      if (floor(r)) { st = k; break; }
      if (hang(r) && rows[k + 1].ok && hang(rows[k + 1]) && Math.abs(r.wr - rows[k + 1].wr) < 0.04) {
        if (!still++) latest = k + 1;
        if (still >= 2) { st = latest; hangStart = true; break; }
      } else still = 0;
    }
    // Bar overhead: one or more stretches inside the run (several jerks from the rack are possible)
    const segs = [];
    for (let k = i; k <= j; k++) {
      if (!over(rows[k])) continue;
      let e = k; while (e + 1 <= j && (over(rows[e + 1]) || !rows[e + 1].ok)) e++;
      while (e > k && !rows[e].ok) e--;
      segs.push([k, e]); k = e;
    }
    // A new jerk only after standing in the rack again (2 samples); otherwise the bar just dipped while overhead
    const racked = (x, y) => { let r = 0; for (let m = x; m < y; m++) { r = rack(rows[m]) && rows[m].knee > 150 ? r + 1 : 0; if (r >= 2) return true; } return false; };
    for (let q = segs.length - 1; q > 0; q--) if (!racked(segs[q - 1][1] + 1, segs[q][0])) { segs[q - 1][1] = segs[q][1]; segs.splice(q, 1); }
    if (!segs.length) { // clean only
      if (st >= 0) put({ a: Math.max(0, rows[st].t - 0.3), b: Math.min(endAt(i, j, rack), rows[st].t + 6), kind: "cl", hang: hangStart });
      continue;
    }
    let prevEnd = rows[i].t;
    segs.forEach(([k, e], q) => {
      const tO = rows[k].t, b0 = endAt(k, e, over);
      if (q === 0 && st >= 0) {
        // Standing in the rack (2 samples in a row) before the bar goes overhead: clean & jerk
        let held = 0, run = 0;
        for (let m = st; m < k; m++) { run = rack(rows[m]) && rows[m].knee > 150 ? run + 1 : 0; held = Math.max(held, run); }
        const a = Math.max(0, rows[st].t - 0.3);
        put({ a, b: Math.min(b0 + 0.6, a + (held >= 2 ? 14 : 7)), kind: held >= 2 ? "cj" : "sn", hang: hangStart });
      } else put({ a: Math.max(prevEnd, tO - 1.3), b: Math.min(b0, tO + 3), kind: "jk", hang: false });
      prevEnd = lifts[lifts.length - 1]?.b ?? prevEnd;
    });
  }
  if (debug) lifts.rows = rows;
  return lifts;
}
