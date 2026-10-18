/* Fault catalog: exercise notes, causes, questions, fault patterns.
   The texts here are English. German and French come from I18N[lang].cat (js/lang/*.js), see applyCatalogLang. */
const BYID = Object.fromEntries(LIB.map(r=>[r[0],r]));
const url = id => "https://www.catalystathletics.com/exercise/"+BYID[id][3];
const SEC = {SN:"Snatch",CL:"Clean",JK:"Jerk",GEN:"General",TRK:"Trunk",LOW:"Legs & hips",JMP:"Jumps",UP:"Upper body",PREP:"Prehab",CAR:"Carries"};

/* Short notes (own summaries of the "Purpose" sections). [snatchId, cleanId] share one note. */
const NOTE = {}, NOTE_GROUPS = [];
function note(ids, text){ ids=[].concat(ids); NOTE_GROUPS.push([ids,text]); ids.forEach(i=>{ if(i) NOTE[i]=text; }); }
note([627,644],"Bar floats just above the floor. Builds the start and first-pull balance if you tip forward off the floor.");
note([391,366],"Slow first pull, then full speed. Lets you feel and fix errors and trains the timing into the second pull.");
note([642,648],"Slow pull without the turnover. Balance, position and postural strength in the first pull.");
note([389,368],"First pull only, to just above the knee. Strength, balance and posture in isolation.");
note(700,"Teaches the correct first-pull movement if you rock back to the heels or tip too far over the bar.");
note([187,176],"Basic pulling strength in the real positions of the lift, slow enough to control balance and back.");
note([205,177],"Standing on a riser. Emphasises strength off the floor and holding your back position under heavy load.");
note([399,370],"Floating from a riser at full start depth. Strengthens first-pull posture.");
note([208,180],"Pull from a riser. Strength and upright posture off the floor.");
note([317,355],"Pause in the bottom. Trunk and postural strength, comfort in the hole, stops you leading with the hips.");
note(183,"Strengthens the isometric back extension you have to hold during the pull.");
note(424,"Narrow stance, lots of quads. Supports an upright pull off the floor.");
note(78,"Leg strength specific to the clean, plus trunk strength and an upright pull off the floor.");
note([186,185],"Pull to mid-thigh and hold. Teaches you to stay over the bar longer and keep it close.");
note([640,645],"Floating start plus a halt at mid-thigh. Start, first pull and balance in one exercise.");
note([315,322],"Pull with pauses at weak points, e.g. just above the knee. Feel and correct position and balance.");
note([392,362],"Full lift with pauses in the pull. Reinforces positions and makes the finish more aggressive.");
note([388,367],"No contact between bar and hips. Forces vertical leg drive and fixes an early second pull and leaning back.");
note([628,629],"Pull to the hip. Teaches you to bring the bar back to you instead of letting it pull you forward.");
note(577,"Strengthens lats and shoulders to keep the bar tight to the legs in the pull.");
note(906,"Isolates the lats that push the bar back into the body during the pull.");
note(907,"Lat strength without the biceps, for keeping the bar close.");
note([401,371],"From a small dip. Leg drive instead of hip bang, flat feet longer, bar against the body, clean arm timing.");
note([434,433],"From the power position with a pause. Controlled, hard leg drive without momentum, flat feet, arm timing.");
note([316,321],"For lifters who swing the bar forward off the hips or thighs. Teaches third-pull arm mechanics.");
note([466,665],"Arm mechanics and bar proximity from the power position, with an emphasis on vertical leg drive.");
note([400,378],"Feet stay planted. Longer leg drive, second-to-third pull timing, fixes imbalances and high foot lift.");
note([453,450],"Pull into full extension and hold. Feel complete extension and vertical leg drive.");
note([99,100],"Pull to maximum height with the arms. Aggressive, complete, vertical extension and legs-to-arms timing.");
note([92,93],"Trains the final aggressive leg extension. Allows very heavy loads.");
note([394,365],"Very high hang position. Forces an aggressive finish and a fast turnover.");
note([545,688],"The bar has to reach a mark. Forces a complete, consistent pull.");
note([667,657],"Top of the pull from the power position. Position and vertical leg drive, also for overload.");
note(426,"Leg explosiveness that carries over to speed and strength at the finish.");
note([456,455],"Pull with flat feet if you lift the heels early or drift forward.");
note([457,454],"Flat-footed pull into extension and hold. Balance over the whole foot.");
note([479,689],"No jump, no contact. Vertical leg drive, fixes leaning back and an early second pull.");
note([96,149],"Learns and strengthens third-pull arm mechanics. An active rather than passive turnover.");
note([385,373],"Pull plus the move down. Trains timing and mechanics of pulling under.");
note([681,699],"Pull in stages, then the full lift. Transfers the feel of each position into the complete lift.");
note([217,150],"From standing tall straight under the bar. Speed, aggression and precision in the turnover.");
note([543,542],"Teaching and warm-up drill for the turnover.");
note([61,67],"Less time and distance to get under. Speed and aggression, teaches you to meet the bar instead of losing connection.");
note(312,"Speed and aggression at the end of the turnover, precise foot and bar placement, confidence in the bottom.");
note([62,69],"Shorter pull. Complete extension, more aggressive turnover, confidence.");
note([439,442],"Catch high with the correct stance and tension, then ride into the squat. Teaches meeting the bar.");
note([419,647],"Pauses in the pull plus a power receipt. Control of the turnover.");
note(80,"Strength, timing and confidence in the receipt, fast feet. With heavy loads, courage to pull under deep.");
note(82,"Feet stay put. Reinforces the receiving position and tension against the bar, less intimidating.");
note(79,"The basic snatch receiving position exercise. Strength, mobility and overhead stability.");
note(674,"Hanging weights add stabilisation work. For a shaky overhead position.");
note(95,"Press in the bottom of the squat. Ankle, hip, thoracic and shoulder mobility plus overhead strength.");
note(537,"Sots press with hanging weights. More upper-body stabilisation.");
note(89,"More weight overhead with leg help. Strengthens arms, shoulders, upper back and wrists.");
note(386,"Strength and stability in the upper back. A good warm-up for an accurate overhead position.");
note(890,"Overhead carry. Stability for the snatch, conditions hands and wrists to the load.");
note(892,"Overhead carry with hanging weights. Even more stabilisation work.");
note(204,"Teaches the correct overhead position, plus scapular and upper-back strength.");
note(181,"Hold a heavy weight in the rack. Trunk, rack position and confidence.");
note([168,605],"Strengthens the very bottom of the squat for a clean recovery.");
note(81,"Press yourself slowly under the bar. Feel position and balance, active stretch.");
note(420,"Ankle, hip, shoulder and thoracic mobility plus upper-back strength.");
note(588,"Dumbbell press in the squat. Mobility and side-to-side comparison, reveals asymmetries.");
note(584,"Hip mobility under load, with stability in the new range.");
note(209,"Press in the front squat. Mobility for the clean receiving position, trunk stability.");
note(761,"Scapular control, helps rack mobility.");
note([631,695],"Power variation without a jump. Long leg drive and a faster change of direction.");
note([435,438],"Stop at parallel, the weakest point mechanically. Strength through the sticking point.");
note([444,445],"Start from pins with no pre-tension. Explosive strength and strength in specific ranges.");
note([618,619],"Pauses in the weakest range. Posture, balance and strength through the sticking point.");
note(77,"Basic strength for legs and trunk.");
note(381,"Faster, more upright recovery. Then the jerk with tired legs.");
note(448,"Keeps the pelvis–spine relationship stable, against overarching the lower back.");
note(494,"Stabilises pelvis and spine against unwanted movement.");
note([207,379],"From blocks with a dead start. Rate of force development, because the distance to accelerate is short.");
note([203,380],"Blocks plus a power receipt. Speed with lower overall load.");
note([63,68],"From the hang. Rate of force development, complete pull, aggressive turnover, sense of position.");
note([65,70],"Three positions from bottom to top. Speed and complete extension.");
note(353,"Squat jump. Explosiveness through the full squat, helps the recovery.");
note(552,"Seated jump with no countermovement. Pure rate of force development without elasticity.");
note(548,"The basic exercise for explosive leg and hip extension.");
note([97,98],"More weight than the lift itself. Strength, speed, posture and balance in the extension.");
note([396,361],"Pull from the hang. Strength in a specific range, targeted at weak points.");
note(101,"Glutes, hamstrings, isometric back extension and lats for bar proximity.");
note(171,"Upper back and postural strength, helps keep the bar close in the pull.");
note([402,359],"From blocks. Work the problem range around the knees.");
note([443,686],"Only if nothing else works: a remedial drill when the knees don't re-bend under the bar naturally.");
note(544,"Teaching drill for delivering the bar into the rack.");
note(662,"Muscle clean from a dip. Precise delivery into the rack, leg drive and bar proximity.");
note(580,"Every deviation gets punished. Accurate turnover with a full grip, aggressive drive.");
note(194,"Dip and drive with a heavy load. Strength, balance and position through the whole dip.");
note(410,"Pause in the bottom of the dip. A powerful, complete drive and the right dip depth.");
note(626,"Pause at the lowest point of the dip. Strengthens the bottom position.");
note(472,"Jerk drive with bands. Stops you pushing the bar forward and encourages a long leg drive.");
note(639,"Push press with a pause in the dip. Dip position, balance, drive and timing.");
note(541,"Slow-motion jerk. Feel positions and balance deliberately.");
note(414,"Strengthens dip depth and absorbing the load for the change of direction.");
note(196,"Hold a heavy weight in the jerk rack. Rack position, trunk, confidence.");
note(87,"Same dip and drive as the jerk. Harder, longer leg drive and legs-to-arms timing.");
note(413,"Dip and drive with a heavy load. Timing, elasticity and a complete drive.");
note(625,"Like the jerk drive, but without its typical bad habits.");
note(462,"From a dead stop without a dip. Maximum force production and a complete drive before going under.");
note(405,"Feet stay on the floor. A higher, vertical drive and balance in the dip.");
note(72,"Higher and more precise drive, fast transition under the bar.");
note(651,"Front squat, then jerk. A complete leg drive with tired legs.");
note(213,"Behind the neck the bar travels straight up. Teaches the ideal overhead and split position.");
note(202,"Behind the neck with a power receipt. Vertical bar path and a complete drive.");
note(652,"Behind the neck, feet stay put. Vertical bar path and balance control.");
note(655,"From standing tall, behind the neck. Timing, aggression and a correct overhead position.");
note(88,"Push press behind the neck. Vertical bar path and scapular position overhead.");
note(406,"Drive from a split stance. Teaches the slight backward bar movement without falling forward with the chest.");
note(407,"Press, then split. Patience in the drive and fast, precise feet.");
note(193,"For lifters who dive with head and chest, over-reach the back foot or short-step the front.");
note(459,"From the split. Strengthens split and overhead position, against diving the chest.");
note(458,"From the split, behind the neck. Control of foot and overhead position.");
note(408,"Press in the split. Position and balance in the split, a primer before jerks.");
note(441,"Step into the split. Braking and holding without shifting weight forward.");
note(428,"Walk into the split. Holding, balance and evening out the two legs.");
note(411,"Jump into the split. Fast, accurate feet and an upright trunk.");
note(417,"Drop into the split. Fast, accurate feet and an upright trunk.");
note(218,"From standing tall. Aggression, timing and accuracy in the jerk.");
note(653,"Power version from standing tall. Aggression, timing and accuracy.");
note(198,"Hold more than your jerk overhead. Stability and confidence.");
note(469,"Hold a heavy weight in a deep split. Overhead and split stability.");
note(197,"Hold heavy overhead and recover from the split. Footwork and balance.");
note(409,"Press behind the neck in the split. Overhead position plus comfort in the split.");
note(853,"Overhead carry with a jerk grip. Stability, hands and wrists.");
note(854,"Overhead carry with hanging weights. More stabilisation work.");
note(412,"Rhythmic dipping. Brake faster and use the elasticity.");
note(649,"Rhythm dip straight into the jerk. Transfers the timing without overthinking.");
note(404,"Rebound out of the dip. Fast braking and elasticity.");
note(550,"Land and absorb. Take force safely and in position.");
note(764,"Scapular protraction and shoulder range of motion.");
note(174,"Strength for the split, evens out side-to-side differences.");
note(737,"Split squat with a band. Stability in the split.");
note(173,"Single leg. Fixes weaknesses, hip stability, hip-flexor mobility.");
note(427,"Overhead split squat. Legs, trunk and overhead position together.");
note(714,"Anti-rotation in the split. Trunk and leg stability.");
note(354,"Basic single-leg exercise. Balance between sides and split strength.");
note(429,"Recover from a deep power receipt with heavy weight overhead. For lifters who bail when they catch low.");
note(485,"Step into the split with weight overhead. Leg and overhead stability.");
note(372,"Clean, then jerk right away. Aggressive recovery, accurate turnover, drive with tired legs.");

