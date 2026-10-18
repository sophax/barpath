/* Share video findings: as an image (key frames, cues, exercises, measurements) or as text with links.
   On phones this opens the share sheet; elsewhere the image is downloaded and the text copied. */

const C = { bg: "#f5f5f7", card: "#ffffff", fill: "#f5f5f7", ink: "#1d1d1f", muted: "#6e6e73",
  red: "#e3262f", redText: "#c4101b", redSoft: "#fdecec", amber: "#c26a00", amberSoft: "#fff1dc", greySoft: "#e8e8ed", line: "#dcdce1" };
const SANS = '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
const CONF = { hoch: [C.redText, C.redSoft], mittel: [C.amber, C.amberSoft], niedrig: [C.muted, C.greySoft] };

function wrap(g, text, maxW) {
  const words = String(text).split(/\s+/), lines = []; let line = "";
  for (const w of words) { const test = line ? line + " " + w : w; if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
  if (line) lines.push(line);
  return lines;
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function dot(g, x, y, color, r = 6) { g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }

/* data: {lift, view, summary, findings:[{titel, sicherheit, beobachtung, shot, causes:[{t, cue, ex:[names]}]}], metrics:[{label, value}]} */
export async function findingsImage(data) {
  await document.fonts?.ready;
  const W = 1080, P = 56, IW = W - 2 * P;
  const c = document.createElement("canvas"); c.width = W; c.height = 7000;
  const g = c.getContext("2d");
  g.fillStyle = C.bg; g.fillRect(0, 0, W, c.height);
  let y = 0;

  // Header
  const plates = [["#e3262f", 46], ["#1f5fbf", 38], ["#f2b705", 32], ["#25834a", 26]];
  plates.forEach(([col, h], k) => { g.fillStyle = col; rr(g, P + k * 13, 86 - h / 2, 9, h, 3); g.fill(); });
  g.fillStyle = C.ink; g.font = `700 26px ${SANS}`; g.fillText("BarPath", P + 66, 80);
  g.fillStyle = C.muted; g.font = `500 22px ${SANS}`; g.fillText(data.lift + " · " + data.view + " · " + new Date().toLocaleDateString(LANG, { day: "numeric", month: "short", year: "numeric" }), P + 66, 110);
  g.fillStyle = C.ink; g.font = `700 64px ${SANS}`; g.fillText(t("img.title"), P, 214);
  y = 276;

  // Summary
  g.fillStyle = C.ink; g.font = `500 30px ${SANS}`;
  for (const l of wrap(g, data.summary, IW)) { g.fillText(l, P, y); y += 42; }
  y += 24;

  // Findings
  for (const f of data.findings.slice(0, 4)) {
    const top = y, thumbW = 300, tx = P + 28 + thumbW + 28, tw = W - P - 28 - tx;
    const thumbH = f.shot ? Math.round(thumbW * f.shot.height / f.shot.width) : 0;
    // measure text block
    g.font = `800 34px ${SANS}`; const tl = wrap(g, f.titel, tw);
    g.font = `400 24px ${SANS}`; const ol = wrap(g, f.beobachtung, tw);
    const cause = f.causes[0];
    g.font = `600 24px ${SANS}`; const cl = cause ? wrap(g, cause.cue, tw - 40) : [];
    const textH = 40 + tl.length * 42 + 44 + ol.length * 34 + (cause ? 24 + 36 + cl.length * 32 + 26 + 24 + Math.min(3, cause.ex.length) * 34 : 0) + 24;
    const h = Math.max(textH, thumbH + 56);
    g.save(); g.shadowColor = "rgba(0,0,0,.06)"; g.shadowBlur = 30; g.shadowOffsetY = 8;
    g.fillStyle = C.card; rr(g, P, top, IW, h, 28); g.fill(); g.restore();
    if (f.shot) { g.save(); rr(g, P + 28, top + 28, thumbW, thumbH, 12); g.clip(); g.drawImage(f.shot, P + 28, top + 28, thumbW, thumbH); g.restore(); }
    let ty = top + 40;
    const [confCol, confBg] = CONF[f.sicherheit] || CONF.niedrig, confTxt = t("conf." + (CONF[f.sicherheit] ? f.sicherheit : "niedrig"));
    g.font = `600 20px ${SANS}`; const cw = g.measureText(confTxt).width + 50;
    g.fillStyle = confBg; rr(g, tx, ty - 28, cw, 38, 19); g.fill();
    dot(g, tx + 20, ty - 9, confCol, 5); g.fillStyle = confCol; g.fillText(confTxt, tx + 34, ty);
    ty += 50; g.fillStyle = C.ink; g.font = `700 34px ${SANS}`; for (const l of tl) { g.fillText(l, tx, ty); ty += 42; }
    ty += 2; g.fillStyle = C.muted; g.font = `400 24px ${SANS}`; for (const l of ol) { g.fillText(l, tx, ty); ty += 34; }
    if (cause) {
      ty += 14;
      const ch = 36 + cl.length * 32 + 8;
      g.fillStyle = C.redSoft; rr(g, tx, ty, tw, ch, 16); g.fill();
      g.fillStyle = C.redText; g.font = `600 19px ${SANS}`; g.fillText(t("cue"), tx + 20, ty + 32);
      g.fillStyle = C.ink; g.font = `500 24px ${SANS}`; let cy = ty + 66; for (const l of cl) { g.fillText(l, tx + 20, cy); cy += 32; }
      ty += ch + 34;
      g.fillStyle = C.muted; g.font = `600 19px ${SANS}`; g.fillText(t("img.ex", { c: cause.t }).slice(0, 52), tx, ty); ty += 34;
      g.fillStyle = C.ink; g.font = `600 24px ${SANS}`;
      for (const e of cause.ex.slice(0, 3)) { g.fillStyle = C.redText; g.fillText("→", tx, ty); g.fillStyle = C.ink; g.fillText(e, tx + 34, ty); ty += 34; }
    }
    y = top + h + 28;
  }

  // Measurements
  if (data.metrics.length) {
    const rows = data.metrics.slice(0, 9), rh = 50, h = 84 + rows.length * rh;
    g.fillStyle = C.card; rr(g, P, y, IW, h, 28); g.fill();
    g.fillStyle = C.ink; g.font = `700 26px ${SANS}`; g.fillText(t("img.meas"), P + 28, y + 48);
    let my = y + 48 + rh;
    rows.forEach((m, k) => {
      if (k) { g.fillStyle = C.line; g.fillRect(P + 28, my - 32, IW - 56, 1); }
      g.fillStyle = C.ink; g.font = `400 22px ${SANS}`; g.fillText(m.label, P + 28, my);
      g.font = `600 22px ${SANS}`; const v = String(m.value); g.fillText(v, W - P - 28 - g.measureText(v).width, my);
      my += rh;
    });
    y += h + 32;
  }

  // Footer
  g.fillStyle = C.muted; g.font = `400 20px ${SANS}`;
  g.fillText(t("img.foot1"), P, y + 10);
  g.fillText(t("img.foot2"), P, y + 40);
  y += 80;

  const out = document.createElement("canvas"); out.width = W; out.height = y;
  out.getContext("2d").drawImage(c, 0, 0);
  return await new Promise(r => out.toBlob(r, "image/png"));
}

export function findingsText(data, urls) {
  const NL = "\n", lines = [t("txt.head", { lift: data.lift, view: data.view }), "", data.summary, ""];
  data.findings.forEach((f, i) => {
    lines.push((i + 1) + ". " + f.titel + " [" + t("conf." + (CONF[f.sicherheit] ? f.sicherheit : "niedrig")) + "]");
    lines.push("   " + f.beobachtung);
    f.causes.forEach(c => { lines.push("   " + t("txt.cue", { c: c.cue })); c.ex.slice(0, 3).forEach((e, k) => lines.push("   • " + e + " – " + c.urls[k])); });
    lines.push("");
  });
  if (data.metrics.length) { lines.push(t("txt.meas")); data.metrics.forEach(m => lines.push("- " + m.label + ": " + m.value)); }
  return lines.join(NL);
}

/* Share a file via the share sheet, or download it */
export async function shareFile(blob, name, title) {
  const file = new File([blob], name, { type: blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); return "shared"; }
    catch (e) { if (e && e.name === "AbortError") return "cancelled"; }
  }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return "downloaded";
}
