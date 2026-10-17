/* Fehlerkatalog: Übungsnotizen, Ursachen, Fragen, Fehlerbilder. */
const BYID = Object.fromEntries(LIB.map(r=>[r[0],r]));
const url = id => "https://www.catalystathletics.com/exercise/"+BYID[id][3];
const SEC = {SN:"Reissen",CL:"Umsetzen",JK:"Stossen",GEN:"Allgemein",TRK:"Rumpf",LOW:"Beine/Hüfte",JMP:"Sprünge",UP:"Oberkörper",PREP:"Prehab",CAR:"Tragen"};

/* Kurznotizen (eigene Zusammenfassung der Purpose-Texte). [snatchId, cleanId] teilen sich eine Notiz. */
const NOTE = {};
function note(ids, text){ (Array.isArray(ids)?ids:[ids]).forEach(i=>{ if(i) NOTE[i]=text; }); }
note([627,644],"Stange schwebt knapp über dem Boden. Stärkt Start und Balance, wenn du im 1. Zug nach vorne kippst.");
note([391,366],"Langsamer 1. Zug, danach voll explosiv. Du spürst und korrigierst Fehler und lernst das Timing in den 2. Zug.");
note([642,648],"Langsamer Zug ohne Umgruppieren. Balance, Position und Haltungskraft im 1. Zug.");
note([389,368],"Nur der 1. Zug bis über das Knie. Kraft, Balance und Haltung isoliert üben.");
note(700,"Lehrt die richtige Bewegung im 1. Zug, wenn du auf die Fersen gehst oder zu weit über die Stange kippst.");
note([187,176],"Grundkraft für den Zug mit den echten Positionen des Hebens, langsam genug, um Balance und Rücken zu kontrollieren.");
note([205,177],"Erhöht stehend. Betont die Kraft vom Boden und das Halten der Rückenposition unter schwerer Last.");
note([399,370],"Schwebend vom Podest, volle Startposition. Stärkt die Haltung im 1. Zug.");
note([208,180],"Zug vom Podest. Kraft und aufrechte Haltung beim Abheben.");
note([317,355],"Pause in der Hocke. Rumpf- und Haltungskraft, Komfort unten, korrigiert das Aufstehen mit der Hüfte zuerst.");
note(183,"Stärkt die isometrische Rückenstreckung, die du im Zug halten musst.");
note(424,"Schmaler Stand, viel Quadrizeps. Unterstützt einen aufrechten Zug vom Boden.");
note(78,"Beinkraft speziell fürs Umsetzen, stärkt den Rumpf und ein aufrechtes Abheben.");
note([186,185],"Zug bis Mitte Oberschenkel mit Halt. Du bleibst länger über der Stange und führst sie nah am Körper.");
note([640,645],"Schwebender Start plus Halt am Oberschenkel. Start, 1. Zug und Balance in einer Übung.");
note([315,322],"Zug mit Pausen an den Schwachstellen, etwa knapp über dem Knie. Position und Balance fühlen und korrigieren.");
note([392,362],"Ganzes Heben mit Pausen im Zug. Festigt Positionen und macht den Abschluss aggressiver.");
note([388,367],"Kein Kontakt zwischen Stange und Hüfte. Erzwingt vertikalen Beindruck und korrigiert frühen 2. Zug und Zurücklehnen.");
note([628,629],"Zug bis zur Hüfte. Du bringst die Stange aktiv zu dir zurück, statt dich von ihr nach vorne ziehen zu lassen.");
note(577,"Stärkt Lats und Schultern, um die Stange im Zug eng an den Beinen zu führen.");
note(906,"Isoliert die Lats, die die Stange im Zug zum Körper drücken.");
note(907,"Lat-Kraft ohne Bizeps, für mehr Stangennähe im Zug.");
note([401,371],"Aus kleinem Dip. Beindruck statt Hüftstoss, länger flache Füsse, Stange am Körper, sauberes Armtiming.");
note([434,433],"Aus der Power-Position mit Pause. Kontrollierter, harter Beindruck ohne Schwung, flache Füsse, Armtiming.");
note([316,321],"Für Heber, die die Stange von Hüfte oder Oberschenkel nach vorne schlagen. Lehrt die Armmechanik des 3. Zugs.");
note([466,665],"Armmechanik und Stangennähe aus der Power-Position, betont den vertikalen Beindruck.");
note([400,378],"Füsse bleiben stehen. Längerer Beindruck, Timing 2.→3. Zug, korrigiert Ungleichgewichte und hohes Füsseheben.");
note([453,450],"In die volle Streckung ziehen und halten. Vollständige Extension und vertikalen Beindruck spüren.");
note([99,100],"Zug mit Armen bis maximale Höhe. Aggressive, vollständige, vertikale Streckung und Timing Beine→Arme.");
note([92,93],"Trainiert die letzte, aggressive Streckung der Beine. Erlaubt sehr schwere Lasten.");
note([394,365],"Sehr hohe Hang-Position. Zwingt zu aggressivem Abschluss und schnellem Umgruppieren.");
note([545,688],"Stange muss eine Markierung erreichen. Erzwingt einen vollständigen, konstanten Zug.");
note([667,657],"Oberer Zug aus der Power-Position. Position und vertikaler Beindruck, auch zum Überladen.");
note(426,"Explosivität der Beine, überträgt sich auf Tempo und Kraft im Abschluss.");
note([456,455],"Zug mit flachen Füssen, wenn du die Fersen zu früh hebst oder nach vorne driftest.");
note([457,454],"Flachfüssig in die Streckung und halten. Balance über den ganzen Fuss.");
note([479,689],"Kein Sprung, kein Kontakt. Vertikaler Beindruck, korrigiert Zurücklehnen und frühen 2. Zug.");
note([96,149],"Lernt und stärkt die Armmechanik im 3. Zug. Aktives statt passives Umgruppieren.");
note([385,373],"Zug plus Bewegung nach unten. Trainiert Timing und Mechanik des Darunterziehens.");
note([681,699],"Zug in Etappen, dann sofort komplett. Überträgt das Gefühl der Positionen ins ganze Heben.");
note([217,150],"Aus dem Stand unter die Stange. Tempo, Aggressivität und Präzision im Umgruppieren.");
note([543,542],"Lehr- und Aufwärmdrill für das Umgruppieren.");
note([61,67],"Weniger Zeit und Weg nach unten. Tempo und Aggressivität, lehrt die Stange zu treffen statt die Verbindung zu verlieren.");
note(312,"Tempo und Aggressivität im letzten Teil, präzise Fuss- und Stangenposition, Vertrauen in der Hocke.");
note([62,69],"Kürzerer Weg. Vollständiger Zug, aggressiveres Umgruppieren, Vertrauen.");
note([439,442],"Hoch empfangen mit richtigem Stand und Spannung, dann in die Hocke. Lehrt, die Stange zu treffen.");
note([419,647],"Pausen im Zug plus Power-Empfang. Kontrolle des Umgruppierens.");
note(80,"Kraft, Timing und Vertrauen im Empfang, schnelle Füsse. Mit schweren Lasten Mut fürs tiefe Darunterziehen.");
note(82,"Füsse bleiben stehen. Festigt Empfangsposition und Spannung gegen die Stange, weniger einschüchternd.");
note(79,"Grundübung der Reiss-Empfangsposition. Kraft, Mobilität und Stabilität über Kopf.");
note(674,"Hängende Gewichte erhöhen die Stabilisationsarbeit. Für eine wacklige Überkopfposition.");
note(95,"Drücken in der tiefen Hocke. Mobilität von Sprunggelenk, Hüfte, Brustwirbelsäule und Schultern, dazu Überkopfkraft.");
note(537,"Sots Press mit hängenden Gewichten. Mehr Stabilisationsarbeit im Oberkörper.");
note(89,"Mehr Gewicht über Kopf mit Beinhilfe. Stärkt Arme, Schultern, oberen Rücken und Handgelenke.");
note(386,"Kraft und Stabilität im oberen Rücken. Gutes Aufwärmen für eine genaue Überkopfposition.");
note(890,"Überkopf tragen. Stabilität für das Reissen, gewöhnt Hände und Handgelenke an die Last.");
note(892,"Überkopf tragen mit hängenden Gewichten. Noch mehr Stabilisationsarbeit.");
note(204,"Lehrt die korrekte Überkopfposition, Schulterblatt- und obere Rückenkraft.");
note(181,"Schwere Last im Rack halten. Rumpf, Rack-Position und Vertrauen.");
note([168,605],"Stärkt den tiefsten Punkt der Hocke für ein sauberes Aufstehen.");
note(81,"Langsam unter die Stange drücken. Position und Balance spüren, aktive Dehnung.");
note(420,"Mobilität von Sprunggelenk, Hüfte, Schulter und BWS, dazu Kraft im oberen Rücken.");
note(588,"Kurzhantel-Drücken in der Hocke. Mobilität und Seitenvergleich, deckt Asymmetrien auf.");
note(584,"Hüftmobilität unter Last, mit Stabilität in den neuen Bewegungsbereichen.");
note(209,"Drücken in der Frontkniebeuge. Mobilität für die Umsetz-Hocke, Rumpfstabilität.");
note(761,"Schulterblattkontrolle, hilft der Mobilität in der Rack-Position.");
note([631,695],"Power-Variante ohne Sprung. Langer Beindruck und schnellerer Richtungswechsel.");
note([435,438],"Stopp auf Parallel, dem mechanisch schwächsten Punkt. Kraft für den Sticking Point.");
note([444,445],"Start von Pins ohne Vorspannung. Explosivkraft und Kraft in bestimmten Bereichen.");
note([618,619],"Pausen im schwächsten Bereich. Haltung, Balance und Kraft durch den Sticking Point.");
note(77,"Grundkraft für Beine und Rumpf.");
note(381,"Schnelleres, aufrechteres Aufstehen. Danach der Jerk mit ermüdeten Beinen.");
note(448,"Hält die Beziehung Becken–Wirbelsäule stabil, gegen ein Hohlkreuz.");
note(494,"Becken und Wirbelsäule gegen Bewegung stabilisieren.");
note([207,379],"Vom Block aus totem Start. Schnellkraft, weil der Beschleunigungsweg kurz ist.");
note([203,380],"Block plus Power-Empfang. Schnellkraft bei geringerer Belastung.");
note([63,68],"Aus dem Hang. Schnellkraft, vollständiger Zug, aggressives Umgruppieren, Positionsgefühl.");
note([65,70],"Drei Positionen von unten nach oben. Schnellkraft und vollständige Streckung.");
note(353,"Kniebeuge-Sprung. Explosivität über die volle Hocke, hilft beim Aufstehen.");
note(552,"Sitzender Sprung ohne Ausholen. Reine Schnellkraft ohne Elastizität.");
note(548,"Grundübung für explosive Bein- und Hüftstreckung.");
note([97,98],"Mehr Gewicht als im Heben. Kraft, Tempo, Haltung und Balance der Streckung.");
note([396,361],"Zug aus dem Hang. Kraft in einem bestimmten Bereich, gezielt für Schwachstellen.");
note(101,"Glutes, Hamstrings, isometrische Rückenstreckung und Lats für Stangennähe.");
note(171,"Oberer Rücken und Haltungskraft, hilft die Stange im Zug nah zu halten.");
note([402,359],"Vom Block. Gezielt den Problembereich rund um die Knie üben.");
note([443,686],"Nur wenn sonst nichts hilft: Notfall-Drill, wenn das Unterschieben der Knie nicht von selbst klappt.");
note(544,"Lehrdrill für das Zustellen der Stange in den Rack.");
note(662,"Muscle Clean aus dem Dip. Präzises Zustellen in den Rack, Beindruck und Stangennähe.");
note(580,"Jede Abweichung wird bestraft. Genaues Umgruppieren und voller Griff, aggressiver Drive.");
note(194,"Dip und Drive mit schwerer Last. Kraft, Balance und Position im ganzen Dip.");
note(410,"Pause unten im Dip. Kraftvoller, vollständiger Drive und richtige Dip-Tiefe.");
note(626,"Pause am tiefsten Punkt des Dips. Stärkt die untere Position.");
note(472,"Jerk Drive mit Bändern. Verhindert das Wegdrücken nach vorne, fördert langen Beindruck.");
note(639,"Push Press mit Pause im Dip. Dip-Position, Balance, Drive und Timing.");
note(541,"Langsamer Jerk. Positionen und Balance bewusst spüren.");
note(414,"Stärkt die Dip-Tiefe und das Abfangen der Last für den Richtungswechsel.");
note(196,"Schwere Last im Jerk-Rack halten. Rack-Position, Rumpf, Vertrauen.");
note(87,"Gleicher Dip und Drive wie im Jerk. Härterer, längerer Beindruck und Timing Beine→Arme.");
note(413,"Dip und Drive mit schwerer Last. Timing, Elastizität und ein vollständiger Drive.");
note(625,"Wie der Jerk Drive, aber ohne dessen typische schlechte Gewohnheiten.");
note(462,"Aus dem Stand ohne Dip-Schwung. Maximale Kraftentwicklung und vollständiger Drive vor dem Darunterziehen.");
note(405,"Füsse bleiben am Boden. Höherer, vertikaler Drive und Balance im Dip.");
note(72,"Höherer und präziser Drive, schneller Übergang nach unten.");
note(651,"Frontkniebeuge, dann Jerk. Vollständiger Beindruck mit ermüdeten Beinen.");
note(213,"Hinter dem Nacken: Stange geht direkt vertikal. Lehrt die ideale Überkopf- und Split-Position.");
note(202,"Hinter dem Nacken, Power-Empfang. Vertikale Bahn und vollständiger Drive.");
note(652,"Hinter dem Nacken, Füsse bleiben. Vertikale Bahn und Balance-Kontrolle.");
note(655,"Aus dem Stand, hinter dem Nacken. Timing, Aggressivität und korrekte Überkopfposition.");
note(88,"Push Press hinter dem Nacken. Vertikale Bahn und Schulterblattposition über Kopf.");
note(406,"Im Split stehend drücken. Lehrt die leichte Rückwärtsbewegung der Stange, ohne mit der Brust nach vorne zu fallen.");
note(407,"Drücken, dann in den Split. Geduld im Drive und schnelle, präzise Füsse.");
note(193,"Für Heber, die mit Kopf und Brust eintauchen, hinten zu weit oder vorne zu kurz steppen.");
note(459,"Aus dem Split. Stärkt Split und Überkopfposition, gegen das Eintauchen der Brust.");
note(458,"Aus dem Split, hinter dem Nacken. Fussposition und Überkopfposition kontrollieren.");
note(408,"Drücken im Split. Position und Balance im Split, Primer vor Jerks.");
note(441,"In den Split steppen. Abbremsen und Halten, kein Gewicht nach vorne verlagern.");
note(428,"In den Split gehen. Halten, Balance und Ausgleich zwischen den Beinen.");
note(411,"In den Split springen. Schnelle, genaue Füsse und aufrechter Rumpf.");
note(417,"In den Split fallen. Schnelle, genaue Füsse und aufrechter Rumpf.");
note(218,"Aus dem Stand. Aggressivität, Timing und Genauigkeit im Jerk.");
note(653,"Power-Variante aus dem Stand. Aggressivität, Timing und Genauigkeit.");
note(198,"Mehr Gewicht als dein Jerk über Kopf halten. Stabilität und Vertrauen.");
note(469,"Schwere Last im tiefen Split halten. Überkopf- und Split-Stabilität.");
note(197,"Schwer über Kopf halten und aus dem Split zurückkommen. Fussarbeit und Balance.");
note(409,"Drücken hinter dem Nacken im Split. Überkopfposition plus Komfort im Split.");
note(853,"Überkopf tragen mit Jerk-Griff. Stabilität, Hände und Handgelenke.");
note(854,"Überkopf tragen mit hängenden Gewichten. Mehr Stabilisationsarbeit.");
note(412,"Rhythmisches Dippen. Schneller abbremsen und die Elastizität nutzen.");
note(649,"Rhythmus-Dip direkt in den Jerk. Überträgt das Timing ohne Nachdenken.");
note(404,"Rebound aus dem Dip. Schnelles Abbremsen und Elastizität.");
note(550,"Landen und abfangen. Kraft sicher und in Position aufnehmen.");
note(764,"Schulterblatt-Protraktion und Beweglichkeit der Schulter.");
note(174,"Kraft für den Split, gleicht Seitenunterschiede aus.");
note(737,"Split Squat mit Band. Stabilität im Split.");
note(173,"Einbeinig. Gleicht Schwächen aus, Hüftstabilität, Hüftbeuger-Mobilität.");
note(427,"Split Squat über Kopf. Beine, Rumpf und Überkopfposition zusammen.");
note(714,"Anti-Rotation im Split. Rumpf- und Beinstabilität.");
note(354,"Einbeinige Grundübung. Balance zwischen den Seiten und Split-Kraft.");
note(429,"Schwer über Kopf aus tiefem Power-Empfang aufstehen. Für Heber, die bei tiefem Empfang aufgeben.");
note(485,"In den Split steppen mit Last über Kopf. Stabilität von Beinen und Überkopf.");
note(372,"Clean, dann direkt Jerk. Aggressives Aufstehen, genaues Umgruppieren, Drive mit müden Beinen.");

