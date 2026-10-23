/* Clubs page: map of Switzerland with all Swiss Weightlifting clubs.
   Regions zoom the map in so the markers are easy to tap on a phone; "Near me" sorts by distance.
   The location is only used on the device and never stored.
   Uses CLUBS, CH_OUTLINE, CH_LAKES (data/clubs.js) and el, $, t, tn, num (app.js, i18n.js). */
const SVGNS = "http://www.w3.org/2000/svg";
const MAP = { lon0: 5.90, lat1: 47.86, k: 220, cos: Math.cos(46.8 * Math.PI / 180) };
const proj = (lon, lat) => [(lon - MAP.lon0) * MAP.k * MAP.cos, (MAP.lat1 - lat) * MAP.k];
const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
const pathD = pts => "M" + pts.map(([lo, la]) => proj(lo, la).map(v => v.toFixed(1)).join(",")).join("L") + "Z";
const FULL = (() => { const [w] = proj(10.55, 46), [, h] = proj(6, 45.78); return { x: 0, y: 0, w, h }; })();

/* Regions by town */
const REGIONS = [
  { id: "leman", towns: ["Lausanne", "Vernier (Le Lignon)", "Grand-Lancy"] },
  { id: "jura", towns: ["Neuchâtel", "Le Landeron", "La Chaux-de-Fonds", "Biel/Bienne", "Tramelan", "Moutier", "Grenchen", "Solothurn"] },
  { id: "bern", towns: ["Bern", "Fribourg"] },
  { id: "nw", towns: ["Basel", "Reinach BL"] },
  { id: "zh", towns: ["Zürich-Altstetten", "Zürich", "Rorschach"] },
  { id: "central", towns: ["Luzern", "Schwyz", "Lugano"] }
];
const TOWNS = [];
CLUBS.forEach(c => { let tw = TOWNS.find(x => x.city === c.city); if (!tw) TOWNS.push(tw = { city: c.city, ct: c.ct, lat: c.lat, lon: c.lon, clubs: [] }); tw.clubs.push(c); });
TOWNS.forEach(tw => { tw.region = REGIONS.find(r => r.towns.includes(tw.city))?.id; [tw.x, tw.y] = proj(tw.lon, tw.lat); });

const ST = { region: null, town: null, me: null, near: false, vb: null, anim: 0, msg: "", err: false };

/* Visible section for a region (or the user's surroundings), kept at the map's aspect ratio */
function mapAR() { const s = $("clubmap").querySelector("svg"); return s && s.clientHeight ? s.clientWidth / s.clientHeight : FULL.w / FULL.h; }
function fit(x0, y0, w, h, ar) {
  if (w / h < ar) { const nw = h * ar; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / ar; y0 -= (nh - h) / 2; h = nh; }
  return { x: x0, y: y0, w, h };
}
const fullBox = () => fit(0, 0, FULL.w, FULL.h, mapAR());
/* Margin in screen pixels around the points, so the town names fit next to the dots */
function boxFor(points, mx = 62, my = 40) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]), ar = mapAR();
  const svg = $("clubmap").querySelector("svg"), wPx = (svg && svg.clientWidth) || 700, hPx = wPx / ar;
  const sx = Math.max(Math.max(...xs) - Math.min(...xs), 60), sy = Math.max(Math.max(...ys) - Math.min(...ys), 40);
  // Einheiten pro Pixel, damit die Punkte samt Rand hineinpassen (breit oder hoch, je nachdem was knapper ist)
  const upp = Math.max(sx / Math.max(1, wPx - 2 * mx), sy / Math.max(1, hPx - 2 * my));
  const w = wPx * upp, h = hPx * upp, cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return w > FULL.w ? fullBox() : { x: cx - w / 2, y: cy - h / 2, w, h };
}
function targetBox() {
  if (ST.near && ST.me && ST.me.close) return boxFor([ST.me.xy, ...ST.me.nearest.map(tw => [tw.x, tw.y])]);
  if (!ST.region) return fullBox();
  return boxFor(TOWNS.filter(tw => tw.region === ST.region).map(tw => [tw.x, tw.y]));
}
function zoomTo(box) {
  cancelAnimationFrame(ST.anim);
  if (document.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches) { ST.vb = box; drawMap(); return; } // ohne Animation direkt ans Ziel
  const from = { ...ST.vb }, t0 = performance.now(), dur = 520;
  const ease = x => 1 - Math.pow(1 - x, 3);
  const step = now => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = ease(k);
    ST.vb = { x: from.x + (box.x - from.x) * e, y: from.y + (box.y - from.y) * e, w: from.w + (box.w - from.w) * e, h: from.h + (box.h - from.h) * e };
    drawMap();
    if (k < 1) ST.anim = requestAnimationFrame(step);
  };
  ST.anim = requestAnimationFrame(step);
}

