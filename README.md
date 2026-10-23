# BarPath

Web-App für olympisches Gewichtheben und Functional Fitness, auf Englisch, Deutsch und Französisch: Fehler im Snatch, Clean und Jerk erkennen, die wahrscheinliche Ursache eingrenzen und passende Übungen aus der [Catalyst Athletics Exercise Library](https://www.catalystathletics.com/exercises/) finden.

- **Startseite** (`#/`): führt zu den drei Modulen.
- **Diagnosis** (`#/diagnosis/…`): geführt in vier Schritten (Lift → Faults → Questions → Plan). Der Plan erscheint erst, wenn alle Fragen beantwortet sind.
- **Video analysis** (`#/video`): Video hochladen, den Rest macht die App: Sie findet die Versuche, erkennt die Übung und wertet den ersten Versuch gleich aus. Die Körpererkennung läuft auf dem Gerät, das Video wird nirgends hochgeladen.
- **Exercises** (`#/exercises`): alle 624 Übungen durchsuchen.

Weitere Funktionen:

- **Clubs** (`#/clubs`): Karte der Schweiz mit allen 24 Clubs der Swiss Weightlifting Federation, Kontakt per E-Mail (Betreff «Probetraining» vorausgefüllt). Daten in `data/clubs.js`, Quelle: swiss-weightlifting.ch/contact (Stand Oktober 2026). Ort, Koordinaten und Website pro Club von Hand ergänzt. Sechs Regionen zoomen die Karte heran, damit die Punkte am Handy gut zu treffen sind, mit Ortsnamen neben den Punkten. «In meiner Nähe» sortiert nach Entfernung (Standort nur auf dem Gerät, nicht gespeichert); ist der nächste Club über 150 km entfernt, zeigt die App einen Hinweis statt zu zoomen. Die Liste zeigt keine Logos; die Logo-Dateien von fünf Clubs liegen für später in `icons/clubs/`. Die Umrisse der Schweiz und der Seen sind von Hand vereinfacht gezeichnet, die Karte lädt nichts aus dem Internet. Bei Änderungen der Clubliste `data/clubs.js` anpassen und in `sw.js` die VERSION erhöhen.
- **Sprachen:** EN, DE und FR, umschaltbar oben rechts. Ohne Wahl gilt die Sprache des Geräts, die Wahl bleibt auf dem Gerät gespeichert. Lift- und Übungsnamen bleiben überall Englisch. Grundtexte in `js/i18n.js` (Oberfläche) und `js/catalog.js` (Katalog), Übersetzungen in `js/lang/de.js` und `js/lang/fr.js`. Fehlt eine Übersetzung, erscheint der englische Text.

- **Coaching Cues:** Zu jeder Ursache ein kurzer Satz zum Mitdenken im nächsten Versuch (in `js/catalog.js`, Abschnitt `CUES`).
- **Versuche automatisch finden:** Die App geht das Video mit 5 Bildern pro Sekunde durch und listet jeden Versuch (Funktion `findLifts` in `js/analysis.js`). Die Bilder werden beim schnellen Abspielen gelesen statt Bild für Bild angesprungen (`readFrames`): Springen dekodiert jedes Mal ab dem letzten Schlüsselbild und ist bei Handyvideos sehr langsam. Die Abspielgeschwindigkeit passt sich der Erkennungszeit an (Suche bis 5-fach, Auswertung bis 2-fach).
- **Fokus im Plan:** Pro Ursache und Lift eine Hauptübung und eine Ergänzung (`FOCUS` in `js/catalog.js`), die übrigen Übungen zum Aufklappen. Offen sind die zwei wahrscheinlichsten Ursachen, weitere stehen eingeklappt darunter. Im Video-Befund pro Befund eine Ursache mit Hauptübung und Ergänzung.
- **Power oder Squat:** Die App erkennt den Empfang aus dem Video, im Ergebnis lässt er sich umschalten. Bei Power fallen die Hocke-Regeln weg; bei geplantem Squat ohne tiefen Empfang meldet sie «Nicht unter die Stange gegangen».
- **Übung automatisch erkennen** (`classify` in `js/analysis.js`): Startposition (Boden, Hang, Rack) und Ende (Stange über Kopf oder auf den Schultern) ergeben Snatch, Clean, Clean & Jerk oder Jerk. Hüfte im Empfang auf Kniehöhe oder tiefer = Squat, sonst Power. Beim Jerk: Füsse vorne/hinten auseinander = Split Jerk, Knie bei gestreckten Armen gebeugt = Push Jerk, sonst Push Press. Ein Clean & Jerk wird in zwei Teilen ausgewertet.
- **Nutzungszählung** (`js/stats.js`): zählt mit GoatCounter, welche Module aufgerufen werden, wie oft die Diagnose bis zum Plan kommt (pro Lift), wie oft ein Video ausgewertet wird (einmal pro Video), «In meiner Nähe» und Club kontaktiert. Keine Cookies, keine Inhalte. Die Zahlen stehen im GoatCounter-Dashboard, nicht auf der Website. Solange `GOATCOUNTER` leer ist, wird nichts gesendet; lokal auch nicht.
- **Teilen:** Video-Befund als Bild oder Text, Übungsplan als Text. Am Handy über das Teilen-Menü, am Computer als Download bzw. in die Zwischenablage (`js/share.js`).

Die App ist eine reine Sammlung statischer Dateien. Sie braucht keinen Server, keine Datenbank und keine API-Schlüssel und läuft nach dem ersten Öffnen offline.

## Veröffentlichen mit GitHub Pages

1. **GitHub Desktop** öffnen: *File → Add local repository…* und diesen Ordner wählen. Falls GitHub Desktop meldet, dass das kein Repository ist: *create a repository* wählen.
2. *Publish repository*. Das Repository muss **öffentlich** sein, damit GitHub Pages im kostenlosen Konto funktioniert.
3. Auf github.com im Repository: *Settings → Pages → Build and deployment → Source: Deploy from a branch*, Branch `main`, Ordner `/ (root)`, *Save*.
4. Nach ein bis zwei Minuten ist die App erreichbar unter `https://<benutzername>.github.io/<repository>/`.

## Änderungen veröffentlichen

1. In `sw.js` die Zahl bei `VERSION` erhöhen (z. B. `"v1"` → `"v2"`). Ohne diesen Schritt sehen installierte Apps die Änderung nicht.
2. In GitHub Desktop committen und *Push origin*.

## Lokal testen

Die App muss über einen Webserver laufen (nicht per Doppelklick auf `index.html`), weil die Körpererkennung als Modul geladen wird:

```bash
python -m http.server 8000
```

Dann `http://localhost:8000` im Browser öffnen.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html`, `app.css` | Seite und Gestaltung |
| `data/lib.js` | Liste aller Catalyst-Übungen (Name, Kategorie, Link) |
| `js/catalog.js` | Fehlerkatalog: Übungsnotizen, Ursachen, Fragen, Fehlerbilder |
| `js/app.js` | Seiten (Router), geführte Diagnose, Bibliothek |
| `js/analysis.js` | Körpererkennung und Messregeln der Video-Analyse |
| `js/video.js` | Oberfläche der Video-Analyse |
| `js/share.js` | Befund als Bild oder Text teilen |
| `data/clubs.js`, `js/clubs.js` | Clubs der Schweiz und Karte |
| `js/i18n.js` | Sprachwahl, Texte der Oberfläche (Englisch) |
| `js/lang/de.js`, `js/lang/fr.js` | Deutsche und französische Texte für Oberfläche, Katalog und Video-Befunde |
| `sw.js`, `manifest.webmanifest`, `icons/` | Installierbare App und Offline-Betrieb |
| `vendor/mediapipe/`, `models/` | MediaPipe Pose (Laufzeit und Modell) |
| `fonts/` | Schriften, lokal eingebunden |

### Gestaltung

Die Oberfläche ist hell und schlicht, in Anlehnung an Apple: weisse Karten auf hellem Grau, feine Linien statt kräftiger Schatten, Pillen-Tasten, Segment-Schalter und matte Glas-Leisten. Akzentfarbe ist das Rot der Hantelscheibe. Auf Apple-Geräten erscheint die Systemschrift SF Pro, sonst Inter. Alle Farben, Schatten, Radien, Schriften und Bewegungskurven stehen als Variablen am Anfang von `app.css`. Neue Bausteine sollen nur diese Variablen verwenden.

### Messregeln der Video-Analyse

Die Grenzwerte stehen in `js/analysis.js` und sind an den ersten Testvideos eingestellt (Aufnahme schräg von vorne, 30 fps). Sie sind Richtwerte. Den Kamerawinkel erkennt die App selbst (`detectView`): Schulterbreite im Bild geteilt durch die Körperlänge im Stand, unter 0.07 seitlich, ab 0.22 von vorne oder hinten, dazwischen schräg. Mit mehr Videos, guten wie misslungenen Versuchen, lassen sie sich verbessern.

| Befund | Messung |
| --- | --- |
| Zurücklehnen am Ende des Zuges | Winkel Schulter–Hüfte hinter der Senkrechten |
| Kopf in den Nacken | Kopfneigung gegenüber der Startposition |
| Langsamer Übergang | Zeit von der vollen Streckung bis Arme fest (Reissen) bzw. Stange im Rack (Umsetzen) |
| Hoch empfangen, dann gerutscht | Absinken der Hüfte nach dem Empfang |
| Arme beugen zu früh | Ellbogenwinkel vor der vollen Streckung |
| Hüfte steigt zuerst | Anstieg Hüfte gegenüber Schulter bis Kniehöhe |
| Sprung nach vorne / hinten | Fussposition nach dem Empfang gegenüber dem Start |
| Lange Stabilisierung, langsames Aufstehen | Zeit in der tiefsten Position und bis zum Stand |
| Stossen | Dip-Tiefe, Kippen im Dip, Füsse starten vor Ende des Drives, Arme bei der Landung, Split-Länge, Oberkörper im Split |

## Rechtliches und Quellen

- **Körpererkennung:** [MediaPipe](https://github.com/google-ai-edge/mediapipe) Pose Landmarker von Google, Apache License 2.0.
- **Schriften:** Inter und JetBrains Mono, SIL Open Font License.
- **Übungen:** Die App verlinkt auf die Übungsseiten und Videos von Catalyst Athletics, mit deren Erlaubnis (Oktober 2026). Die Kurznotizen zu den Übungen sind eigene Zusammenfassungen.
- **Datenschutz:** Videos und Antworten bleiben auf dem Gerät. Die App speichert nichts: Jede Diagnose beginnt neu, sobald man die Diagnose-Seite wieder öffnet. GitHub als Hoster sieht beim Abruf der Seite die IP-Adresse. Datenschutz, Impressum und Haftungshinweis stehen in der App unter `#/legal`.
- Die App ersetzt kein Coaching.