/* Ursachen. ex: Liste von IDs oder [Reissen, Umsetzen]; 0 = gibt es für diese Disziplin nicht. */
const CAUSES = {
 pull_balance:{t:"Balance im 1. Zug",why:"Beim Abheben wandert das Gewicht auf die Zehen oder auf die Fersen. Alles danach baut auf einer falschen Ausgangslage auf.",test:"Ziehe leicht bis knapp unter das Knie und halte 2 s. Spürst du den Druck über dem ganzen Fuss (Mitte), stimmt es.",ex:[[627,644],[391,366],[642,648],[389,368],700,[187,176]]},
 pull_posture:{t:"Rückenposition und Kraft vom Boden",why:"Die Hüfte schiesst hoch oder der Rücken gibt nach, weil Beine oder Rückenstrecker die Position unter Last nicht halten.",test:"Vergleiche Front Squat und dein Umsetzen. Liegt der Front Squat unter etwa 115 % deines Umsetzens, fehlt meist Beinkraft.",ex:[[205,177],[399,370],[208,180],[317,355],183,424,78]},
 stay_over:{t:"Zu früh aufgerichtet",why:"Die Schultern kommen vor der Mitte des Oberschenkels hinter die Stange. Der 2. Zug startet zu früh und die Kraft geht nach vorne statt nach oben.",test:"Video von der Seite: Sind deine Schultern beim Passieren des Knies noch vor der Stange?",ex:[[186,185],[640,645],[315,322],[392,362],[388,367]]},
 bar_away:{t:"Stange entfernt sich vom Körper",why:"Die Lats drücken die Stange nicht zurück an die Beine. Sie wandert nach vorne und zieht dich mit.",test:"Ziehe mit gestreckten Armen und denke ‚Stange in die Oberschenkel drücken‘. Spürst du dabei deine Lats arbeiten?",ex:[[628,629],[186,185],577,906,907,[401,371]]},
 hip_bang:{t:"Hüftstoss statt Beindruck",why:"Die Hüfte schlägt die Stange nach vorne weg. Die Bahn wird zur Schleife und du musst ihr nachspringen.",test:"Hörst oder spürst du einen harten Schlag an der Hüfte, nach dem die Stange vor dir wegfliegt?",ex:[[316,321],[434,433],[401,371],[466,665],[388,367]]},
 legs_quit:{t:"Beine hören zu früh auf zu drücken",why:"Die Streckung ist unvollständig. Die Stange bekommt zu wenig Höhe, und du musst sie mit den Armen retten.",test:"Mache einen Zug mit 100 % und halte oben. Stehst du auf den Fussballen mit gestreckten Knien und Hüfte?",ex:[[400,378],[453,450],[99,100],[92,93],[394,365],[545,688],[667,657],426]},
 heels_early:{t:"Fersen zu früh oben, Gewicht vorne",why:"Du gehst zu früh auf den Vorfuss, das Gewicht driftet nach vorne und die Stange folgt.",test:"Mache einen Zug barfuss oder mit Kreide unter der Ferse. Hebt die Ferse schon vor der Mitte des Oberschenkels ab?",ex:[[456,455],[457,454],[434,433],[401,371]]},
 lean_back:{t:"Zu starkes Zurücklehnen am Ende",why:"Du lehnst dich mit dem Oberkörper weit hinter die Stange. Das schiebt die Stange weg und dich nach hinten.",test:"Video: Ist dein Oberkörper am Ende deutlich hinter der Senkrechten, bevor du dich unter die Stange ziehst?",ex:[[388,367],[479,689],[453,450],[400,378]]},
 early_arms:{t:"Arme beugen zu früh",why:"Wer früh mit den Armen zieht, nimmt den Beinen Kraft und bringt die Stange vom Körper weg.",test:"Video: Sind deine Ellbogen schon gebeugt, bevor Knie und Hüfte gestreckt sind?",ex:[[434,433],[401,371],[316,321],[96,149],[99,100]]},
 transition_timing:{t:"Timing vom 2. in den 3. Zug",why:"Du gehst zu früh oder zu spät nach unten. Richtig ist: weiter gegen den Boden drücken, während du dich unter die Stange ziehst.",test:"Kannst du ein Heben ohne Sprung (Füsse bleiben stehen) sauber machen? Wenn nicht, stimmt das Timing nicht.",ex:[[400,378],[388,367],[391,366],[385,373],[681,699]]},
 slow_turnover:{t:"Passives, langsames Umgruppieren",why:"Nach der Streckung wartest du, statt dich aktiv unter die Stange zu ziehen.",test:"Wie schnell ist dein Tall Snatch oder Tall Clean mit leichtem Gewicht? Fühlt er sich zäh an, fehlt Aggressivität.",ex:[[217,150],[543,542],[96,149],[61,67],[394,365],[312,0],[385,373],[62,69]]},
 meet_bar:{t:"Verbindung zur Stange verloren",why:"Du lässt die Stange los, statt sie mit Spannung zu treffen. Sie fällt auf dich oder die Ellbogen werden weich.",test:"Spürst du die ganze Zeit Zug an der Stange, oder gibt es einen Moment, in dem sie ‚frei hängt‘?",ex:[[61,67],[439,442],[62,69],[419,647],[80,0]]},
 clean_rack:{t:"Zustellen in den Rack",why:"Die Ellbogen drehen zu spät durch. Die Stange crasht auf die Schultern statt geführt dort anzukommen.",test:"Mache einen Muscle Clean mit leichtem Gewicht. Landet die Stange weich und kontrolliert auf den Schultern?",ex:[[0,149],[0,542],[0,544],[0,662],[0,665],[0,580]]},
 overhead_stab:{t:"Instabile Überkopfposition",why:"Schultern, oberer Rücken oder Handgelenke stabilisieren die Stange nicht. Sie wandert oder die Arme geben nach.",test:"Halte 5 Overhead Squats mit 70 % deines Reissens. Bleibt die Stange ruhig über der Fussmitte?",ex:[[79,0],[674,0],[95,0],[89,0],[386,0],[890,0],[892,0],[204,0]]},
 receive_conf:{t:"Vertrauen im tiefen Empfang",why:"Du ziehst dich nicht ganz nach unten, weil du der Hocke unter schwerer Last nicht traust.",test:"Fühlt sich ein Snatch Balance oder ein schwerer Clean in die volle Hocke unangenehm oder ängstlich an?",ex:[[80,442],[82,181],[312,605],[439,355],[79,0]]},
 mobility:{t:"Mobilität in der Hocke",why:"Sprunggelenk, Hüfte, Brustwirbelsäule oder Schultern lassen die aufrechte Hockposition nicht zu.",test:"Kommst du mit leerer Stange in eine tiefe, aufrechte Hocke (über Kopf bzw. im Rack) ohne Ausgleichsbewegung?",ex:[[95,209],[81,420],[420,355],[588,761],[584,584]]},
 footwork:{t:"Fussarbeit und Stand im Empfang",why:"Die Füsse landen zu breit, ungleich oder an anderer Stelle als nötig. Das kostet Stabilität im Empfang.",test:"Markiere mit Kreide Start- und Landeposition. Landen deine Füsse jedes Mal gleich?",ex:[[400,378],[439,442],[631,695],[312,0],[80,0],[479,689]]},
 squat_strength:{t:"Kraft aus der Hocke",why:"Du empfängst die Stange, aber kommst nicht hoch. Es fehlt Beinkraft am Umkehrpunkt.",test:"Schaffst du mit deinem Bestwert eine Pause-Kniebeuge (2 s unten)?",ex:[[317,355],[435,438],[444,445],[168,605],[618,619],[77,78]]},
 trunk_receive:{t:"Rumpfspannung im Empfang",why:"Der Rumpf gibt unter der Last nach. Die Brust fällt nach vorne und die Stange folgt.",test:"Fällt in deiner Front- oder Überkopfkniebeuge die Brust beim Aufstehen nach vorne?",ex:[[317,355],[0,181],[0,381],448,494,78]},
 rfd:{t:"Schnellkraft",why:"Die Kraft ist da, aber du bringst sie nicht schnell genug auf die Stange.",test:"Vergleiche Zug-Bestwert und Heben. Ziehst du deutlich über 120 % deines Hebens, fehlt eher Schnellkraft als Kraft.",ex:[[207,379],[203,380],[63,68],[65,70],353,552,548]},
 pull_strength:{t:"Zugkraft",why:"Die Kraft für den Zug reicht für schwere Versuche nicht aus.",test:"Schaffst du einen Zug mit 110 % deines Bestwerts mit sauberer Position?",ex:[[97,98],[187,176],[396,361],[208,180],101,171]},
 scoop:{t:"Knie-Unterschieben im 2. Zug",why:"Die Knie kommen nach dem Passieren der Stange nicht sauber wieder unter die Stange. Die Bewegung wird zum Ruck.",test:"Video: Bewegen sich deine Knie, nachdem die Stange sie passiert hat, wieder nach vorne unter die Stange?",ex:[[402,359],[315,322],[186,185],[681,699],[443,686]]},
 /* Stossen */
 dip_balance:{t:"Balance im Dip",why:"Im Dip wandert das Gewicht auf die Zehen oder der Oberkörper kippt. Der Drive geht dann nach vorne.",test:"Halte die tiefste Dip-Position 3 s. Bleibt der Druck über Fussmitte und Ferse, mit senkrechtem Oberkörper?",ex:[194,410,626,472,639,541,414]},
 dip_posture:{t:"Rumpf im Dip",why:"Die Brust sinkt im Dip ein. Die Stange verliert die feste Unterlage und Kraft geht verloren.",test:"Bleibt die Stange im Dip fest auf den Schultern, oder fühlst du, wie der Rumpf ‚weich‘ wird?",ex:[196,414,78,448]},
 drive_short:{t:"Drive zu kurz",why:"Die Beine hören auf zu drücken, bevor sie ganz gestreckt sind. Die Stange bekommt zu wenig Höhe.",test:"Mache einen Push Press. Stehst du am Ende auf den Fussballen mit vollständig gestreckten Beinen?",ex:[87,413,625,462,472,405,651]},
 bar_path_forward:{t:"Stangenbahn nach vorne",why:"Die Stange wird um das Kinn herum nach vorne gedrückt, statt gerade nach oben. Du musst ihr folgen.",test:"Gelingt dir der Jerk hinter dem Nacken deutlich besser? Dann liegt das Problem bei Bahn und Kopfbewegung.",ex:[213,202,652,655,88,405,406]},
 patience:{t:"Ungeduld im Drive",why:"Du startest die Füsse, bevor der Drive fertig ist. Die Stange hat zu wenig Höhe, wenn du darunter ankommst.",test:"Video: Verlassen deine Füsse den Boden, bevor die Beine gestreckt sind?",ex:[407,410,462,87]},
 split_position:{t:"Split-Position",why:"Der Split ist zu kurz, zu lang oder die Füsse stehen in einer Linie. Die Basis ist nicht stabil.",test:"Markiere deine ideale Split-Position mit Kreide und vergleiche mit der Landung nach einem schweren Jerk.",ex:[193,459,458,408,441,428]},
 chest_dive:{t:"Brust taucht ein, Hüfte bleibt hinten",why:"Kopf und Brust gehen nach vorne, die Hüfte bleibt hinter der Stange. Das Gewicht landet auf dem vorderen Bein.",test:"Video: Ist die Hüfte im Split unter der Stange, oder dahinter?",ex:[193,411,417,459,406]},
 foot_speed:{t:"Füsse zu langsam",why:"Du kommst zu spät unter die Stange und musst sie mit den Armen ausdrücken.",test:"Wie schnell ist dein Tall Jerk mit leichtem Gewicht? Hörst du beide Füsse gleichzeitig landen?",ex:[218,653,411,417,407]},
 overhead_jerk:{t:"Überkopf-Stabilität im Jerk",why:"Schultern und oberer Rücken fixieren die Stange nicht. Die Arme geben nach oder die Stange wandert.",test:"Kannst du 110 % deines Jerks 5 s im Jerk Support ruhig über Kopf halten?",ex:[198,469,197,204,409,853,854]},
 dip_elastic:{t:"Abbremsen im Dip",why:"Der Umkehrpunkt ist weich und langsam. Die elastische Energie aus Stange und Beinen geht verloren.",test:"Fühlt sich der tiefste Punkt deines Dips wie ein ‚Absacken‘ an statt wie ein schneller Rückprall?",ex:[412,649,404,414,550]},
 rack_jerk:{t:"Jerk-Rack-Position",why:"Die Stange liegt nicht stabil auf den Schultern. Sie rutscht oder drückt auf die Handgelenke.",test:"Liegt die Stange auf den Schultern, wenn du die Hände kurz öffnest?",ex:[196,761,764,78]},
 split_strength:{t:"Kraft und Symmetrie im Split",why:"Ein Bein ist schwächer oder instabil. Der Split wackelt oder knickt ein.",test:"Mache Split Squats mit gleicher Last auf beiden Seiten. Merkst du einen deutlichen Unterschied?",ex:[174,737,428,173,427,714,354]},
 recovery:{t:"Zurückkommen aus dem Split",why:"Die Fussarbeit beim Aufstehen aus dem Split ist unsicher. Die Stange verliert ihre Position.",test:"Kommst du vorne Fuss zuerst, dann hinten, zurück, ohne dass die Stange wandert?",ex:[197,429,485]},
 cj_fatigue:{t:"Ermüdung nach dem Clean",why:"Der Clean kostet so viel Kraft, dass für den Jerk Beine oder Rumpf fehlen.",test:"Ist dein Jerk aus dem Ständer deutlich besser als nach einem Clean?",ex:[381,372,651]}
};

