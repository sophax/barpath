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
  const frames = [];
  let prev = first;
  for (let i = 0; i < n; i++) {
    if (signal?.aborted) throw { code: "cancelled" };
    const t = a + i / fps;
    await seek(video, t);
    draw(box); ts += 34;
    const p = pick(lm.detectForVideo(canvas, ts).landmarks, prev, box);
    if (p) prev = p;
    frames.push({ i, t, p });
    onProgress?.(i + 1, n);
    if (i % 5 === 4) await new Promise(r => setTimeout(r, 0));
  }
  return { frames, W, H, fps, box };
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

/* ---------- Auswertung ---------- */
/* view: "side" | "oblique" | "front" | "back"  · lift: "sn" | "cl" | "jk" */
export function analyze(track, lift, view) {
  const s = series(track), fps = track.fps, n = s.n;
  const out = { events: {}, metrics: [], findings: [], notAssessable: [], ok: true, summary: "" };
  const sideways = view === "side" || view === "oblique";
  const capFA = view === "side" ? "hoch" : "mittel"; // Vor-/Rückwärts-Messungen bei schräger Sicht höchstens „mittel“
  if (s.found < 0.7 || s.vis < 0.35) {
    out.ok = false;
    out.summary = "Die Person wurde in zu wenigen Bildern sicher erkannt. Achte darauf, dass der ganze Körper im Bild ist und nichts davor steht.";
    return out;
  }
  if (!sideways) out.notAssessable.push("Zurücklehnen, Sprung nach vorne oder hinten und Split-Länge: Dafür braucht es eine Aufnahme von der Seite oder schräg.");
  out.notAssessable.push("Druck im Fuss (Zehen, Mitte, Ferse) ist im Video nicht messbar.");
  out.notAssessable.push("Stangenbahn: Die App nutzt die Handgelenke als Näherung für die Stange. Der genaue Abstand zum Körper ist so nicht messbar.");
  const add = f => out.findings.push(f);
  const lvl = (v, mid, hi) => (v >= hi ? "hoch" : v >= mid ? "mittel" : null);
  const cap = (a, c) => (a === "hoch" && c === "mittel" ? "mittel" : a);
  const sec = i => r2(track.frames[i]?.t ?? 0);
  const fr = (a, b) => [a + 1, (b ?? a) + 1];

  if (lift === "jk") return analyzeJerk(s, track, out, { sideways, capFA, add, lvl, cap, sec, fr, fps, n });

  /* Abheben: Handgelenke steigen deutlich über die Ausgangshöhe */
  const base = median(s.hWr.slice(0, Math.min(6, n)));
  let i0 = firstIdx(n, 0, i => s.hWr[i] > base + 0.05 && s.hWr[Math.min(n - 1, i + 3)] > s.hWr[i]);
  if (i0 < 0) { out.ok = false; out.summary = "Im markierten Ausschnitt ist kein Abheben der Stange zu erkennen. Setze den Start kurz vor dem Abheben."; return out; }
  while (i0 > 0 && s.hWr[i0 - 1] > base + 0.015) i0--;
  const iK = firstIdx(n, i0, i => s.hWr[i] >= s.hKn[i]);
  const reach = lift === "sn" ? (i => s.hWr[i] > s.hSh[i]) : (i => s.hWr[i] > s.hSh[i] - 0.15);
  const iS = firstIdx(n, i0 + 1, reach);
  if (iS < 0) { out.ok = false; out.summary = "Die Stange kommt im Ausschnitt nicht über Schulterhöhe. Setze das Ende später, wenn du stehst."; return out; }
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
    out.summary = "Die Arme über dem Kopf wurden nicht sicher erkannt (die Person ist zu klein im Bild oder Arme und Scheiben überlagern sich). Filme näher oder von der Seite.";
    return out;
  }
  if (iL < 0) { out.ok = false; out.summary = lift === "sn" ? "Ich finde keinen Moment mit gestreckten Armen über dem Kopf. Ist der Versuch vollständig im Ausschnitt?" : "Ich finde den Moment nicht, in dem die Stange in den Rack kommt. Ist der Versuch vollständig im Ausschnitt?"; return out; }
  const iB = argmin(s.hHip, iL, n - 1);
  const iU = firstIdx(n, iB, i => s.knee[i] >= 158 && s.hipAng[i] >= 160, 3);
  out.events = { start: i0, knie: iK, streckung: iE, empfang: iL, tiefster: iB, stand: iU };

  /* 1. Zurücklehnen am Ende des Zuges */
  if (sideways) {
    const w0 = Math.max(i0, iE - 2), w1 = Math.min(iL, iS + 2);
    const iLean = argmin(s.lean, w0, w1), back = -s.lean[iLean];
    out.metrics.push({ label: "Zurücklehnen am Ende des Zuges", value: Math.max(0, deg(back)) + "°", note: view === "oblique" ? "bei schräger Sicht eher unterschätzt" : "" });
    const a = lvl(back, 8, 15);
    if (a) add({ titel: "Starkes Zurücklehnen am Ende des Zuges", sicherheit: cap(a, capFA), bilder: fr(iLean), key: iLean,
      beobachtung: `Der Oberkörper ist ${deg(back)}° hinter der Senkrechten (Bild ${iLean + 1}, ${sec(iLean)} s). Die Kraft geht damit nach hinten statt nach oben.`,
      fehler_ids: [], ursachen_ids: ["lean_back", "transition_timing"] });
  }

  /* 2. Kopf in den Nacken */
  {
    const baseHead = median(s.head.slice(Math.max(0, i0 - 8), i0 + 1));
    const iH = argmax(s.head, iE - 2, Math.min(iL, iS + 3)), dHead = s.head[iH] - baseHead;
    out.metrics.push({ label: "Kopf in den Nacken (gegenüber Start)", value: "+" + Math.max(0, deg(dHead)) + "°" });
    const a = lvl(dHead, 25, 40);
    if (a) add({ titel: "Kopf wird in den Nacken geworfen", sicherheit: a === "hoch" ? "mittel" : "niedrig", bilder: fr(iH), key: iH,
      beobachtung: `Der Kopf kippt um etwa ${deg(dHead)}° nach hinten (Bild ${iH + 1}). Das verstärkt meist das Zurücklehnen.`,
      fehler_ids: [], ursachen_ids: ["lean_back"] });
  }

  /* 3. Übergang unter die Stange */
  {
    const tt = (iL - iE) / fps;
    out.metrics.push({ label: lift === "sn" ? "Streckung bis Arme fest über Kopf" : "Streckung bis Stange im Rack", value: r2(tt) + " s" });
    const lim = lift === "sn" ? [0.38, 0.48] : [0.32, 0.42];
    const a = lvl(tt, lim[0], lim[1]);
    if (a) add({ titel: "Langsamer Übergang unter die Stange", sicherheit: a, bilder: fr(iE, iL), key: iE,
      beobachtung: `Von der vollen Streckung (Bild ${iE + 1}) bis ${lift === "sn" ? "die Arme fest sind" : "die Stange im Rack liegt"} (Bild ${iL + 1}) vergehen ${r2(tt)} s.`,
      fehler_ids: ["slow_under"], ursachen_ids: ["slow_turnover", "transition_timing"] });
  }

  /* 4. Hoch empfangen, dann gerutscht */
  {
    const drop = s.hHip[iL] - s.hHip[iB];
    const hipAboveKneeAtCatch = s.hHip[iL] > s.hKn[iL] + 0.02;
    out.metrics.push({ label: "Absinken nach dem Empfang", value: Math.round(drop * 100) + " % der Körperlänge" });
    out.metrics.push({ label: "Empfangshöhe", value: hipAboveKneeAtCatch ? "Hüfte über Knie (Power-Höhe)" : "Hüfte auf oder unter Kniehöhe" });
    const a = lvl(drop, 0.09, 0.18);
    if (a) add({ titel: "Hoch empfangen, dann in die Hocke gerutscht", sicherheit: a, bilder: fr(iL, iB), key: iL,
      beobachtung: `Beim Empfang (Bild ${iL + 1}) ist die Hüfte noch ${hipAboveKneeAtCatch ? "über Kniehöhe" : "relativ hoch"} und sinkt danach bis Bild ${iB + 1} deutlich ab. Falls ein Power-Versuch geplant war, ist das kein Fehler.`,
      fehler_ids: ["catch_high"], ursachen_ids: ["receive_conf", "meet_bar"] });
  }

  /* 5. Arme beugen zu früh */
  if (iK >= 0 && iE - 1 > iK) {
    const iA = argmin(s.elbow, iK, iE - 1), ang = s.elbow[iA];
    out.metrics.push({ label: "Kleinster Ellbogenwinkel vor der Streckung", value: deg(ang) + "°" });
    const a = ang < 140 ? "mittel" : ang < 152 ? "niedrig" : null;
    if (a) add({ titel: "Arme beugen vor der vollen Streckung", sicherheit: a, bilder: fr(iA), key: iA,
      beobachtung: `Schon in Bild ${iA + 1}, vor der vollen Streckung, ist der Ellbogen auf etwa ${deg(ang)}° gebeugt.`,
      fehler_ids: ["early_arms"], ursachen_ids: ["early_arms"] });
  }

  /* 6. Hüfte steigt zuerst */
  if (iK > i0 + 2) {
    const dHip = s.hHip[iK] - s.hHip[i0], dSh = s.hSh[iK] - s.hSh[i0], ratio = dHip / Math.max(0.01, dSh);
    out.metrics.push({ label: "1. Zug: Hüfte steigt im Verhältnis zur Schulter", value: r2(ratio) + " ×" });
    const a = ratio > 2.2 ? "mittel" : ratio > 1.6 ? "niedrig" : null;
    if (a) add({ titel: "Hüfte steigt im 1. Zug schneller als die Schultern", sicherheit: a, bilder: fr(i0, iK), key: iK,
      beobachtung: `Bis die Stange auf Kniehöhe ist (Bild ${iK + 1}), steigt die Hüfte ${r2(ratio)}-mal so stark wie die Schultern.`,
      fehler_ids: ["hips_first"], ursachen_ids: ["pull_posture", "pull_balance"] });
  }

  /* 7. Füsse: Sprung und Breite */
  if (sideways) {
    const pre = [Math.max(0, i0 - 6), i0], land = [iL, Math.min(n - 1, iL + 4)];
    const mx = (arr, [a, b]) => median(arr.slice(a, b + 1));
    const dx = s.face * (mx(s.xAn, land) - mx(s.xAn, pre));
    out.metrics.push({ label: "Fussversatz nach dem Empfang", value: (dx >= 0 ? "+" : "") + Math.round(dx * 100) + " % (vorne +, hinten −)", note: view === "oblique" ? "bei schräger Sicht nur grob" : "" });
    if (dx < -0.08) add({ titel: "Sprung nach hinten", sicherheit: dx < -0.14 ? cap("hoch", capFA) : "niedrig", bilder: fr(iL), key: iL,
      beobachtung: `Die Füsse landen etwa ${Math.round(-dx * 100)} % der Körperlänge hinter der Startposition. Ein leichter Rückwärtssprung ist normal.`,
      fehler_ids: ["jump_back"], ursachen_ids: ["lean_back", "footwork"] });
    if (dx > 0.08) add({ titel: "Sprung nach vorne", sicherheit: dx > 0.14 ? cap("hoch", capFA) : "niedrig", bilder: fr(iL), key: iL,
      beobachtung: `Die Füsse landen etwa ${Math.round(dx * 100)} % der Körperlänge vor der Startposition. Die Stange ist vermutlich vor dir.`,
      fehler_ids: ["jump_fwd"], ursachen_ids: ["bar_away", "heels_early"] });
  }

  /* 8. Lange Stabilisierung unten und Aufstehen */
  {
    let k = iB; while (k > iL && s.hHip[k - 1] < s.hHip[iB] + 0.03) k--;
    let m = iB; while (m < n - 1 && s.hHip[m + 1] < s.hHip[iB] + 0.03) m++;
    const hold = (m - k) / fps;
    out.metrics.push({ label: "Zeit in der tiefsten Position", value: r2(hold) + " s" });
    if (hold > 0.8) add({ titel: "Lange Stabilisierung in der Hocke", sicherheit: "niedrig", bilder: fr(k, m), key: k,
      beobachtung: `Du bleibst ${r2(hold)} s fast unbewegt in der tiefsten Position (Bild ${k + 1} bis ${m + 1}), bevor du aufstehst. Das deutet auf eine unsichere Position hin.`,
      fehler_ids: [], ursachen_ids: lift === "sn" ? ["overhead_stab", "mobility"] : ["trunk_receive", "mobility"] });
    if (iU > 0) {
      const up = (iU - m) / fps;
      out.metrics.push({ label: "Aufstehen aus der tiefsten Position", value: r2(up) + " s" });
      if (up > 1.6) add({ titel: "Langsames Aufstehen", sicherheit: "niedrig", bilder: fr(m, iU), key: m,
        beobachtung: `Das Aufstehen dauert ${r2(up)} s.`, fehler_ids: [lift === "sn" ? "recover" : "recover_cl"], ursachen_ids: ["squat_strength"] });
    } else out.notAssessable.push("Das Aufstehen ist im Ausschnitt nicht vollständig zu sehen.");
  }

  /* 9. Überkopf-Stabilität (Reissen) */
  if (lift === "sn" && sideways && iU > iL) {
    const rel = []; for (let i = iL; i <= iU; i++) rel.push(s.face * (s.xWr[i] - s.xAn[i]));
    const span = Math.max(...rel) - Math.min(...rel);
    out.metrics.push({ label: "Wandern der Stange über Kopf (vor/zurück)", value: Math.round(span * 100) + " % der Körperlänge" });
    if (span > (view === "side" ? 0.14 : 0.22)) add({ titel: "Stange wandert über Kopf", sicherheit: "niedrig", bilder: fr(iL, iU), key: iL,
      beobachtung: `Zwischen Empfang und Stand wandern die Hände um etwa ${Math.round(span * 100)} % der Körperlänge vor und zurück.`,
      fehler_ids: [], ursachen_ids: ["overhead_stab"] });
  }

  smallCheck(s, out);
  finish(out);
  return out;
}

