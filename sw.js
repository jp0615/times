const CACHE='times-v14',VCACHE='times-voice-v7';
const FILES=['./','./index.html','./digits.bin','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./voice/silence.mp3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==VCACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(u.pathname.endsWith('.cfg'))return; /* 設定檔一律走網路 */
  const voice=u.pathname.indexOf('/voice/')>=0&&!u.pathname.endsWith('silence.mp3');
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
    /* 聲音檔由 App 自己存到 times-voice 快取，這裡不重複存 */
    if(res&&res.ok&&!voice){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return res;
  }).catch(()=>voice?Response.error():caches.match('./index.html'))));
});
