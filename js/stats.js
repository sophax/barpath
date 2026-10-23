/* Nutzungszählung mit GoatCounter: zählt nur, welche Funktionen genutzt werden. Keine Cookies, keine Inhalte,
   kein Standort, kein Video. Die Zahlen sieht nur der Betreiber unter https://<GOATCOUNTER>.goatcounter.com.
   Ohne Code in GOATCOUNTER und lokal beim Entwickeln wird nichts gesendet. */
const GOATCOUNTER = "";
function count(path, event){
  if(!GOATCOUNTER || location.hostname==="localhost" || location.hostname==="127.0.0.1") return;
  const u="https://"+GOATCOUNTER+".goatcounter.com/count?p="+encodeURIComponent(path)+(event?"&e=true":"")+"&rnd="+Math.random().toString(36).slice(2);
  try{ if(!(navigator.sendBeacon && navigator.sendBeacon(u))) new Image().src=u; }catch(e){}
}