/* Kleine Person im Bild: Hand- und Fusspunkte werden unruhig. Sicherheit herabstufen, Ausreisser-Regeln abschwächen. */
function smallCheck(s, out) {
  if (s.L >= 130) return;
  out.notAssessable.unshift("Die Person ist klein im Bild. Messungen an Händen und Füssen sind deshalb ungenauer. Filme näher, sodass du etwa zwei Drittel der Bildhöhe ausfüllst.");
  const robust = /Zurücklehnen|Kopf/;
  out.findings.forEach(f => { if (!robust.test(f.titel)) f.sicherheit = "niedrig"; else if (f.sicherheit === "hoch") f.sicherheit = "mittel"; });
}

function analyzeJerk(s, track, out, { sideways, capFA, add, lvl, cap, sec, fr, fps, n }) {
  const startHip = median(s.hHip.slice(0, Math.min(6, n)));
  const iW = firstIdx(n, 0, i => s.hWr[i] > s.hNose[i]);
  if (iW < 0) { out.ok = false; out.summary = "Die Stange kommt im Ausschnitt nicht über den Kopf. Setze das Ende später."; return out; }
  const iD = argmin(s.hHip, 0, iW);
  const iD0 = Math.max(0, firstIdx(n, 0, i => s.hHip[i] < startHip - 0.01));
  const iT = argmax(s.hHip, iD, Math.min(n - 1, iW + 3));
  const iL = firstIdx(n, iW, i => s.hWr[i] > s.hNose[i] && s.elbow[i] > 158, 2);
  const anL0 = median(s.xAnL.slice(0, 6)), anR0 = median(s.xAnR.slice(0, 6));
  const iF = firstIdx(n, iD, i => Math.max(Math.abs(s.xAnL[i] - anL0), Math.abs(s.xAnR[i] - anR0)) > 0.05);
  out.events = { start: iD0, dip: iD, drive: iT, fuesse: iF, fest: iL };

  const depth = startHip - s.hHip[iD];
  out.metrics.push({ label: "Dip-Tiefe", value: Math.round(depth * 100) + " % der Körperlänge" });
  if (depth > 0.16) add({ titel: "Sehr tiefer Dip", sicherheit: "niedrig", bilder: fr(iD), key: iD,
    beobachtung: `Der Dip geht ${Math.round(depth * 100)} % der Körperlänge tief. Ein zu tiefer Dip kostet Spannung.`, fehler_ids: ["j_dip"], ursachen_ids: ["dip_balance", "dip_posture"] });

  if (sideways) {
    const tilt = s.lean[iD] - median(s.lean.slice(0, 6));
    out.metrics.push({ label: "Oberkörper kippt im Dip nach vorne", value: deg(tilt) + "°" });
    const a = lvl(tilt, 7, 12);
    if (a) add({ titel: "Oberkörper kippt im Dip nach vorne", sicherheit: cap(a, capFA), bilder: fr(iD), key: iD,
      beobachtung: `Im tiefsten Punkt des Dips (Bild ${iD + 1}) ist der Oberkörper um ${deg(tilt)}° nach vorne gekippt. Der Drive geht dann nach vorne.`,
      fehler_ids: ["j_dip", "j_fwd"], ursachen_ids: ["dip_balance", "dip_posture"] });
  }

  if (iF >= 0) {
    const early = (iT - iF) / fps;
    out.metrics.push({ label: "Füsse starten vor Ende des Drives", value: (early > 0 ? r2(early) : 0) + " s" });
    if (early > 0.04) add({ titel: "Füsse starten vor dem Ende des Drives", sicherheit: early > 0.08 ? "mittel" : "niedrig", bilder: fr(iF, iT), key: iF,
      beobachtung: `Die Füsse bewegen sich schon in Bild ${iF + 1}, die Hüfte erreicht ihren höchsten Punkt erst in Bild ${iT + 1}.`,
      fehler_ids: ["j_drive", "j_pressout"], ursachen_ids: ["patience", "drive_short"] });
  }

  if (iL >= 0) {
    const land = firstIdx(n, Math.max(iF, iT), i => i > 0 && Math.abs(s.xAnL[i] - s.xAnL[i - 1]) < 0.01 && Math.abs(s.xAnR[i] - s.xAnR[i - 1]) < 0.01, 2);
    if (land >= 0) {
      const el = s.elbow[land];
      out.metrics.push({ label: "Ellbogenwinkel bei der Landung", value: deg(el) + "°" });
      if (el < 150) add({ titel: "Arme noch gebeugt bei der Landung", sicherheit: el < 135 ? "mittel" : "niedrig", bilder: fr(land, iL), key: land,
        beobachtung: `Bei der Landung (Bild ${land + 1}) ist der Ellbogen erst ${deg(el)}° gestreckt, fest ist er in Bild ${iL + 1}. Das spricht für Ausdrücken.`,
        fehler_ids: ["j_pressout"], ursachen_ids: ["foot_speed", "drive_short", "overhead_jerk"] });
    }
    if (sideways) {
      const split = Math.abs(s.xAnL[iL] - s.xAnR[iL]);
      out.metrics.push({ label: "Abstand der Füsse beim Fixieren", value: Math.round(split * 100) + " % der Körperlänge", note: "bei schräger Sicht nur grob" });
      if (split > 0.22 && split < 0.38) add({ titel: "Split eher kurz", sicherheit: "niedrig", bilder: fr(iL), key: iL,
        beobachtung: `Die Füsse stehen beim Fixieren nur etwa ${Math.round(split * 100)} % der Körperlänge auseinander.`, fehler_ids: ["j_split"], ursachen_ids: ["split_position"] });
      const fwd = s.lean[iL];
      out.metrics.push({ label: "Oberkörper beim Fixieren", value: deg(fwd) + "° nach vorne" });
      if (fwd > 10) add({ titel: "Brust taucht im Split nach vorne", sicherheit: cap(fwd > 16 ? "hoch" : "mittel", capFA), bilder: fr(iL), key: iL,
        beobachtung: `Beim Fixieren (Bild ${iL + 1}) ist der Oberkörper ${deg(fwd)}° nach vorne geneigt.`, fehler_ids: ["j_dive", "j_frontleg"], ursachen_ids: ["chest_dive"] });
    }
  } else out.notAssessable.push("Der Moment mit fest gestreckten Armen ist im Ausschnitt nicht zu finden.");

  smallCheck(s, out);
  finish(out);
  return out;
}

const RANK = { hoch: 0, mittel: 1, niedrig: 2 };
function finish(out) {
  out.findings.sort((a, b) => RANK[a.sicherheit] - RANK[b.sicherheit]);
  const top = out.findings.filter(f => f.sicherheit !== "niedrig").map(f => f.titel);
  out.summary = out.findings.length
    ? (top.length ? "Am deutlichsten: " + top.slice(0, 2).join(" und ") + "." : "Nur schwache Hinweise gefunden, siehe unten.") + " Die Messwerte unten zeigen, worauf das beruht."
    : "Die Messregeln haben in diesem Versuch keine klaren Fehler gefunden.";
}
