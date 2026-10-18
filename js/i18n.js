/* Sprachen: Englisch (Grundtext), Deutsch, Französisch.
   t("key", {var}) liefert den Text in der gewählten Sprache, sonst Englisch.
   Platzhalter {name} werden ersetzt, Zahlen im Format der Sprache (0,47 statt 0.47).
   Übersetzungen des Katalogs und der Oberfläche stehen in js/lang/de.js und js/lang/fr.js. */
const LANGS = { en: "EN", de: "DE", fr: "FR" };
const I18N = { en: { ui: {} }, de: { ui: {} }, fr: { ui: {} } };
let LANG = (() => {
  try { const s = localStorage.getItem("barpath-lang"); if (LANGS[s]) return s; } catch (e) {}
  const n = (navigator.language || "en").slice(0, 2).toLowerCase();
  return LANGS[n] ? n : "en";
})();

function num(x, digits = 2) { return new Intl.NumberFormat(LANG, { maximumFractionDigits: digits }).format(x); }
function t(key, vars) {
  let s = I18N[LANG].ui[key] ?? I18N.en.ui[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] == null ? m : typeof vars[k] === "number" ? num(vars[k]) : vars[k]);
  return s;
}
/* Einzahl/Mehrzahl: key.one / key.other */
function tn(key, n, vars) { return t(key + (n === 1 ? ".one" : ".other"), { n, ...vars }); }