/* Map */
function drawMap() {
  const box = $("clubmap");
  let svg = box.querySelector("svg");
  if (!svg) {
    svg = svgEl("svg", { role: "group" });
    svg.innerHTML = '<defs><linearGradient id="ch-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef0f4"/></linearGradient>'
      + '<radialGradient id="pin-fill" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff5a5f"/><stop offset="1" stop-color="#c4101b"/></radialGradient></defs>';
    svg.append(svgEl("path", { class: "ch-land", d: pathD(CH_OUTLINE), fill: "url(#ch-fill)" }));
    CH_LAKES.forEach(l => svg.append(svgEl("path", { class: "ch-lake", d: pathD(l) })));
    svg.append(svgEl("g", { class: "pins" }));
    svg.addEventListener("click", onMapTap);
    box.append(svg);
  }
  if (!ST.vb) ST.vb = fullBox();
  const vb = ST.vb, wPx = svg.clientWidth || 700;
  const u = vb.w / wPx; // SVG-Einheiten pro Bildschirmpixel: Punkte und Schrift bleiben gleich gross
  const zoomed = vb.w < FULL.w * 0.8;
  svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  svg.setAttribute("aria-label", t("clubs.mapLabel"));
  svg.querySelector(".ch-land").setAttribute("stroke-width", 1.5 * u);
  svg.querySelectorAll(".ch-lake").forEach(p => p.setAttribute("stroke-width", u));
  const pins = svg.querySelector(".pins"); pins.replaceChildren();
  const near = ST.near && ST.me, labels = [];
  TOWNS.forEach(tw => {
    const dim = ST.region && tw.region !== ST.region && !near, on = tw === ST.town, many = tw.clubs.length > 1;
    const g = svgEl("g", { class: "pin" + (on ? " on" : "") + (dim ? " dim" : ""), transform: `translate(${tw.x},${tw.y})`, tabindex: dim ? "-1" : "0", role: "button",
      "aria-label": tw.city + ", " + tn("clubs.n", tw.clubs.length), "aria-pressed": String(on) });
    const r = (zoomed ? (many ? 13 : 11) : (many ? 9 : 7)) * u;
    if (on) g.append(svgEl("circle", { class: "ring", r: r + 7 * u, "stroke-width": 1.5 * u }));
    g.append(svgEl("circle", { class: "dot", r, fill: "url(#pin-fill)", "stroke-width": 2.5 * u }));
    if (many) { const tx = svgEl("text", { class: "cnt", "text-anchor": "middle", dy: 4 * u, "font-size": (zoomed ? 12 : 10) * u }); tx.textContent = tw.clubs.length; g.append(tx); }
    if ((zoomed && !dim) || on) labels.push({ tw, g, r });
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickTown(tw); } });
    pins.append(g);
  });
  placeLabels(labels, u, vb);
  if (ST.me && ST.me.inMap) {
    const me = svgEl("g", { class: "me", transform: `translate(${ST.me.xy[0]},${ST.me.xy[1]})` });
    me.append(svgEl("circle", { class: "me-halo", r: 16 * u }), svgEl("circle", { class: "me-dot", r: 6 * u, "stroke-width": 2.5 * u }));
    pins.append(me);
  }
  const sel = pins.querySelector(".pin.on"); if (sel) pins.append(sel); // ausgewählter Punkt oben
}

