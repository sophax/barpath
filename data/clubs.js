/* Clubs of the Swiss Weightlifting Federation (swiss-weightlifting.ch/contact, as of October 2026).
   Contact addresses as published there. City and coordinates: town of the club or its gym.
   web: only where the club's own page was checked. logo: from the club's own website (October 2026), dark: light logo on a dark tile. */
const CLUBS = [
 {n:"Association Neuchâtel Force", city:"Neuchâtel", ct:"NE", lat:46.990, lon:6.931, mail:"neuchatelforce@gmail.com"},
 {n:"Club Haltérophile Neuchâtel", city:"Neuchâtel", ct:"NE", lat:46.990, lon:6.931, mail:"zyad.haddad1@gmail.com"},
 {n:"B.O.G Barbell Club Landeron", city:"Le Landeron", ct:"NE", lat:47.057, lon:7.070, mail:"bog.barbellclub@gmail.com"},
 {n:"Club Haltérophile La Chaux-de-Fonds", city:"La Chaux-de-Fonds", ct:"NE", lat:47.100, lon:6.826, mail:"noemie1311@gmail.com"},
 {n:"Athletik-Sport Rorschach", city:"Rorschach", ct:"SG", lat:47.478, lon:9.490, mail:"info@asrorschach.ch", logo:"icons/clubs/asr-240.jpg"},
 {n:"Barbell Club Bienne Seeland", city:"Biel/Bienne", ct:"BE", lat:47.137, lon:7.247, mail:"info@barbellclub-bienneseeland.ch", logo:"icons/clubs/bcbs-240.png"},
 {n:"Haltéro-Club Tramelan", city:"Tramelan", ct:"BE", lat:47.223, lon:7.103, mail:"president.halteroclubtramelan@gmail.com"},
 {n:"Société d'Haltérophilie Prévôtoise", city:"Moutier", ct:"BE", lat:47.279, lon:7.369, mail:"cyril.gosteli@gmail.com"},
 {n:"Schwerathletik Club Bern", city:"Bern", ct:"BE", lat:46.948, lon:7.447, mail:"info@gewichthebenbern.ch", logo:"icons/clubs/scb.svg", dark:true},
 {n:"PB Weightlifting Club", city:"Bern", ct:"BE", lat:46.948, lon:7.447, mail:"pbweightlifting@tst-fitness.ch", web:"https://www.tst-fitness.ch"},
 {n:"CLHM Lausanne", city:"Lausanne", ct:"VD", lat:46.520, lon:6.633, mail:"info@clhm.ch", logo:"icons/clubs/clhm-240.jpg"},
 {n:"CHC Lignon", city:"Vernier (Le Lignon)", ct:"GE", lat:46.207, lon:6.093, mail:"chc.lignon@gmail.com"},
 {n:"PTL Weightlifting", city:"Grand-Lancy", ct:"GE", lat:46.178, lon:6.123, mail:"ptlweightlifting@gmail.com", web:"https://ptlgeneva.ch"},
 {n:"Weightlifting Club 1700", city:"Fribourg", ct:"FR", lat:46.806, lon:7.162, mail:"weightliftingclub1700@gmail.com"},
 {n:"Crossfit Basel", city:"Basel", ct:"BS", lat:47.559, lon:7.588, mail:"rg@crossfitbasel.ch"},
 {n:"Weightlifting Northwest", city:"Reinach BL", ct:"BL", lat:47.493, lon:7.591, mail:"t.schwander@hispeed.ch", web:"https://cftodoma.ch"},
 {n:"GHC Grenchen", city:"Grenchen", ct:"SO", lat:47.192, lon:7.396, mail:"eliano.morandi@besonet.ch"},
 {n:"Weightlifting Solothurn", city:"Solothurn", ct:"SO", lat:47.208, lon:7.537, mail:"christof.kellenberger@gmx.ch"},
 {n:"Gewichtheber Klub der Sportfreunde", city:"Zürich-Altstetten", ct:"ZH", lat:47.389, lon:8.488, mail:"gewichtheben@klubdersportfreunde.ch", web:"https://www.klubdersportfreunde.ch", logo:"icons/clubs/kds.svg"},
 {n:"United Lifters Zürich", city:"Zürich", ct:"ZH", lat:47.377, lon:8.540, mail:"info@crossfitzuerich.ch"},
 {n:"Vereinigung der Zürcher Gewichtheber", city:"Zürich", ct:"ZH", lat:47.377, lon:8.540, mail:"lukas.stirnemann@gmail.com"},
 {n:"Gewichtheber*innen Luzern", city:"Luzern", ct:"LU", lat:47.050, lon:8.309, mail:"gwechthebelozaern@gmail.com"},
 {n:"Gewichtheberclub Schwyz", city:"Schwyz", ct:"SZ", lat:47.021, lon:8.654, mail:"ghc-schwyz@gmx.ch"},
 {n:"Società Atletica VIS NOVA", city:"Lugano", ct:"TI", lat:46.004, lon:8.951, mail:"teresita.bramante@gmail.com"}
];