/* Causes. ex: list of IDs or [snatch, clean]; 0 = not available for that lift. */
const CAUSES = {
 pull_balance:{t:"Balance in the first pull",why:"Off the floor your weight shifts to the toes or the heels. Everything after that builds on the wrong starting point.",test:"Pull lightly to just below the knee and hold for 2 s. If you feel the pressure over the whole foot (mid-foot), it's right.",ex:[[627,644],[391,366],[642,648],[389,368],700,[187,176]]},
 pull_posture:{t:"Back position and strength off the floor",why:"The hips shoot up or the back gives way because the legs or back extensors can't hold the position under load.",test:"Compare your front squat with your clean. If the front squat is below about 115 % of your clean, leg strength is usually missing.",ex:[[205,177],[399,370],[208,180],[317,355],183,424,78]},
 stay_over:{t:"Standing up too early",why:"Your shoulders get behind the bar before mid-thigh. The second pull starts early and the force goes forward instead of up.",test:"Side-view video: are your shoulders still in front of the bar as it passes the knee?",ex:[[186,185],[640,645],[315,322],[392,362],[388,367]]},
 bar_away:{t:"Bar drifts away from the body",why:"The lats don't push the bar back into the legs. It travels forward and pulls you with it.",test:"Pull with straight arms and think 'push the bar into my thighs'. Can you feel your lats working?",ex:[[628,629],[186,185],577,906,907,[401,371]]},
 hip_bang:{t:"Hip bang instead of leg drive",why:"The hips knock the bar forward. The path becomes a loop and you have to jump after it.",test:"Do you hear or feel a hard hit at the hips, after which the bar flies away from you?",ex:[[316,321],[434,433],[401,371],[466,665],[388,367]]},
 legs_quit:{t:"Legs stop driving too early",why:"The extension is incomplete. The bar gets too little height and you have to save it with the arms.",test:"Pull with 100 % and hold at the top. Are you on the balls of your feet with knees and hips fully extended?",ex:[[400,378],[453,450],[99,100],[92,93],[394,365],[545,688],[667,657],426]},
 heels_early:{t:"Heels up too early, weight forward",why:"You get onto the forefoot too soon, the weight drifts forward and the bar follows.",test:"Pull barefoot or with chalk under the heel. Does the heel come up before mid-thigh?",ex:[[456,455],[457,454],[434,433],[401,371]]},
 lean_back:{t:"Leaning back too far at the finish",why:"Your torso goes far behind the bar. That pushes the bar away and you backward.",test:"Video: is your torso clearly behind vertical at the finish, before you pull yourself under?",ex:[[388,367],[479,689],[453,450],[400,378]]},
 early_arms:{t:"Bending the arms too early",why:"Pulling with the arms early takes power from the legs and moves the bar away from the body.",test:"Video: are your elbows already bent before knees and hips are extended?",ex:[[434,433],[401,371],[316,321],[96,149],[99,100]]},
 transition_timing:{t:"Second-to-third pull timing",why:"You go under too early or too late. Correct is: keep driving against the floor while you start pulling under.",test:"Can you do a clean lift with no jump (feet stay planted)? If not, the timing is off.",ex:[[400,378],[388,367],[391,366],[385,373],[681,699]]},
 slow_turnover:{t:"Passive, slow turnover",why:"After the extension you wait instead of pulling yourself under the bar actively.",test:"How fast is your tall snatch or tall clean with light weight? If it feels sluggish, aggression is missing.",ex:[[217,150],[543,542],[96,149],[61,67],[394,365],[312,0],[385,373],[62,69]]},
 meet_bar:{t:"Losing connection with the bar",why:"You let go of the bar instead of meeting it with tension. It crashes on you or the elbows go soft.",test:"Do you feel tension on the bar the whole time, or is there a moment where it 'floats'?",ex:[[61,67],[439,442],[62,69],[419,647],[80,0]]},
 clean_rack:{t:"Delivery into the rack",why:"The elbows come through too late. The bar crashes on the shoulders instead of being guided there.",test:"Do a light muscle clean. Does the bar land softly and under control on your shoulders?",ex:[[0,149],[0,542],[0,544],[0,662],[0,665],[0,580]]},
 overhead_stab:{t:"Unstable overhead position",why:"Shoulders, upper back or wrists don't stabilise the bar. It drifts or the arms give way.",test:"Do 5 overhead squats with 70 % of your snatch. Does the bar stay quiet over mid-foot?",ex:[[79,0],[674,0],[95,0],[89,0],[386,0],[890,0],[892,0],[204,0]]},
 receive_conf:{t:"Confidence in a deep receipt",why:"You don't pull yourself all the way down because you don't trust the squat under heavy load.",test:"Does a snatch balance or a heavy clean into a full squat feel uncomfortable or scary?",ex:[[80,442],[82,181],[312,605],[439,355],[79,0]]},
 mobility:{t:"Mobility in the squat",why:"Ankles, hips, thoracic spine or shoulders don't allow an upright squat position.",test:"With an empty bar, can you sit into a deep, upright squat (overhead or in the rack) without compensating?",ex:[[95,209],[81,420],[420,355],[588,761],[584,584]]},
 footwork:{t:"Footwork and receiving stance",why:"The feet land too wide, uneven or in a different spot than needed. That costs stability in the receipt.",test:"Mark your start and landing positions with chalk. Do your feet land in the same place every time?",ex:[[400,378],[439,442],[631,695],[312,0],[80,0],[479,689]]},
 squat_strength:{t:"Strength out of the squat",why:"You catch the bar but can't stand up. Leg strength at the turnaround is missing.",test:"Can you do a pause squat (2 s in the bottom) with your best lift?",ex:[[317,355],[435,438],[444,445],[168,605],[618,619],[77,78]]},
 trunk_receive:{t:"Trunk tension in the receipt",why:"The trunk gives way under the load. The chest falls forward and the bar follows.",test:"In your front or overhead squat, does the chest fall forward when you stand up?",ex:[[317,355],[0,181],[0,381],448,494,78]},
 rfd:{t:"Speed strength",why:"The strength is there, but you can't apply it to the bar quickly enough.",test:"Compare your best pull with your lift. If you pull well over 120 % of your lift, speed is missing more than strength.",ex:[[207,379],[203,380],[63,68],[65,70],353,552,548]},
 pull_strength:{t:"Pulling strength",why:"Strength in the pull isn't enough for heavy attempts.",test:"Can you pull 110 % of your best lift with a clean position?",ex:[[97,98],[187,176],[396,361],[208,180],101,171]},
 scoop:{t:"Knee re-bend in the second pull",why:"After the bar passes the knees, they don't move back under the bar smoothly. The movement turns into a jerk.",test:"Video: after the bar passes your knees, do they move forward under the bar again?",ex:[[402,359],[315,322],[186,185],[681,699],[443,686]]},
 /* Jerk */
 dip_balance:{t:"Balance in the dip",why:"In the dip the weight moves to the toes or the torso tips. The drive then goes forward.",test:"Hold the bottom of the dip for 3 s. Does the pressure stay over mid-foot and heel, with a vertical torso?",ex:[194,410,626,472,639,541,414]},
 dip_posture:{t:"Trunk in the dip",why:"The chest sinks in the dip. The bar loses its solid platform and power leaks out.",test:"Does the bar stay solid on your shoulders in the dip, or does the trunk feel 'soft'?",ex:[196,414,78,448]},
 drive_short:{t:"Drive too short",why:"The legs stop driving before they're fully extended. The bar gets too little height.",test:"Do a push press. Do you finish on the balls of your feet with fully extended legs?",ex:[87,413,625,462,472,405,651]},
 bar_path_forward:{t:"Bar path goes forward",why:"The bar is pushed forward around the chin instead of straight up. You have to follow it.",test:"Is your jerk clearly better from behind the neck? Then the problem is bar path and head movement.",ex:[213,202,652,655,88,405,406]},
 patience:{t:"Impatience in the drive",why:"You move your feet before the drive is finished. The bar has too little height when you arrive under it.",test:"Video: do your feet leave the floor before your legs are extended?",ex:[407,410,462,87]},
 split_position:{t:"Split position",why:"The split is too short, too long, or the feet land in line. The base isn't stable.",test:"Mark your ideal split with chalk and compare it with your landing after a heavy jerk.",ex:[193,459,458,408,441,428]},
 chest_dive:{t:"Chest dives, hips stay back",why:"Head and chest go forward, the hips stay behind the bar. The weight ends up on the front leg.",test:"Video: are your hips under the bar in the split, or behind it?",ex:[193,411,417,459,406]},
 foot_speed:{t:"Feet too slow",why:"You arrive under the bar too late and have to press it out with the arms.",test:"How fast is your tall jerk with light weight? Do you hear both feet land at the same time?",ex:[218,653,411,417,407]},
 overhead_jerk:{t:"Overhead stability in the jerk",why:"Shoulders and upper back don't lock the bar. The arms give way or the bar drifts.",test:"Can you hold 110 % of your jerk quietly overhead for 5 s in a jerk support?",ex:[198,469,197,204,409,853,854]},
 dip_elastic:{t:"Braking in the dip",why:"The turnaround is soft and slow. The elastic energy of bar and legs is lost.",test:"Does the bottom of your dip feel like 'sinking' rather than a quick rebound?",ex:[412,649,404,414,550]},
 rack_jerk:{t:"Jerk rack position",why:"The bar doesn't sit securely on the shoulders. It slips or loads the wrists.",test:"Does the bar stay on your shoulders when you briefly open your hands?",ex:[196,761,764,78]},
 split_strength:{t:"Strength and symmetry in the split",why:"One leg is weaker or unstable. The split wobbles or collapses.",test:"Do split squats with the same load on both sides. Do you notice a clear difference?",ex:[174,737,428,173,427,714,354]},
 recovery:{t:"Recovering from the split",why:"Your footwork out of the split is unsure. The bar loses its position.",test:"Can you recover front foot first, then back foot, without the bar moving?",ex:[197,429,485]},
 cj_fatigue:{t:"Fatigue after the clean",why:"The clean costs so much that legs or trunk are missing for the jerk.",test:"Is your jerk from the rack clearly better than after a clean?",ex:[381,372,651]}
};