/* Labels: try right, left, above, below; skip spots that hit another label or dot */
function placeLabels(items, u, vb) {
  const fs = 12 * u, taken = TOWNS.map(tw => ({ x0: tw.x - 12 * u, x1: tw.x + 12 * u, y0: tw.y - 12 * u, y1: tw.y + 12 * u, tw }));
  const hit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  items.sort((a, b) => (b.tw === ST.town) - (a.tw === ST.town) || a.tw.x - b.tw.x);
  for (const { tw, g, r } of items) {
    const w = tw.city.length * fs * 0.56, h = fs * 1.15, gap = r + 4 * u;
    const opts = [
      { x: gap, y: fs * 0.35, anchor: "start", box: { x0: tw.x + gap, x1: tw.x + gap + w, y0: tw.y - h / 2, y1: tw.y + h / 2 } },
      { x: -gap, y: fs * 0.35, anchor: "end", box: { x0: tw.x - gap - w, x1: tw.x - gap, y0: tw.y - h / 2, y1: tw.y + h / 2 } },
      { x: 0, y: -gap - 2 * u, anchor: "middle", box: { x0: tw.x - w / 2, x1: tw.x + w / 2, y0: tw.y - gap - h, y1: tw.y - gap } },
      { x: 0, y: gap + fs * 0.9, anchor: "middle", box: { x0: tw.x - w / 2, x1: tw.x + w / 2, y0: tw.y + gap, y1: tw.y + gap + h } },
      { x: gap * 0.7, y: -gap * 0.7, anchor: "start", box: { x0: tw.x + gap * 0.7, x1: tw.x + gap * 0.7 + w, y0: tw.y - gap * 0.7 - h, y1: tw.y - gap * 0.7 } },
      { x: gap * 0.7, y: gap * 0.7 + fs * 0.8, anchor: "start", box: { x0: tw.x + gap * 0.7, x1: tw.x + gap * 0.7 + w, y0: tw.y + gap * 0.7, y1: tw.y + gap * 0.7 + h } },
      { x: -gap * 0.7, y: -gap * 0.7, anchor: "end", box: { x0: tw.x - gap * 0.7 - w, x1: tw.x - gap * 0.7, y0: tw.y - gap * 0.7 - h, y1: tw.y - gap * 0.7 } },
      { x: -gap * 0.7, y: gap * 0.7 + fs * 0.8, anchor: "end", box: { x0: tw.x - gap * 0.7 - w, x1: tw.x - gap * 0.7, y0: tw.y + gap * 0.7, y1: tw.y + gap * 0.7 + h } }
    ];
    const m = 3 * u, inside = b => b.x0 > vb.x + m && b.x1 < vb.x + vb.w - m && b.y0 > vb.y + m && b.y1 < vb.y + vb.h - m;
    const pick = opts.find(o => inside(o.box) && !taken.some(b => b.tw !== tw && hit(o.box, b))) || (tw === ST.town ? opts.find(o => inside(o.box)) : null);
    if (!pick && tw !== ST.town) continue;
    const o = pick || opts[0];
    taken.push(o.box);
    const lb = svgEl("text", { class: "townlbl", x: o.x, y: o.y, "text-anchor": o.anchor, "font-size": fs, "stroke-width": 4 * u });
    lb.textContent = tw.city; g.append(lb);
  }
}

/* Tap: whole country on a phone → zoom into the region; zoomed in or wide screen → pick the nearest town */
function onMapTap(e) {
  const svg = e.currentTarget, pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  const u = ST.vb.w / (svg.clientWidth || 700);
  const pool = TOWNS.filter(tw => !ST.region || ST.near || tw.region === ST.region);
  let best = null, bd = Infinity;
  pool.forEach(tw => { const d = Math.hypot(tw.x - p.x, tw.y - p.y); if (d < bd) { bd = d; best = tw; } });
  if (!best) return;
  const wide = $("clubmap").clientWidth >= 560, zoomed = ST.vb.w < FULL.w * 0.8;
  if (!zoomed && !wide) { if (bd < 60 * u) setRegion(best.region); return; }
  if (bd < 34 * u) pickTown(best);
}
function pickTown(tw) {
  ST.town = ST.town === tw ? null : tw;
  if (ST.town && !ST.near && ST.region !== tw.region) { ST.region = tw.region; zoomTo(targetBox()); }
  renderSide(); drawMap(); renderRegionBar();
  if (ST.town) { const row = $("clublist").querySelector(".clubrow.hl"); if (row && innerWidth < 1024) row.scrollIntoView({ behavior: "smooth", block: "center" }); }
}
function setRegion(id) {
  ST.region = id; ST.town = null; ST.near = false; ST.msg = ""; ST.err = false;
  renderRegionBar(); renderSide(); zoomTo(targetBox());
}