/* Fragen. o: [Label, {Ursache:Gewicht}] */
const YN = (yes, no={}) => [["Ja",yes],["Nein",no],["Weiss nicht",{}]];
const Q = {
 q_footpress:{t:"Wo spürst du den Druck im Fuss, wenn die Stange am Knie vorbei ist?",o:[["Vorfuss / Zehen",{heels_early:2,pull_balance:2}],["Ganzer Fuss",{}],["Ferse",{pull_balance:2}],["Weiss nicht",{}]],how:"Ziehe leicht bis über das Knie und halte dort. Achte nur auf den Fuss."},
 q_baraway:{t:"Entfernt sich die Stange vom Körper (Video von der Seite: Stange vor den Zehen)?",o:YN({bar_away:2,hip_bang:1}),how:"Filme von der Seite auf Hüfthöhe. Ziehe eine gedachte Linie durch die Fussmitte."},
 q_hipsfirst:{t:"Steigt beim Abheben die Hüfte schneller als die Schultern?",o:YN({pull_posture:2,pull_balance:1}),how:"Video von der Seite: Ändert sich der Rückenwinkel bis zum Knie stark?"},
 q_hipbang:{t:"Schlägt deine Hüfte die Stange nach vorne weg?",o:YN({hip_bang:3}),how:"Hörst du einen lauten Schlag, nach dem die Stange vor dir wegfliegt?"},
 q_leanback:{t:"Lehnst du dich am Ende des Zuges deutlich nach hinten?",o:YN({lean_back:3,transition_timing:1}),how:"Video: Wie weit ist dein Oberkörper hinter der Senkrechten, bevor du nach unten gehst?"},
 q_heels1:{t:"Spürst du schon beim Abheben vor allem Druck auf den Fersen?",o:YN({pull_balance:2}),how:"Mache 3 Lift-offs bis zum Knie und achte auf den Fuss."},
 q_hipthrough:{t:"Schiebst du die Hüfte durch die Stange, statt mit den Beinen nach oben zu drücken?",o:YN({hip_bang:2,legs_quit:1}),how:"Kannst du einen Dip Snatch oder Dip Clean ohne Hüftschlag ausführen?"},
 q_earlyarms:{t:"Beugst du die Arme, bevor Knie und Hüfte gestreckt sind?",o:YN({early_arms:3}),how:"Video: Schau auf die Ellbogen im Moment der vollen Streckung."},
 q_jumpdist:{t:"Wie weit springst du nach hinten?",o:[["Ein paar Zentimeter",{}],["Etwa eine Fusslänge oder mehr",{lean_back:1,footwork:2}],["Weiss nicht",{}]],how:"Lege einen Kreidestrich an die Fersen der Startposition und miss nach dem Heben. Ein leichter Rückwärtssprung ist bei vielen guten Hebern normal und kein Fehler."},
 q_barwhere:{t:"Wo entfernt sich die Stange zuerst?",o:[["Schon beim Abheben",{pull_balance:2,bar_away:1}],["Am Knie / Oberschenkel",{scoop:2,stay_over:1,bar_away:1}],["An der Hüfte",{hip_bang:3}],["Weiss nicht",{}]],how:"Video von der Seite in Zeitlupe. Viele Handys können 240 fps."},
 q_lats:{t:"Drückst du die Stange mit gestreckten Armen aktiv in die Beine?",o:[["Ja",{}],["Nein",{bar_away:2}],["Weiss nicht",{}]],how:"Stell dir vor, du drückst die Stange nach hinten in deine Schienbeine. Spürst du die Lats?"},
 q_overknee:{t:"Sind deine Schultern am Knie noch vor der Stange?",o:[["Ja",{}],["Nein",{stay_over:3}],["Weiss nicht",{}]],how:"Video: Halte das Bild an, wenn die Stange auf Kniehöhe ist."},
 q_backweak:{t:"Fühlt sich dein Rücken in der Position Mitte Oberschenkel schwach an?",o:YN({stay_over:1,pull_strength:1}),how:"Mache einen Halting Deadlift mit 100 % und halte 3 s."},
 q_kneesfwd:{t:"Kommen die Knie nach dem Passieren der Stange wieder unter die Stange?",o:[["Ja",{}],["Nein / ruckartig",{scoop:2}],["Weiss nicht",{}]],how:"Video: Achte auf die Knie zwischen Kniehöhe und Mitte Oberschenkel."},
 q_legsquit:{t:"Hören die Beine auf zu drücken, bevor du nach unten gehst?",o:YN({legs_quit:3}),how:"Bist du am höchsten Punkt auf den Fussballen mit gestreckten Knien?"},
 q_rush:{t:"Hast du den Drang, möglichst schnell nach unten zu kommen?",o:YN({transition_timing:1,legs_quit:1}),how:"Fühlt sich das Heben ohne Sprung (Füsse bleiben stehen) sehr ungewohnt an?"},
 q_pullratio:{t:"Ist ein Zug mit 110 % deines Bestwerts schwer?",o:YN({pull_strength:2}),how:"Teste einen Zug mit 110 % in sauberer Position."},
 q_jumps:{t:"Fühlen sich Sprünge oder Block-Varianten langsam an?",o:YN({rfd:2}),how:"Vergleiche: Box Jump, Block Snatch oder Clean im Verhältnis zum Heben vom Boden."},
 q_armspull:{t:"Ziehst du bewusst mit den Armen, um die Stange hochzubringen?",o:YN({early_arms:1,legs_quit:1}),how:"Wie fühlt sich ein Heben aus der Power-Position mit lockeren Armen an?"},
 q_tightarms:{t:"Sind deine Arme schon beim Start verkrampft?",o:YN({early_arms:1}),how:"Die Arme sollen lang und locker sein, die Ellbogen nach aussen gedreht."},
 q_wait:{t:"Wartest du nach der Streckung, bis die Stange oben ist?",o:YN({slow_turnover:2,transition_timing:1}),how:"Fühlst du eine kurze Pause zwischen Streckung und Darunterziehen?"},
 q_connection:{t:"Gibt es einen Moment, in dem die Stange ‚frei hängt‘?",o:YN({meet_bar:3}),how:"Achte auf den Zug in den Händen beim Umgruppieren."},
 q_fear:{t:"Bist du unsicher, ganz tief unter die Stange zu gehen?",o:YN({receive_conf:3}),how:"Wie fühlt sich ein Snatch Balance mit deinem Bestwert an?"},
 q_musclebad:{t:"Ist dein Muscle Snatch oder Muscle Clean technisch unsauber?",o:YN({slow_turnover:2}),how:"Mache 3 Wiederholungen mit leichtem Gewicht vor dem Spiegel."},
 q_armslate:{t:"Drücken deine Arme die Stange erst nach der Landung durch?",o:YN({meet_bar:2,slow_turnover:2}),how:"Video: Sind die Arme im Moment der Fusslandung schon gestreckt?"},
 q_ohswobble:{t:"Wackelt die Stange auch bei Overhead Squats mit leichtem Gewicht?",o:YN({overhead_stab:3}),how:"5 Overhead Squats mit 60 bis 70 % deines Reissens."},
 q_mob:{t:"Ist die tiefe Hocke über Kopf bzw. im Rack unbequem?",o:YN({mobility:2}),how:"Mit leerer Stange: Kommst du tief, aufrecht und ohne Ausweichbewegung runter?"},
 q_wrists:{t:"Geben deine Handgelenke über Kopf nach oder schmerzen sie?",o:YN({overhead_stab:1}),how:"Bei echten Schmerzen: abklären lassen."},
 q_stance:{t:"Ist dein Stand im Power-Empfang anders als in der tiefen Hocke?",o:YN({footwork:2}),how:"Kreide unter die Füsse und vergleiche Power und volle Hocke."},
 q_feethigh:{t:"Hebst du die Füsse hoch vom Boden, bevor du sie umsetzt?",o:YN({footwork:2,transition_timing:1}),how:"Die Füsse sollen flach und kurz umgesetzt werden, kein Hochspringen."},
 q_chestfall:{t:"Fällt der Oberkörper beim Aufstehen nach vorne?",o:YN({trunk_receive:2,squat_strength:1}),how:"Video von der Seite beim Aufstehen aus der Hocke."},
 q_squatweak:{t:"Ist deine Kniebeuge im Verhältnis zum Heben schwach?",o:YN({squat_strength:3}),how:"Richtwert: Front Squat mindestens 115 bis 120 % deines Umsetzens."},
 q_ohrecover:{t:"Wird die Stange beim Aufstehen instabil?",o:YN({overhead_stab:2}),how:"Bleibt die Stange beim Aufstehen über der Fussmitte?"},
 q_catchhigh:{t:"Fängst du die Stange hoch und rutschst dann erst in die Hocke?",o:YN({receive_conf:2,slow_turnover:1}),how:"Video: In welcher Höhe treffen sich Stange und Körper?"},
 q_elbowslate:{t:"Drehen die Ellbogen spät durch?",o:YN({clean_rack:3,slow_turnover:1}),how:"Video von vorne oder der Seite in Zeitlupe."},
 q_dropbar:{t:"Lässt du die Stange auf die Schultern fallen, statt sie zu führen?",o:YN({meet_bar:2,clean_rack:1}),how:"Wie hart ist der Aufprall auf den Schultern?"},
 q_rackmob:{t:"Ist die Rack-Position unbequem (Handgelenke, Lats, Trizeps)?",o:YN({mobility:2}),how:"Mit leerer Stange: Liegen die Ellbogen hoch, die Finger locker unter der Stange?"},
 q_elbowsdrop:{t:"Fallen die Ellbogen im Rack ab?",o:YN({trunk_receive:1,clean_rack:1}),how:"Video von der Seite in der Front Squat."},
 q_fschest:{t:"Fällt in der Front Squat die Brust nach vorne?",o:YN({trunk_receive:2,squat_strength:1}),how:"Front Squat mit 85 % und Video."},
 q_fastfloor:{t:"Reisst du die Stange schnell vom Boden?",o:YN({pull_balance:1}),how:"Der 1. Zug soll kontrolliert sein, beschleunigt wird danach."},
 q_roundback:{t:"Rundet sich dein Rücken beim Abheben?",o:YN({pull_posture:3}),how:"Video von der Seite. Achte auf den unteren Rücken."},
 q_fsratio:{t:"Ist deine Front Squat relativ schwach?",o:YN({pull_posture:2,squat_strength:1}),how:"Richtwert: Front Squat mindestens 115 % deines Umsetzens."},
 q_startunstable:{t:"Fühlt sich deine Startposition instabil an?",o:YN({pull_balance:2}),how:"Halte die Startposition 3 s mit der Stange knapp über dem Boden."},
 q_ohdrift:{t:"Wird die Stange über Kopf zu weit nach hinten gedrückt?",o:YN({overhead_stab:2}),how:"Video: Wo steht die Stange im Verhältnis zur Fussmitte?"},
 q_headfwd:{t:"Schiebst du den Kopf im Empfang weit nach vorne?",o:YN({overhead_stab:1,mobility:1}),how:"Video: Ist der Kopf deutlich vor den Armen?"},
 q_soft:{t:"Sind deine Ellbogen beim Empfang weich?",o:YN({overhead_stab:2,meet_bar:1}),how:"Video von vorne: Sind die Arme komplett gestreckt?"},
 q_trunkfwd:{t:"Kippt dein Oberkörper in der Hocke nach vorne?",o:YN({mobility:2,trunk_receive:1}),how:"Video von der Seite in der Hocke."},
 /* Stossen */
 j_dipfwd:{t:"Kippt der Oberkörper im Dip nach vorne oder geht das Gewicht auf die Zehen?",o:YN({dip_balance:3}),how:"Halte die tiefste Dip-Position 3 s. Wo liegt der Druck im Fuss?"},
 j_head:{t:"Nimmst du den Kopf beim Drive nach hinten aus der Bahn?",o:[["Ja",{}],["Nein",{bar_path_forward:3}],["Weiss nicht",{}]],how:"Die Stange soll gerade nach oben gehen, der Kopf weicht kurz zurück und kommt dann durch."},
 j_chest:{t:"Taucht die Brust im Split nach vorne?",o:YN({chest_dive:2}),how:"Video von der Seite. Ist der Oberkörper im Split senkrecht?"},
 j_rack:{t:"Rutscht die Stange im Dip von den Schultern?",o:YN({rack_jerk:2,dip_posture:1}),how:"Öffne im Rack kurz die Hände. Bleibt die Stange liegen?"},
 j_earlyunder:{t:"Gehst du unter die Stange, bevor die Beine gestreckt sind?",o:YN({drive_short:2,patience:2}),how:"Video: Verlassen die Füsse den Boden vor der vollen Streckung?"},
 j_feetlate:{t:"Landen die Füsse später als die Stange oben ankommt?",o:YN({foot_speed:2}),how:"Hörst du die Landung erst, wenn die Arme schon drücken?"},
 j_supportweak:{t:"Ist die Stange auch beim Jerk Support oder Überkopf-Halten instabil?",o:YN({overhead_jerk:3}),how:"Halte 100 % deines Jerks 5 s über Kopf aus dem Ständer."},
 j_lowheight:{t:"Bekommt die Stange beim Drive zu wenig Höhe?",o:YN({drive_short:2}),how:"Mache einen Push Press. Wie hoch geht die Stange vor dem Armstrecken?"},
 j_slowdip:{t:"Ist der Umkehrpunkt im Dip weich oder langsam?",o:YN({dip_elastic:3}),how:"Fühlt sich der Dip wie ein Absacken an statt wie ein Rückprall?"},
 j_trunksoft:{t:"Gibt der Rumpf im Dip nach (Brust sinkt)?",o:YN({dip_posture:3}),how:"Atme tief ein und spanne vor dem Dip. Ändert sich etwas?"},
 j_kneesin:{t:"Gehen die Knie im Dip nach innen oder weit nach vorne?",o:YN({dip_balance:2}),how:"Video von vorne und von der Seite."},
 j_legsok:{t:"Drücken die Beine gut, aber die Füsse starten zu früh?",o:YN({patience:2}),how:"Mache einen Press Into Jerk. Fühlt sich das Warten ungewohnt an?"},
 j_aftercleanq:{t:"Ist dein Jerk aus dem Ständer deutlich besser als nach dem Clean?",o:YN({cj_fatigue:3}),how:"Vergleiche Jerk aus dem Ständer und Clean & Jerk mit gleichem Gewicht."},
 j_backleg:{t:"Ist das hintere Bein überstreckt oder zu weit hinten?",o:YN({split_position:2}),how:"Das hintere Knie soll leicht gebeugt sein, die Ferse oben."},
 j_frontshort:{t:"Ist der vordere Schritt zu kurz (Schienbein nicht senkrecht)?",o:YN({split_position:2}),how:"Video von der Seite. Steht das vordere Schienbein etwa senkrecht?"},
 j_line:{t:"Landen die Füsse auf einer Linie, wie auf einem Seil?",o:YN({split_position:2}),how:"Die Füsse sollen etwa hüftbreit auseinander landen."},
 j_oneleg:{t:"Ist ein Bein deutlich schwächer?",o:YN({split_strength:2}),how:"Split Squats mit gleicher Last auf beiden Seiten vergleichen."},
 j_frontload:{t:"Liegt das Gewicht im Split vor allem auf dem vorderen Bein?",o:YN({split_position:2,chest_dive:2}),how:"Halte den Split 3 s. Kannst du das vordere Bein kurz entlasten?"},
 j_hipsback:{t:"Bleibt die Hüfte im Split hinter der Stange?",o:YN({chest_dive:3,bar_path_forward:1}),how:"Video: Liegen Ohr, Schulter, Hüfte und Stange übereinander?"},
 j_tallslow:{t:"Fühlt sich ein Tall Jerk mit leichtem Gewicht langsam an?",o:YN({foot_speed:2}),how:"Mache 3 Tall Jerks mit leerer Stange."},
 j_recover:{t:"Wandert die Stange, wenn du aus dem Split zurückkommst?",o:YN({recovery:3,overhead_jerk:1}),how:"Vorderer Fuss zuerst zurück, dann der hintere."},
 j_rackpain:{t:"Ist die Rack-Position unbequem oder drückt sie auf die Handgelenke?",o:YN({rack_jerk:3}),how:"Mit leerer Stange: Liegt die Stange auf den Schultern, Hände nur locker?"},
 j_breath:{t:"Bist du nach dem Clean ausser Atem oder verlierst die Spannung?",o:YN({cj_fatigue:1,dip_posture:1}),how:"Nimm dir nach dem Clean einen bewussten Atemzug und spanne neu."}
};

