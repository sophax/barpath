/* Clubs page: map of Switzerland with all Swiss Weightlifting clubs, a detail card and the full list.
   Clubs in the same town share one marker. Uses CLUBS and CH_OUTLINE (data/clubs.js) and el, $, t, tn (app.js, i18n.js). */
const SVGNS = "http://www.w3.org/2000/svg";
const MAP = { lon0: 5.90, lat1: 47.86, k: 220, cos: Math.cos(46.8 * Math.PI / 180) };
const proj = (lon, lat) => [Math.round((lon - MAP.lon0) * MAP.k * MAP.cos * 10) / 10, Math.round((MAP.lat1 - lat) * MAP.k * 10) / 10];
const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };

/* Towns: one marker per place */
const TOWNS = [];
CLUBS.forEach(c => { let tw = TOWNS.find(x => x.city === c.city); if (!tw) TOWNS.push(tw = { city: c.city, ct: c.ct, lat: c.lat, lon: c.lon, clubs: [] }); tw.clubs.push(c); });
let selTown = null;

function mailLink(c) {
  return "mailto:" + c.mail + "?subject=" + encodeURIComponent(t("clubs.subject"));
}
function clubCard(c) {
  return el("li", { class: "clubcard" },
    el("span", { class: "clubinfo" }, el("b", {}, c.n), el("span", { class: "label" }, c.city + " · " + c.ct)),
    el("span", { class: "clubact" },
      el("a", { class: "btn primary", href: mailLink(c) }, t("clubs.mail")),
      c.web ? el("a", { class: "btn", href: c.web, target: "_blank", rel: "noopener" }, t("clubs.web")) : ""));
}

function renderMap() {
  const box = $("clubmap"), wPx = box.clientWidth || 700; box.replaceChildren();
  const [w] = proj(10.55, 46), [, h] = proj(6, 45.78);
  const sc = Math.min(2, Math.max(1, (w / wPx) * 0.9)); // auf schmalen Bildschirmen grössere Punkte
  const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "group", "aria-label": t("clubs.mapLabel") });
  const defs = svgEl("defs");
  defs.innerHTML = '<linearGradient id="ch-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef0f4"/></linearGradient>'
    + '<radialGradient id="pin-fill" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff5a5f"/><stop offset="1" stop-color="#c4101b"/></radialGradient>'
    + '<filter id="ch-shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".10"/></filter>';
  svg.append(defs);
  svg.append(svgEl("path", { class: "ch-land", d: "M" + CH_OUTLINE.map(([lo, la]) => proj(lo, la).join(",")).join("L") + "Z", fill: "url(#ch-fill)", filter: "url(#ch-shadow)" }));
  const path = pts => "M" + pts.map(([lo, la]) => proj(lo, la).join(",")).join("L") + "Z";
  CH_LAKES.forEach(l => svg.append(svgEl("path", { class: "ch-lake", d: path(l) })));
  TOWNS.forEach(tw => {
    const [x, y] = proj(tw.lon, tw.lat), on = tw === selTown, many = tw.clubs.length > 1;
    const g = svgEl("g", { class: "pin" + (on ? " on" : ""), transform: `translate(${x},${y})`, tabindex: "0", role: "button",
      "aria-label": tw.city + ", " + tn("clubs.n", tw.clubs.length), "aria-pressed": String(on) });
    if (on) g.append(svgEl("circle", { class: "ring", r: 15 * sc }));
    g.append(svgEl("circle", { class: "dot", r: (many ? 9 : 7) * sc, fill: "url(#pin-fill)", "stroke-width": 2.5 * sc }));
    if (many) { const tx = svgEl("text", { class: "cnt", "text-anchor": "middle", dy: 3.6 * sc, "font-size": 10 * sc }); tx.textContent = tw.clubs.length; g.append(tx); }
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickTown(tw); } });
    svg.append(g);
  });
  // Selected town on top, with its name
  if (selTown) {
    const [x, y] = proj(selTown.lon, selTown.lat);
    const lbl = svgEl("text", { class: "townlbl", x, y: y - 20, "text-anchor": "middle" }); lbl.textContent = selTown.city;
    svg.append(lbl);
    const g = [...svg.querySelectorAll(".pin.on")][0]; if (g) svg.append(g);
  }
  // Tippen: der nächste Ort zählt, damit nahe Punkte am Handy treffbar bleiben
  svg.addEventListener("click", e => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    let best = null, bd = Infinity;
    TOWNS.forEach(tw => { const [x, y] = proj(tw.lon, tw.lat), d = Math.hypot(x - p.x, y - p.y); if (d < bd) { bd = d; best = tw; } });
    if (best && bd < 34 * sc) pickTown(best);
  });
  if (selTown) { const lbl = svg.querySelector(".townlbl"); lbl.setAttribute("font-size", 15 * sc); lbl.setAttribute("y", proj(selTown.lon, selTown.lat)[1] - 20 * sc); }
  box.append(svg);
}
function pickTown(tw) {
  selTown = selTown === tw ? null : tw; renderClubs();
  if (selTown && innerWidth < 1024) $("clubpanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderPanel() {
  const box = $("clubpanel"); box.replaceChildren();
  if (!selTown) {
    box.append(el("div", { class: "sheethead" }, el("div", {}, el("span", { class: "stepnum" }, t("clubs.mapEyebrow")), el("h2", {}, t("clubs.pickH")))),
      el("p", { class: "lede" }, t("clubs.pick")));
    return;
  }
  box.append(el("div", { class: "sheethead" }, el("div", {}, el("span", { class: "stepnum" }, selTown.ct + " · " + tn("clubs.n", selTown.clubs.length)), el("h2", {}, selTown.city))),
    el("ul", { class: "clublist" }, selTown.clubs.map(clubCard)));
}

function renderClubs() {
  renderMap(); renderPanel();
  const list = [...CLUBS].sort((a, b) => a.city.localeCompare(b.city, LANG) || a.n.localeCompare(b.n, LANG));
  $("clublist").replaceChildren(...list.map(clubCard));
  $("clubcount").textContent = t("clubs.count", { n: CLUBS.length, towns: TOWNS.length });
}

let resizeT; addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (parse().page === "clubs") renderMap(); }, 200); });
if (parse().page === "clubs") renderClubs();