/* Switzerland, simplified outline (lon, lat), clockwise from Geneva. Drawn by hand for the map, not for measuring. */
const CH_OUTLINE = [
 [5.956,46.132],[6.040,46.140],[6.120,46.140],[6.190,46.170],[6.250,46.215],[6.300,46.255],[6.240,46.305],
 [6.400,46.395],[6.600,46.430],[6.800,46.390],[6.790,46.300],[6.840,46.250],[6.870,46.150],[6.970,46.030],[7.040,45.925],
 [7.170,45.865],[7.380,45.900],[7.550,45.980],[7.660,45.975],[7.870,45.925],[7.990,46.000],[8.100,46.080],[8.150,46.180],
 [8.080,46.260],[8.300,46.400],[8.470,46.420],[8.450,46.300],[8.600,46.150],[8.710,46.100],[8.760,46.090],[8.850,46.070],
 [8.860,45.970],[8.920,45.930],[9.020,45.820],[9.080,45.880],[9.040,45.950],[9.080,46.030],[9.160,46.170],[9.250,46.270],
 [9.290,46.450],[9.330,46.500],[9.450,46.490],[9.510,46.330],[9.650,46.300],[9.900,46.370],[10.140,46.230],[10.180,46.380],
 [10.050,46.550],[10.250,46.620],[10.470,46.550],[10.490,46.700],[10.470,46.860],[10.380,46.990],[10.100,46.850],[9.880,46.930],
 [9.600,47.050],[9.500,47.060],[9.530,47.270],[9.620,47.460],[9.580,47.500],[9.400,47.570],[9.170,47.650],[8.860,47.660],
 [8.800,47.720],[8.720,47.780],[8.620,47.810],[8.450,47.750],[8.410,47.700],[8.520,47.590],[8.420,47.570],[8.230,47.605],
 [7.790,47.560],[7.620,47.590],[7.560,47.580],[7.500,47.520],[7.330,47.440],[7.130,47.495],[7.000,47.500],[6.860,47.370],
 [6.940,47.240],[6.850,47.160],[6.700,47.070],[6.480,46.970],[6.450,46.910],[6.100,46.570],[6.130,46.600],[6.060,46.410],
 [6.130,46.360],[5.970,46.220]
];

/* Large lakes for orientation (lon, lat), simplified */
const CH_LAKES = [
 [[6.150,46.210],[6.240,46.380],[6.340,46.460],[6.500,46.510],[6.630,46.512],[6.840,46.462],[6.930,46.400],[6.800,46.390],[6.600,46.430],[6.400,46.395],[6.240,46.305]],
 [[6.640,46.780],[6.760,46.880],[6.880,46.960],[6.980,47.010],[6.950,46.960],[6.820,46.860],[6.680,46.770]],
 [[8.545,47.360],[8.620,47.300],[8.720,47.240],[8.830,47.225],[8.800,47.210],[8.680,47.235],[8.580,47.290],[8.530,47.345]],
 [[8.310,47.050],[8.420,47.020],[8.470,46.990],[8.600,46.990],[8.610,46.930],[8.560,46.960],[8.470,46.970],[8.380,46.990],[8.300,47.030]]
];