/* Questions. o: [label, {cause: weight}]. The last option is always "Not sure". */
const YN = (yes, no={}) => [["Yes",yes],["No",no],["Not sure",{}]];
const Q = {
 q_footpress:{t:"Where do you feel the pressure in your foot as the bar passes the knee?",o:[["Toes / forefoot",{heels_early:2,pull_balance:2}],["Whole foot",{}],["Heels",{pull_balance:2}],["Not sure",{}]],how:"Pull lightly to just above the knee and hold. Pay attention to your feet only."},
 q_baraway:{t:"Does the bar drift away from your body (side-view video: bar in front of the toes)?",o:YN({bar_away:2,hip_bang:1}),how:"Film from the side at hip height. Imagine a vertical line through mid-foot."},
 q_hipsfirst:{t:"Off the floor, do your hips rise faster than your shoulders?",o:YN({pull_posture:2,pull_balance:1}),how:"Side-view video: does your back angle change a lot before the knee?"},
 q_hipbang:{t:"Do your hips knock the bar forward?",o:YN({hip_bang:3}),how:"Do you hear a loud hit, after which the bar flies away in front of you?"},
 q_leanback:{t:"Do you lean back clearly at the end of the pull?",o:YN({lean_back:3,transition_timing:1}),how:"Video: how far behind vertical is your torso before you go under?"},
 q_heels1:{t:"Off the floor, do you feel the pressure mostly on your heels?",o:YN({pull_balance:2}),how:"Do 3 lift-offs to the knee and pay attention to your feet."},
 q_hipthrough:{t:"Do you push your hips through the bar instead of driving up with your legs?",o:YN({hip_bang:2,legs_quit:1}),how:"Can you do a dip snatch or dip clean without hitting the bar with your hips?"},
 q_earlyarms:{t:"Do you bend your arms before knees and hips are extended?",o:YN({early_arms:3}),how:"Video: look at your elbows at the moment of full extension."},
 q_jumpdist:{t:"How far do you jump back?",o:[["A few centimetres",{}],["About a foot length or more",{lean_back:1,footwork:2}],["Not sure",{}]],how:"Put a chalk line at your heels in the start position and measure after the lift. A small jump back is normal for many good lifters and not a fault."},
 q_barwhere:{t:"Where does the bar first move away from you?",o:[["Right off the floor",{pull_balance:2,bar_away:1}],["At the knee / thigh",{scoop:2,stay_over:1,bar_away:1}],["At the hips",{hip_bang:3}],["Not sure",{}]],how:"Side-view video in slow motion. Many phones can film at 240 fps."},
 q_lats:{t:"Do you actively push the bar into your legs with straight arms?",o:[["Yes",{}],["No",{bar_away:2}],["Not sure",{}]],how:"Imagine pushing the bar back into your shins. Can you feel your lats?"},
 q_overknee:{t:"Are your shoulders still in front of the bar at the knee?",o:[["Yes",{}],["No",{stay_over:3}],["Not sure",{}]],how:"Video: pause the frame when the bar is at knee height."},
 q_backweak:{t:"Does your back feel weak in the mid-thigh position?",o:YN({stay_over:1,pull_strength:1}),how:"Do a halting deadlift with 100 % and hold for 3 s."},
 q_kneesfwd:{t:"After the bar passes the knees, do they move back under the bar?",o:[["Yes",{}],["No / jerky",{scoop:2}],["Not sure",{}]],how:"Video: watch the knees between knee height and mid-thigh."},
 q_legsquit:{t:"Do your legs stop driving before you go under?",o:YN({legs_quit:3}),how:"At the top, are you on the balls of your feet with straight knees?"},
 q_rush:{t:"Do you feel the urge to get under as fast as possible?",o:YN({transition_timing:1,legs_quit:1}),how:"Does a lift with no jump (feet stay planted) feel very unfamiliar?"},
 q_pullratio:{t:"Is a pull with 110 % of your best lift hard?",o:YN({pull_strength:2}),how:"Test a pull with 110 % in a clean position."},
 q_jumps:{t:"Do jumps or block lifts feel slow?",o:YN({rfd:2}),how:"Compare box jumps, block snatches or block cleans with your lifts from the floor."},
 q_armspull:{t:"Do you deliberately pull with your arms to get the bar up?",o:YN({early_arms:1,legs_quit:1}),how:"How does a lift from the power position with relaxed arms feel?"},
 q_tightarms:{t:"Are your arms already tense at the start?",o:YN({early_arms:1}),how:"Arms should be long and relaxed, elbows turned out."},
 q_wait:{t:"After the extension, do you wait until the bar is up?",o:YN({slow_turnover:2,transition_timing:1}),how:"Do you feel a short pause between extension and pulling under?"},
 q_connection:{t:"Is there a moment where the bar 'floats' free?",o:YN({meet_bar:3}),how:"Pay attention to the tension in your hands during the turnover."},
 q_fear:{t:"Are you unsure about getting all the way under the bar?",o:YN({receive_conf:3}),how:"How does a snatch balance with your best snatch feel?"},
 q_musclebad:{t:"Is your muscle snatch or muscle clean technically messy?",o:YN({slow_turnover:2}),how:"Do 3 reps with light weight in front of a mirror."},
 q_armslate:{t:"Do your arms only lock out after you land?",o:YN({meet_bar:2,slow_turnover:2}),how:"Video: are your arms already straight when your feet land?"},
 q_ohswobble:{t:"Does the bar wobble even in light overhead squats?",o:YN({overhead_stab:3}),how:"5 overhead squats with 60 to 70 % of your snatch."},
 q_mob:{t:"Is the deep squat uncomfortable overhead or in the rack?",o:YN({mobility:2}),how:"With an empty bar: can you sit deep and upright without compensating?"},
 q_wrists:{t:"Do your wrists give way or hurt overhead?",o:YN({overhead_stab:1}),how:"If there is real pain, get it checked."},
 q_stance:{t:"Is your power receiving stance different from your squat stance?",o:YN({footwork:2}),how:"Chalk under your feet, then compare power and full squat receipts."},
 q_feethigh:{t:"Do you lift your feet high off the floor before moving them?",o:YN({footwork:2,transition_timing:1}),how:"The feet should move flat and quickly, no jumping up."},
 q_chestfall:{t:"Does your torso fall forward when you stand up?",o:YN({trunk_receive:2,squat_strength:1}),how:"Side-view video of the recovery from the squat."},
 q_squatweak:{t:"Is your squat weak compared to your lifts?",o:YN({squat_strength:3}),how:"Guideline: front squat at least 115 to 120 % of your clean."},
 q_ohrecover:{t:"Does the bar get unstable as you stand up?",o:YN({overhead_stab:2}),how:"Does the bar stay over mid-foot during the recovery?"},
 q_catchhigh:{t:"Do you catch the bar high and only then slide into the squat?",o:YN({receive_conf:2,slow_turnover:1}),how:"Video: at what height do bar and body meet?"},
 q_elbowslate:{t:"Do your elbows come through late?",o:YN({clean_rack:3,slow_turnover:1}),how:"Front or side video in slow motion."},
 q_dropbar:{t:"Do you let the bar drop onto your shoulders instead of guiding it?",o:YN({meet_bar:2,clean_rack:1}),how:"How hard is the impact on your shoulders?"},
 q_rackmob:{t:"Is the rack position uncomfortable (wrists, lats, triceps)?",o:YN({mobility:2}),how:"With an empty bar: are the elbows high and the fingers relaxed under the bar?"},
 q_elbowsdrop:{t:"Do your elbows drop in the rack?",o:YN({trunk_receive:1,clean_rack:1}),how:"Side-view video of your front squat."},
 q_fschest:{t:"Does your chest fall forward in the front squat?",o:YN({trunk_receive:2,squat_strength:1}),how:"Front squat at 85 % on video."},
 q_fastfloor:{t:"Do you rip the bar off the floor quickly?",o:YN({pull_balance:1}),how:"The first pull should be controlled, acceleration comes after."},
 q_roundback:{t:"Does your back round off the floor?",o:YN({pull_posture:3}),how:"Side-view video. Watch the lower back."},
 q_fsratio:{t:"Is your front squat relatively weak?",o:YN({pull_posture:2,squat_strength:1}),how:"Guideline: front squat at least 115 % of your clean."},
 q_startunstable:{t:"Does your start position feel unstable?",o:YN({pull_balance:2}),how:"Hold the start position for 3 s with the bar just off the floor."},
 q_ohdrift:{t:"Does the bar get pushed too far back overhead?",o:YN({overhead_stab:2}),how:"Video: where is the bar relative to mid-foot?"},
 q_headfwd:{t:"Do you push your head far forward in the receipt?",o:YN({overhead_stab:1,mobility:1}),how:"Video: is your head clearly in front of your arms?"},
 q_soft:{t:"Are your elbows soft in the receipt?",o:YN({overhead_stab:2,meet_bar:1}),how:"Front-view video: are the arms fully locked?"},
 q_trunkfwd:{t:"Does your torso tip forward in the squat?",o:YN({mobility:2,trunk_receive:1}),how:"Side-view video in the squat."},
 /* Jerk */
 j_dipfwd:{t:"Does your torso tip forward or your weight move to the toes in the dip?",o:YN({dip_balance:3}),how:"Hold the bottom of the dip for 3 s. Where is the pressure in your foot?"},
 j_head:{t:"Do you move your head back out of the bar path during the drive?",o:[["Yes",{}],["No",{bar_path_forward:3}],["Not sure",{}]],how:"The bar should travel straight up; the head moves back briefly and then comes through."},
 j_chest:{t:"Does your chest dive forward in the split?",o:YN({chest_dive:2}),how:"Side-view video. Is your torso vertical in the split?"},
 j_rack:{t:"Does the bar slip off your shoulders in the dip?",o:YN({rack_jerk:2,dip_posture:1}),how:"Open your hands briefly in the rack. Does the bar stay put?"},
 j_earlyunder:{t:"Do you go under the bar before your legs are extended?",o:YN({drive_short:2,patience:2}),how:"Video: do your feet leave the floor before full extension?"},
 j_feetlate:{t:"Do your feet land after the bar reaches the top?",o:YN({foot_speed:2}),how:"Do you only hear the landing once the arms are already pressing?"},
 j_supportweak:{t:"Is the bar unstable even in a jerk support or overhead hold?",o:YN({overhead_jerk:3}),how:"Hold 100 % of your jerk overhead from the rack for 5 s."},
 j_lowheight:{t:"Does the bar get too little height from the drive?",o:YN({drive_short:2}),how:"Do a push press. How high does the bar go before the arms extend?"},
 j_slowdip:{t:"Is the turnaround in the dip soft or slow?",o:YN({dip_elastic:3}),how:"Does the dip feel like sinking rather than rebounding?"},
 j_trunksoft:{t:"Does your trunk give way in the dip (chest sinks)?",o:YN({dip_posture:3}),how:"Take a deep breath and brace before the dip. Does anything change?"},
 j_kneesin:{t:"Do your knees cave in or travel far forward in the dip?",o:YN({dip_balance:2}),how:"Video from the front and from the side."},
 j_legsok:{t:"Do your legs drive well, but your feet start too early?",o:YN({patience:2}),how:"Do a press into jerk. Does the waiting feel unfamiliar?"},
 j_aftercleanq:{t:"Is your jerk from the rack clearly better than after the clean?",o:YN({cj_fatigue:3}),how:"Compare a jerk from the rack and a clean & jerk with the same weight."},
 j_backleg:{t:"Is your back leg locked straight or too far back?",o:YN({split_position:2}),how:"The back knee should be slightly bent, heel up."},
 j_frontshort:{t:"Is your front step too short (shin not vertical)?",o:YN({split_position:2}),how:"Side-view video. Is the front shin roughly vertical?"},
 j_line:{t:"Do your feet land in line, like on a tightrope?",o:YN({split_position:2}),how:"The feet should land about hip-width apart."},
 j_oneleg:{t:"Is one leg clearly weaker?",o:YN({split_strength:2}),how:"Compare split squats with the same load on both sides."},
 j_frontload:{t:"Is most of your weight on the front leg in the split?",o:YN({split_position:2,chest_dive:2}),how:"Hold the split for 3 s. Can you briefly unload the front leg?"},
 j_hipsback:{t:"Do your hips stay behind the bar in the split?",o:YN({chest_dive:3,bar_path_forward:1}),how:"Video: are ear, shoulder, hip and bar stacked?"},
 j_tallslow:{t:"Does a light tall jerk feel slow?",o:YN({foot_speed:2}),how:"Do 3 tall jerks with an empty bar."},
 j_recover:{t:"Does the bar drift when you recover from the split?",o:YN({recovery:3,overhead_jerk:1}),how:"Front foot back first, then the back foot."},
 j_rackpain:{t:"Is the rack position uncomfortable or does it load your wrists?",o:YN({rack_jerk:3}),how:"With an empty bar: does the bar sit on the shoulders with only loose hands?"},
 j_breath:{t:"Are you out of breath or do you lose tension after the clean?",o:YN({cj_fatigue:1,dip_posture:1}),how:"Take a deliberate breath after the clean and brace again."}
};