/* Statischer Text im HTML: data-i18n (Text), data-i18n-html (mit Auszeichnung), data-i18n-aria, data-i18n-ph */
function applyStatic(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(e => { e.textContent = t(e.dataset.i18n); });
  root.querySelectorAll("[data-i18n-html]").forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  root.querySelectorAll("[data-i18n-aria]").forEach(e => { e.setAttribute("aria-label", t(e.dataset.i18nAria)); });
  root.querySelectorAll("[data-i18n-ph]").forEach(e => { e.setAttribute("placeholder", t(e.dataset.i18nPh)); });
  document.documentElement.lang = LANG;
  document.querySelectorAll(".langs button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === LANG)));
}
function setLang(l) {
  if (!LANGS[l] || l === LANG) return;
  LANG = l;
  try { localStorage.setItem("barpath-lang", l); } catch (e) {}
  if (typeof applyCatalogLang === "function") applyCatalogLang();
  applyStatic();
  dispatchEvent(new Event("langchange"));
}

I18N.en.ui = {
  "lang.label": "Language",
  "nav.main": "Main", "nav.home": "Home", "nav.diagnosis": "Diagnosis", "nav.video": "Video", "nav.exercises": "Exercises",
  "brand.home": "BarPath, home",
  "title.home": "BarPath · Fix your Snatch, Clean & Jerk", "title.diagnosis": "Diagnosis · BarPath", "title.video": "Video analysis · BarPath", "title.exercises": "Exercises · BarPath",

  /* Home */
  "home.eyebrow": "Weightlifting & functional fitness",
  "home.h1": 'Find the fault.<br><span class="grad">Fix the lift.</span>',
  "home.lede": "See why your snatch, clean or jerk goes wrong and get the exercises that fix it, linked to the Catalyst Athletics exercise library.",
  "art.liftoff": "Lift-off", "art.knee": "Knee", "art.ext": "Extension", "art.catch": "Catch", "art.cap": "Bar path · Snatch",
  "mod.1": "Module 01", "mod.2": "Module 02", "mod.3": "Module 03",
  "mod.diag.h": "Diagnosis", "mod.diag.p": "Pick the fault you see, answer a few questions about yourself, then get your training plan.",
  "mod.diag.meta": "4 steps · about 3 min", "mod.diag.btn": "Start diagnosis",
  "mod.video.h": "Video analysis", "mod.video.p": "Upload a video of your lift. The app tracks your body, measures angles and timing, and points to the faults.",
  "mod.video.meta": "Runs on your device · no upload", "mod.video.btn": "Analyze a video",
  "mod.ex.h": "Exercises", "mod.ex.p": "Search all 624 exercises of the Catalyst Athletics library, with a link to each video.",
  "mod.ex.meta": "624 exercises", "mod.ex.btn": "Browse exercises",
  "hiw.label": "How it works",
  "hiw.1.h": "Spot the fault", "hiw.1.p": "What you see in your lift or on video.",
  "hiw.2.h": "Find the cause", "hiw.2.p": "Questions narrow down why it happens.",
  "hiw.3.h": "Train the fix", "hiw.3.p": "Exercises chosen for that cause.",

  /* Diagnosis */
  "diag.h1": "Diagnosis", "diag.steps": "Diagnosis steps",
  "step.lift": "Lift", "step.faults": "Faults", "step.questions": "Questions", "step.plan": "Plan",
  "step.1": "Step 1", "step.2": "Step 2", "step.3": "Step 3",
  "d1.h": "Which lift?", "d1.lede": "Choose the lift you want to fix.",
  "d2.h": "What do you see?", "d2.lede": "Select everything that applies. Filming yourself from the side at hip height helps.",
  "back": "Back", "selected": "{n} selected",
  "d2.next.one": "Next: 1 question", "d2.next.other": "Next: {n} questions", "d2.pick": "Pick a fault first",
  "d2.hint": "Tap at least one fault you see in your lift.",
  "d3.h": "Know yourself", "d3.lede": "Answer every question. If you don't know, choose \"Not sure\" and try the self-test.",
  "answered": "Answered", "d3.left.one": "1 question left", "d3.left.other": "{n} questions left", "d3.show": "Show my plan",
  "selftest": "Self-test",
  "plan.edit": "Edit answers", "plan.new": "New diagnosis",
  "plan.result": "Result · {lift}", "plan.h": "Your training plan", "plan.share": "Share plan",
  "plan.based": "Based on: {list}.", "plan.none": "No clear cause found. Go back and check your answers.",
  "lvl.likely": "likely", "lvl.possible": "possible", "lvl.check": "check",
  "selfcheck": "Self-check", "cue": "Cue",
  "plan.more": "{n} more possible causes with lower weight.",
  "txt.faults": "Faults:", "txt.causes": "Causes and exercises:", "txt.cue": "Cue: {c}",
  "share.shared": "Shared.", "share.copied": "Copied. Paste it into a message or your notes.",
  "share.manual": "Copying isn't allowed here. The text is selected, copy it manually.",

  /* Library */
  "lib.h1": "Exercises", "lib.lede": "The full Catalyst Athletics library. Exercises the diagnosis uses are marked.",
  "lib.search": "Search, e.g. “halting” or “jerk”", "lib.searchLabel": "Search exercises", "lib.cat": "Category",
  "lib.all": "All categories", "lib.only": "Diagnosis exercises only", "lib.inDiag": "In diagnosis",
  "lib.count": "{n} of {total} exercises",

  /* Video page */
  "v.h1": "Video analysis",
  "v1.h": "Upload a video", "v1.lede": "Your video stays on your device: the analysis runs right here. The camera angle is detected automatically.",
  "v.upload": "Upload video", "v.back1": "−1 frame", "v.fwd1": "+1 frame",
  "v2.h": "Mark the lift", "v2.lede": "Let the app find every lift in the video, then pick one. Make sure the right lift (snatch, clean or jerk) is selected above.",
  "v.find": "Find lifts automatically", "v.foundLabel": "Lifts found in the video",
  "v.manual": "Or mark it yourself",
  "v.manualP": "Scrub to just before the bar leaves the floor (for the jerk: just before the dip) and set the start. Then scrub to where you're standing and set the end. 2 to 4 seconds is ideal.",
  "v.setA": "Set start", "v.setB": "Set end", "v.analyze": "Analyze", "v.stop": "Stop",
  "v.tips": "Tips for good footage",
  "v.tipsP": "Whole body and barbell in frame the whole time, camera on a tripod at about hip height, nobody walking through the shot. Side view is the most accurate. Slow motion (60 fps or more) improves the timing measurements.",
  "v.result": "Result", "v.findings": "Video findings",
  "v.empty": "Upload a video, pick a lift and start the analysis. Findings with confidence, frame numbers, measurements and exercises appear here.",
  "v.range": "Start {a} · End {b}",
  "v.endBefore": "The end has to be after the start.", "v.long": "The clip is longer than 6 s. The analysis will take longer.",
  "v.cantPlay": "This browser can't play the video. Try an MP4 file.",
  "v.loading": "Loading the pose model …", "v.scanning": "Scanning the video: {p} %",
  "v.noneFound": "No {lift} found. Check the selected lift, or mark it yourself below.",
  "v.found.one": "Found 1 lift. It's selected, tap Analyze.", "v.found.other": "Found {n} lifts. The first is selected, tap another to switch.",
  "v.scanStopped": "Scan stopped.", "v.noFrames": "The video can't be read frame by frame. Try an MP4 file.",
  "v.scanFailed": "The scan failed. Mark the lift yourself below.",
  "v.detecting": "Detecting body points: frame {i} of {n}", "v.evaluating": "Evaluating …",
  "v.done": "Analysis complete.", "v.stopped": "Analysis stopped.", "v.failed": "The analysis failed. Reload the page and try again.",
  "v.frame": "Frame {f}",
  "v.creating": "Creating image …", "v.saved": "Image saved to your downloads.", "v.imgFail": "The image couldn't be created.",
  "v.shareImg": "Share image", "v.shareTxt": "Share text",
  "v.resultHead": "Result · {lift} · {view}",
  "v.noRule": "No measurement rule was triggered. That doesn't mean everything is perfect: the app can't see every fault. The diagnosis questionnaire can help.",
  "v.cause": "Cause: {c}", "v.meas": "Measurements", "v.na": "Not assessable from this video",
  "v.narrow": "Narrow it down in the diagnosis",
  "v.foot": "Automatic measurement from pose detection. The thresholds are guidelines and don't replace a coach.",
  "v.phases": "Detected phases",
  "conf.hoch": "High confidence", "conf.mittel": "Medium confidence", "conf.niedrig": "Low confidence",
  "view.side": "Side view", "view.oblique": "Diagonal view", "view.front": "Front or rear view",
  "ev.start": "Lift-off", "ev.knie": "Knee", "ev.streckung": "Extension", "ev.empfang": "Catch", "ev.tiefster": "Lowest point",
  "ev.stand": "Standing", "ev.dip": "Dip", "ev.drive": "Drive", "ev.fuesse": "Feet move", "ev.fest": "Lockout",

  /* Share image and text */
  "img.title": "Video findings", "img.ex": "Exercises · {c}", "img.meas": "Measurements",
  "img.foot1": "Exercises & videos: catalystathletics.com/exercises",
  "img.foot2": "Automatic measurement from pose detection. Not a substitute for coaching.",
  "txt.head": "BarPath · Video findings · {lift} ({view})", "txt.meas": "Measurements:",

  /* Video analysis: measurements and findings */
  "a.fail.detect": "The lifter was detected reliably in too few frames. Make sure the whole body is in the shot and nothing is in front of it.",
  "a.na.view": "Leaning back, jumping forward or back, and split length need a side or diagonal view.",
  "a.na.foot": "Foot pressure (toes, mid-foot, heel) can't be measured from video.",
  "a.na.bar": "Bar path: the app uses the wrists as a stand-in for the bar, so the exact distance to the body can't be measured.",
  "a.fail.liftoff": "No lift-off is visible in the marked clip. Set the start just before the bar leaves the floor.",
  "a.fail.shoulder": "The bar never gets above shoulder height in the clip. Set the end later, once you're standing.",
  "a.fail.arms": "The arms overhead weren't detected reliably (the lifter is too small in the frame, or arms and plates overlap). Film closer or from the side.",
  "a.fail.lock.sn": "I can't find a moment with locked arms overhead. Is the whole lift inside the clip?",
  "a.fail.lock.cl": "I can't find the moment the bar reaches the rack. Is the whole lift inside the clip?",
  "a.pct": "{n} % of body length",
  "a.note.under": "likely underestimated from a diagonal view", "a.note.rough": "rough estimate from a diagonal view",
  "m.lean": "Lean-back at the finish",
  "f.lean.t": "Leaning back hard at the finish",
  "f.lean.o": "Your torso is {d}° behind vertical (frame {f}, {s} s). The force goes backward instead of up.",
  "m.head": "Head tilted back (vs. start)",
  "f.head.t": "Head thrown back", "f.head.o": "Your head tilts back by about {d}° (frame {f}). This usually adds to the lean-back.",
  "m.trans.sn": "Extension to lockout overhead", "m.trans.cl": "Extension to bar in the rack",
  "f.trans.t": "Slow transition under the bar",
  "f.trans.o.sn": "From full extension (frame {a}) until the arms are locked (frame {b}) takes {s} s.",
  "f.trans.o.cl": "From full extension (frame {a}) until the bar is in the rack (frame {b}) takes {s} s.",
  "m.drop": "Drop after the catch", "m.catchH": "Catch height",
  "m.catchH.power": "Hips above knees (power height)", "m.catchH.low": "Hips at or below knees",
  "f.high.t": "Caught high, then slid into the squat",
  "f.high.o.above": "At the catch (frame {a}) your hips are still above the knees and then drop clearly until frame {b}. If you meant to do a power lift, this isn't a fault.",
  "f.high.o.fair": "At the catch (frame {a}) your hips are still fairly high and then drop clearly until frame {b}. If you meant to do a power lift, this isn't a fault.",
  "m.elbow": "Smallest elbow angle before extension",
  "f.arms.t": "Arms bend before full extension", "f.arms.o": "Already in frame {f}, before full extension, the elbow is bent to about {d}°.",
  "m.hip": "First pull: hip rise vs. shoulder rise",
  "f.hips.t": "Hips rise faster than shoulders in the first pull",
  "f.hips.o": "Until the bar reaches knee height (frame {f}), your hips rise {r} times as much as your shoulders.",
  "m.feet": "Foot shift after the catch", "m.feet.v": "{v} % (forward +, back −)",
  "f.jback.t": "Jumping backward", "f.jback.o": "Your feet land about {n} % of body length behind the start position. A small jump back is normal.",
  "f.jfwd.t": "Jumping forward", "f.jfwd.o": "Your feet land about {n} % of body length in front of the start position. The bar is probably in front of you.",
  "m.hold": "Time in the lowest position",
  "f.hold.t": "Long stabilisation in the squat",
  "f.hold.o": "You stay almost still in the lowest position for {s} s (frames {a} to {b}) before standing up. That points to an insecure position.",
  "m.up": "Standing up from the lowest position",
  "f.up.t": "Slow recovery", "f.up.o": "Standing up takes {s} s.",
  "a.na.recovery": "The recovery isn't fully visible in the clip.",
  "m.drift": "Bar drift overhead (forward/back)",
  "f.drift.t": "Bar drifts overhead", "f.drift.o": "Between the catch and standing, your hands drift forward and back by about {n} % of body length.",
  "a.na.small": "The lifter is small in the frame, so measurements at hands and feet are less accurate. Film closer, so you fill about two thirds of the frame height.",
  "a.fail.overhead": "The bar never gets overhead in the clip. Set the end later.",
  "m.dip": "Dip depth", "f.dipdeep.t": "Very deep dip", "f.dipdeep.o": "Your dip goes {n} % of body length deep. A dip that deep costs tension.",
  "m.tilt": "Torso tips forward in the dip",
  "f.tilt.t": "Torso tips forward in the dip", "f.tilt.o": "At the bottom of the dip (frame {f}) your torso is tipped forward by {d}°. The drive then goes forward.",
  "m.early": "Feet move before the drive ends",
  "f.early.t": "Feet move before the drive is finished", "f.early.o": "Your feet already move in frame {a}, but your hips only reach their highest point in frame {b}.",
  "m.elbowLand": "Elbow angle at landing",
  "f.bent.t": "Arms still bent at landing", "f.bent.o": "At landing (frame {a}) the elbow is only at {d}°, locked in frame {b}. That points to a press-out.",
  "m.split": "Foot distance at lockout",
  "f.split.t": "Split rather short", "f.split.o": "At lockout your feet are only about {n} % of body length apart.",
  "m.torso": "Torso at lockout", "m.torso.v": "{d}° forward",
  "f.dive.t": "Chest dives forward in the split", "f.dive.o": "At lockout (frame {f}) your torso leans {d}° forward.",
  "a.na.lockout": "The moment with locked arms can't be found in the clip.",
  "sum.top": "Most clearly: {list}.", "sum.and": " and ", "sum.weak": "Only weak signs found, see below.",
  "sum.basis": " The measurements below show what this is based on.", "sum.none": "The measurement rules found no clear faults in this lift.",

  /* Catalog: options shared by many questions */
  "opt.Yes": "Yes", "opt.No": "No", "opt.Not sure": "Not sure"
};