/* Near me */
const km = (a, b) => { const R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lon - a.lon) * r;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
function setMsg(text, err) { ST.msg = text; ST.err = !!err; }
function nearMe() {
  if (!navigator.geolocation) { setMsg(t("clubs.unavailable"), true); renderSide(); return; }
  setMsg(t("clubs.locating")); renderSide();
  navigator.geolocation.getCurrentPosition(pos => {
    const me = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    TOWNS.forEach(tw => { tw.km = km(me, tw); });
    const sorted = [...TOWNS].sort((a, b) => a.km - b.km), first = sorted[0];
    me.xy = proj(me.lon, me.lat);
    me.inMap = me.xy[0] > -40 && me.xy[0] < FULL.w + 40 && me.xy[1] > -40 && me.xy[1] < FULL.h + 40;
    me.close = first.km < 150 && me.inMap;
    me.nearest = sorted.slice(0, 4);
    count("clubs-near-me", true);
    ST.me = me; ST.near = true; ST.region = null; ST.town = null;
    setMsg(me.close ? t("clubs.nearOk") : t("clubs.far", { club: first.clubs[0].n, city: first.city, km: Math.round(first.km) }));
    renderRegionBar(); renderSide(); zoomTo(targetBox());
  }, err => {
    setMsg(err && err.code === 1 ? t("clubs.denied") : t("clubs.unavailable"), true); renderSide();
  }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
}

/* Region bar */
function renderRegionBar() {
  const bar = $("regionbar"), chip = (label, on, fn, cls = "") => el("button", { class: "rchip" + cls, type: "button", "aria-pressed": String(on), onclick: fn }, label);
  const items = [chip(t("clubs.region.all"), !ST.region && !ST.near, () => setRegion(null))];
  if (navigator.geolocation) items.push(chip(t("clubs.near"), ST.near, nearMe, " near"));
  REGIONS.forEach(r => items.push(chip(t("clubs.region." + r.id) + " · " + TOWNS.filter(tw => tw.region === r.id).reduce((s, tw) => s + tw.clubs.length, 0), ST.region === r.id && !ST.near, () => setRegion(r.id))));
  bar.replaceChildren(...items);
  const on = bar.querySelector('[aria-pressed="true"]');
  if (on && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: on.offsetLeft - bar.clientWidth / 2 + on.clientWidth / 2, behavior: "smooth" });
}

/* List: plain rows, no logos */
const MAIL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>';
const IG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="#fff"/></svg>';
// Facebook-Seiten mit ihrem Namen beschriften, sonst «Website»
const webLabel = u => /facebook\.com/.test(u) ? "Facebook" : t("clubs.web");
function clubRow(c, tw) {
  const a = el("a", { class: "mailbtn", href: "mailto:" + c.mail + "?subject=" + encodeURIComponent(t("clubs.subject")), "aria-label": t("clubs.mailTo", { club: c.n }), onclick: () => count("club-contact", true) });
  a.innerHTML = MAIL_ICON;
  // Instagram als runder Knopf wie die Mail, damit die Zeile auf dem Handy nicht zu breit wird
  let ig = "";
  if (c.ig) { ig = el("a", { class: "igbtn", href: c.ig, target: "_blank", rel: "noopener", "aria-label": "Instagram · " + c.n }); ig.innerHTML = IG_ICON; }
  const meta = el("span", { class: "meta" }, el("span", {}, c.city), el("span", { class: "ct" }, c.ct));
  if (ST.near && tw.km != null) meta.append(el("span", { class: "dist" }, t("clubs.km", { km: tw.km < 10 ? num(tw.km, 1) : Math.round(tw.km) })));
  return el("li", { class: "clubrow" + (tw === ST.town ? " hl" : "") },
    el("span", { class: "clubinfo" }, el("b", {}, c.n), meta),
    c.web ? el("a", { class: "webbtn", href: c.web, target: "_blank", rel: "noopener" }, webLabel(c.web)) : "", ig, a);
}
function renderSide() {
  let towns = TOWNS.filter(tw => ST.near || !ST.region || tw.region === ST.region);
  if (ST.near && ST.me) towns = [...towns].sort((a, b) => a.km - b.km);
  else towns = [...towns].sort((a, b) => a.city.localeCompare(b.city, LANG));
  if (ST.town) towns = [ST.town, ...towns.filter(tw => tw !== ST.town)];
  const rows = towns.flatMap(tw => [...tw.clubs].sort((a, b) => a.n.localeCompare(b.n, LANG)).map(c => clubRow(c, tw)));
  $("clublist").replaceChildren(...rows);
  $("clubtitle").textContent = ST.near ? t("clubs.near") : ST.region ? t("clubs.region." + ST.region) : t("clubs.all");
  $("clubcount").textContent = t("clubs.count", { n: rows.length, towns: towns.length });
  const m = $("clubmsg"); m.textContent = ST.msg; m.classList.toggle("err", ST.err);
}

function renderClubs() { renderRegionBar(); renderSide(); drawMap(); const b = targetBox(); if (Math.abs(b.w - ST.vb.w) > 1 || Math.abs(b.h - ST.vb.h) > 1) { ST.vb = b; drawMap(); } }
let resizeT; addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (parse().page === "clubs") { ST.vb = targetBox(); drawMap(); } }, 150); });
if (parse().page === "clubs") renderClubs();