/* Fault patterns per lift. b = base weight per cause, q = questions. */
const PULL_FAULTS = [
 {id:"jump_fwd",ph:"Catch",t:"I jump forward",b:{heels_early:1,bar_away:1},q:["q_footpress","q_baraway","q_hipsfirst","q_hipbang"]},
 {id:"jump_back",ph:"Catch",t:"I jump backward",b:{lean_back:1},q:["q_jumpdist","q_leanback","q_heels1","q_hipthrough","q_earlyarms"]},
 {id:"bar_fwd",ph:"Catch",t:"I lose the bar forward",b:{bar_away:1},lift:"sn",q:["q_baraway","q_hipbang","q_soft","q_trunkfwd","q_footpress"]},
 {id:"bar_back",ph:"Catch",t:"The bar falls behind me",b:{overhead_stab:1},lift:"sn",q:["q_leanback","q_ohdrift","q_headfwd","q_earlyarms"]},
 {id:"hips_first",ph:"First pull",t:"My hips rise first off the floor",b:{pull_posture:1},q:["q_startunstable","q_roundback","q_fsratio","q_fastfloor"]},
 {id:"bar_loop",ph:"Second pull",t:"The bar moves away from my body",b:{bar_away:1},q:["q_barwhere","q_lats","q_hipbang"]},
 {id:"early_finish",ph:"Second pull",t:"I stand up too early",b:{stay_over:1},q:["q_overknee","q_backweak","q_kneesfwd"]},
 {id:"incomplete",ph:"Second pull",t:"Incomplete extension, bar too low",b:{legs_quit:1},q:["q_legsquit","q_rush","q_pullratio","q_jumps"]},
 {id:"early_arms",ph:"Second pull",t:"I pull with my arms too early",b:{early_arms:2},q:["q_earlyarms","q_armspull","q_tightarms"]},
 {id:"slow_under",ph:"Third pull",t:"I'm slow getting under the bar",b:{slow_turnover:1},q:["q_wait","q_connection","q_fear","q_musclebad"]},
 {id:"catch_high",ph:"Third pull",t:"I catch high, then slide down",b:{receive_conf:1},q:["q_catchhigh","q_fear","q_stance"]},
 {id:"pressout",ph:"Catch",t:"Press-out, soft elbows",b:{overhead_stab:1},lift:"sn",q:["q_armslate","q_ohswobble","q_mob","q_wrists"]},
 {id:"crash",ph:"Catch",t:"The bar crashes on my shoulders",b:{clean_rack:1},lift:"cl",q:["q_elbowslate","q_dropbar","q_rackmob"]},
 {id:"collapse",ph:"Catch",t:"Elbows hit the knees, trunk collapses",b:{trunk_receive:1},lift:"cl",q:["q_elbowsdrop","q_fschest","q_rackmob"]},
 {id:"feet",ph:"Catch",t:"My feet land uneven or too wide",b:{footwork:2},q:["q_stance","q_feethigh"]},
 {id:"recover",ph:"Recovery",t:"I can't stand up from the squat",b:{squat_strength:1},lift:"sn",q:["q_chestfall","q_squatweak","q_ohrecover","q_mob"]},
 {id:"recover_cl",ph:"Recovery",t:"I can't stand up from the squat",b:{squat_strength:1},lift:"cl",q:["q_chestfall","q_squatweak","q_elbowsdrop","q_mob"]}
];
const JERK_FAULTS = [
 {id:"j_rack",ph:"Rack",t:"The rack position is uncomfortable",b:{rack_jerk:1},q:["j_rackpain","j_rack"]},
 {id:"j_dip",ph:"Dip",t:"My dip is unsteady or tips",b:{dip_balance:1},q:["j_dipfwd","j_kneesin","j_slowdip","j_trunksoft"]},
 {id:"j_drive",ph:"Drive",t:"The bar doesn't get enough height",b:{drive_short:1},q:["j_lowheight","j_legsok","j_aftercleanq"]},
 {id:"j_fwd",ph:"Drive",t:"The bar goes forward",b:{bar_path_forward:1},q:["j_dipfwd","j_head","j_chest","j_rack"]},
 {id:"j_pressout",ph:"Under the bar",t:"Press-out",b:{drive_short:1,foot_speed:1},q:["j_earlyunder","j_feetlate","j_supportweak","j_lowheight"]},
 {id:"j_slowfeet",ph:"Under the bar",t:"My feet are too slow",b:{foot_speed:1},q:["j_tallslow","j_legsok"]},
 {id:"j_split",ph:"Split",t:"My split is too short, too long or narrow",b:{split_position:1},q:["j_backleg","j_frontshort","j_line","j_oneleg"]},
 {id:"j_frontleg",ph:"Split",t:"My front leg is overloaded",b:{split_position:1,chest_dive:1},q:["j_frontload","j_hipsback","j_oneleg"]},
 {id:"j_dive",ph:"Split",t:"My chest dives forward",b:{chest_dive:1},q:["j_hipsback","j_chest","j_head"]},
 {id:"j_recover",ph:"Recovery",t:"I wobble when I recover",b:{recovery:1},q:["j_recover","j_oneleg","j_supportweak"]},
 {id:"j_afterclean",ph:"Recovery",t:"My jerk fails after a heavy clean",b:{cj_fatigue:1},q:["j_aftercleanq","j_breath","j_trunksoft"]}
];
const LIFTS = {
 sn:{t:"Snatch",s:"Bar to overhead in one move",faults:PULL_FAULTS.filter(f=>!f.lift||f.lift==="sn")},
 cl:{t:"Clean",s:"Bar to the shoulders",faults:PULL_FAULTS.filter(f=>!f.lift||f.lift==="cl")},
 jk:{t:"Jerk",s:"From the shoulders overhead",faults:JERK_FAULTS}
};
const PHASES = {sn:["First pull","Second pull","Third pull","Catch","Recovery"],cl:["First pull","Second pull","Third pull","Catch","Recovery"],jk:["Rack","Dip","Drive","Under the bar","Split","Recovery"]};