/* Fehlerbilder je Disziplin. b = Grundgewicht für die Ursache, q = Fragen. */
const PULL_FAULTS = [
 {id:"jump_fwd",ph:"Empfang",t:"Ich springe nach vorne",b:{heels_early:1,bar_away:1},q:["q_footpress","q_baraway","q_hipsfirst","q_hipbang"]},
 {id:"jump_back",ph:"Empfang",t:"Ich springe nach hinten",b:{lean_back:1},q:["q_jumpdist","q_leanback","q_heels1","q_hipthrough","q_earlyarms"]},
 {id:"bar_fwd",ph:"Empfang",t:"Ich verliere die Stange nach vorne",b:{bar_away:1},lift:"sn",q:["q_baraway","q_hipbang","q_soft","q_trunkfwd","q_footpress"]},
 {id:"bar_back",ph:"Empfang",t:"Die Stange fällt nach hinten",b:{overhead_stab:1},lift:"sn",q:["q_leanback","q_ohdrift","q_headfwd","q_earlyarms"]},
 {id:"hips_first",ph:"1. Zug",t:"Die Hüfte steigt beim Abheben zuerst",b:{pull_posture:1},q:["q_startunstable","q_roundback","q_fsratio","q_fastfloor"]},
 {id:"bar_loop",ph:"2. Zug",t:"Die Stange entfernt sich vom Körper",b:{bar_away:1},q:["q_barwhere","q_lats","q_hipbang"]},
 {id:"early_finish",ph:"2. Zug",t:"Ich richte mich zu früh auf",b:{stay_over:1},q:["q_overknee","q_backweak","q_kneesfwd"]},
 {id:"incomplete",ph:"2. Zug",t:"Zu wenig Streckung, Stange zu tief",b:{legs_quit:1},q:["q_legsquit","q_rush","q_pullratio","q_jumps"]},
 {id:"early_arms",ph:"2. Zug",t:"Ich ziehe zu früh mit den Armen",b:{early_arms:2},q:["q_earlyarms","q_armspull","q_tightarms"]},
 {id:"slow_under",ph:"3. Zug",t:"Ich komme langsam unter die Stange",b:{slow_turnover:1},q:["q_wait","q_connection","q_fear","q_musclebad"]},
 {id:"catch_high",ph:"3. Zug",t:"Ich fange hoch und rutsche dann runter",b:{receive_conf:1},q:["q_catchhigh","q_fear","q_stance"]},
 {id:"pressout",ph:"Empfang",t:"Ausdrücken, weiche Ellbogen",b:{overhead_stab:1},lift:"sn",q:["q_armslate","q_ohswobble","q_mob","q_wrists"]},
 {id:"crash",ph:"Empfang",t:"Die Stange crasht auf die Schultern",b:{clean_rack:1},lift:"cl",q:["q_elbowslate","q_dropbar","q_rackmob"]},
 {id:"collapse",ph:"Empfang",t:"Ellbogen auf den Knien, Rumpf fällt ein",b:{trunk_receive:1},lift:"cl",q:["q_elbowsdrop","q_fschest","q_rackmob"]},
 {id:"feet",ph:"Empfang",t:"Die Füsse landen unregelmässig oder zu breit",b:{footwork:2},q:["q_stance","q_feethigh"]},
 {id:"recover",ph:"Aufstehen",t:"Ich komme aus der Hocke nicht hoch",b:{squat_strength:1},lift:"sn",q:["q_chestfall","q_squatweak","q_ohrecover","q_mob"]},
 {id:"recover_cl",ph:"Aufstehen",t:"Ich komme aus der Hocke nicht hoch",b:{squat_strength:1},lift:"cl",q:["q_chestfall","q_squatweak","q_elbowsdrop","q_mob"]}
];
const JERK_FAULTS = [
 {id:"j_rack",ph:"Rack",t:"Die Rack-Position ist unbequem",b:{rack_jerk:1},q:["j_rackpain","j_rack"]},
 {id:"j_dip",ph:"Dip",t:"Der Dip ist unruhig oder kippt",b:{dip_balance:1},q:["j_dipfwd","j_kneesin","j_slowdip","j_trunksoft"]},
 {id:"j_drive",ph:"Drive",t:"Die Stange geht zu wenig hoch",b:{drive_short:1},q:["j_lowheight","j_legsok","j_aftercleanq"]},
 {id:"j_fwd",ph:"Drive",t:"Die Stange geht nach vorne",b:{bar_path_forward:1},q:["j_dipfwd","j_head","j_chest","j_rack"]},
 {id:"j_pressout",ph:"Unter die Stange",t:"Ausdrücken",b:{drive_short:1,foot_speed:1},q:["j_earlyunder","j_feetlate","j_supportweak","j_lowheight"]},
 {id:"j_slowfeet",ph:"Unter die Stange",t:"Meine Füsse sind zu langsam",b:{foot_speed:1},q:["j_tallslow","j_legsok"]},
 {id:"j_split",ph:"Split",t:"Der Split ist zu kurz, zu lang oder schmal",b:{split_position:1},q:["j_backleg","j_frontshort","j_line","j_oneleg"]},
 {id:"j_frontleg",ph:"Split",t:"Das vordere Bein ist überlastet",b:{split_position:1,chest_dive:1},q:["j_frontload","j_hipsback","j_oneleg"]},
 {id:"j_dive",ph:"Split",t:"Die Brust taucht nach vorne",b:{chest_dive:1},q:["j_hipsback","j_chest","j_head"]},
 {id:"j_recover",ph:"Recovery",t:"Ich wackle beim Zurückkommen",b:{recovery:1},q:["j_recover","j_oneleg","j_supportweak"]},
 {id:"j_afterclean",ph:"Recovery",t:"Der Jerk scheitert nach schwerem Clean",b:{cj_fatigue:1},q:["j_aftercleanq","j_breath","j_trunksoft"]}
];
const LIFTS = {
 sn:{t:"Reissen",s:"Snatch",faults:PULL_FAULTS.filter(f=>!f.lift||f.lift==="sn")},
 cl:{t:"Umsetzen",s:"Clean",faults:PULL_FAULTS.filter(f=>!f.lift||f.lift==="cl")},
 jk:{t:"Stossen",s:"Jerk",faults:JERK_FAULTS}
};
const PHASES = {sn:["1. Zug","2. Zug","3. Zug","Empfang","Aufstehen"],cl:["1. Zug","2. Zug","3. Zug","Empfang","Aufstehen"],jk:["Rack","Dip","Drive","Unter die Stange","Split","Recovery"]};

