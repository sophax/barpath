# Lift Fault Finder

Web-App (Oberfläche auf Englisch) für olympisches Gewichtheben: Fehler im Snatch, Clean und Jerk erkennen, die wahrscheinliche Ursache eingrenzen und passende Übungen aus der [Catalyst Athletics Exercise Library](https://www.catalystathletics.com/exercises/) finden.

- **Startseite** (`#/`): führt zu den drei Modulen.
- **Diagnosis** (`#/diagnosis/…`): geführt in vier Schritten (Lift → Faults → Questions → Plan). Der Plan erscheint erst, wenn alle Fragen beantwortet sind.
- **Video analysis** (`#/video`): Video wählen, Versuch markieren. Die Körpererkennung läuft auf dem Gerät, das Video wird nirgends hochgeladen.
- **Exercises** (`#/exercises`): alle 624 Übungen durchsuchen.

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
| `sw.js`, `manifest.webmanifest`, `icons/` | Installierbare App und Offline-Betrieb |
| `vendor/mediapipe/`, `models/` | MediaPipe Pose (Laufzeit und Modell) |
| `fonts/` | Schriften, lokal eingebunden |

### Gestaltung

Die Oberfläche folgt dem Stil „Industrial Skeuomorphism“: Licht von oben links, Gehäuse, verschraubte Panels, Tasten mit Druckpunkt, LEDs und dunkle Displays. Alle Farben, Schatten, Radien, Schriften und Bewegungskurven stehen als Variablen am Anfang von `app.css`. Neue Bausteine sollen nur diese Variablen verwenden.

### Messregeln der Video-Analyse

Die Grenzwerte stehen in `js/analysis.js` und sind an den ersten Testvideos eingestellt (Aufnahme schräg von vorne, 30 fps). Sie sind Richtwerte. Mit mehr Videos, guten wie misslungenen Versuchen, lassen sie sich verbessern.

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
- **Übungen:** Die App verlinkt auf die Übungsseiten und Videos von Catalyst Athletics. Die Kurznotizen zu den Übungen sind eigene Zusammenfassungen. Vor einer kommerziellen oder breiten Veröffentlichung die Nutzung mit Catalyst Athletics absprechen.
- **Datenschutz:** Videos und Antworten bleiben auf dem Gerät (Antworten im lokalen Speicher des Browsers). GitHub als Hoster sieht beim Abruf der Seite die IP-Adresse. Für eine öffentliche Nutzung gehört eine kurze Datenschutzerklärung dazu.
- Die App ersetzt kein Coaching.