/* Coaching cues: one short thought to take into the next lift. */
const CUES = {
 pull_balance:"Push through the whole foot. Keep the bar over mid-foot.",
 pull_posture:"Push the floor away. Chest and hips rise together.",
 stay_over:"Shoulders over the bar until mid-thigh.",
 bar_away:"Push the bar back into your legs.",
 hip_bang:"Drive with the legs and let the bar brush the hips. Don't hit it.",
 legs_quit:"Finish the push with your legs before you pull under.",
 heels_early:"Stay flat-footed until the bar is high on the thighs.",
 lean_back:"Push up, not back. Then pull yourself down.",
 early_arms:"Long, loose arms until the legs are done.",
 transition_timing:"Keep pushing the floor as you start pulling under.",
 slow_turnover:"Snap under. Go to the bar, don't wait for it.",
 meet_bar:"Pull yourself down against the bar the whole way.",
 clean_rack:"Fast elbows. Bring the bar to your shoulders, don't let it drop there.",
 overhead_stab:"Push up into the bar and squeeze your shoulder blades.",
 receive_conf:"Commit to the bottom. Sit and catch.",
 mobility:"Chest up, knees out, sit between your heels.",
 footwork:"Quick and flat. Same landing spot every time.",
 squat_strength:"Drive straight up out of the bottom. No pause.",
 trunk_receive:"Big breath, tight trunk, chest up as you stand.",
 rfd:"Patient off the floor, violent at the finish.",
 pull_strength:"Same positions as the lift, just heavier.",
 scoop:"Let the knees come back under the bar. Don't force it.",
 dip_balance:"Dip straight down, weight on mid-foot and heels.",
 dip_posture:"Brace before the dip. Keep the bar on your shoulders.",
 drive_short:"Drive until your legs are straight, then punch under.",
 bar_path_forward:"Head back, bar straight up.",
 patience:"Finish the drive before your feet move.",
 split_position:"Front shin vertical, back knee slightly bent.",
 chest_dive:"Hips under the bar, chest tall.",
 foot_speed:"Fast, flat feet. Land with both at the same time.",
 overhead_jerk:"Lock your elbows and push up into the bar.",
 dip_elastic:"Short, quick dip. Bounce out of the bottom.",
 rack_jerk:"Bar on the shoulders, hands loose.",
 split_strength:"Even weight on both feet in the split.",
 recovery:"Front foot back first, then the back foot.",
 cj_fatigue:"Breathe, re-brace, then jerk."
};
Object.entries(CUES).forEach(([k,v])=>{ if(CAUSES[k]) CAUSES[k].cue=v; });

/* ---------- Languages ----------
   Translations: I18N[lang].cat = {sec, ph, lifts, notes:{firstId:text}, causes:{id:[t,why,test,cue]}, q:{id:[t,how,[options]]}, faults:{id:text}}.
   Missing entries fall back to English. Lift and exercise names stay English in every language. */
const EN_CAT = {
  sec: {...SEC}, notes: NOTE_GROUPS.map(g=>g[1]),
  causes: Object.fromEntries(Object.entries(CAUSES).map(([k,c])=>[k,[c.t,c.why,c.test,c.cue]])),
  q: Object.fromEntries(Object.entries(Q).map(([k,v])=>[k,[v.t,v.how,v.o.map(o=>o[0])]])),
  faults: Object.fromEntries([...PULL_FAULTS,...JERK_FAULTS].map(f=>[f.lift?f.id+"@"+f.lift:f.id,f.t])),
  lifts: Object.fromEntries(Object.entries(LIFTS).map(([k,v])=>[k,v.s]))
};
const catLang = () => I18N[LANG].cat || {};
const phName = ph => catLang().ph?.[ph] || ph;
function applyCatalogLang(){
  const C = catLang(), ui = I18N[LANG].ui;
  Object.keys(SEC).forEach(k=>{ SEC[k] = C.sec?.[k] || EN_CAT.sec[k]; });
  NOTE_GROUPS.forEach(([ids],i)=>{ const tx = C.notes?.[ids.find(Boolean)] || EN_CAT.notes[i]; ids.forEach(x=>{ if(x) NOTE[x]=tx; }); });
  Object.entries(CAUSES).forEach(([k,c])=>{ const e=EN_CAT.causes[k], d=C.causes?.[k]||[]; [c.t,c.why,c.test,c.cue] = e.map((x,j)=>d[j]||x); });
  Object.entries(Q).forEach(([k,v])=>{ const e=EN_CAT.q[k], d=C.q?.[k]||[];
    v.t = d[0]||e[0]; v.how = d[1]||e[1];
    v.o.forEach((o,j)=>{ o[0] = d[2]?.[j] || ui["opt."+e[2][j]] || e[2][j]; }); });
  [...PULL_FAULTS,...JERK_FAULTS].forEach(f=>{ const k=f.lift?f.id+"@"+f.lift:f.id; f.t = C.faults?.[f.id] || EN_CAT.faults[k]; });
  Object.entries(LIFTS).forEach(([k,v])=>{ v.s = C.lifts?.[k] || EN_CAT.lifts[k]; });
}
applyCatalogLang();
