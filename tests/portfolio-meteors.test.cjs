const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(reduced=false){
  const timers=new Map(), frames=new Map(), events={}, classes=new Set(); let id=0;
  const gradient={addColorStop(){}};
  const ctx=new Proxy({}, {get:(_,key)=>key.startsWith('create')?()=>gradient:()=>{},set:()=>true});
  const canvas={dataset:{},getContext:()=>ctx};
  const document={hidden:false,body:{classList:{contains:c=>classes.has(c)}},getElementById:key=>key==='portfolio-meteors'?canvas:null,addEventListener:(key,fn)=>events[key]=fn};
  const window={addEventListener:(key,fn)=>events[key]=fn};
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/portfolio-meteors.js'),'utf8'),{
    document,window,matchMedia:()=>({matches:reduced,addEventListener(){}}),innerWidth:390,innerHeight:844,devicePixelRatio:2,performance:{now:()=>0},Math,
    setTimeout:(fn,delay)=>{timers.set(++id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id),
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)
  });
  function run(delay){const entry=[...timers].find(([,t])=>t.delay===delay);assert.ok(entry);timers.delete(entry[0]);entry[1].fn();}
  function tick(now){const pending=[...frames];frames.clear();pending.forEach(([,fn])=>fn(now));}
  return {timers,frames,events,document,classes,canvas,run,tick};
}
test('comet and star shower share one frame loop and settle to idle',()=>{
 const s=setup();s.events.portfolioReady();s.run(900);s.run(2400);assert.equal(s.frames.size,1);
 s.tick(1300);assert.equal(s.canvas.dataset.starCount,'14');assert.equal(s.frames.size,1);
 s.tick(6000);assert.equal(s.frames.size,0);assert.equal(s.canvas.dataset.starCount,'0');
});
test('hidden page and photo viewer cancel both effects and their schedules',()=>{
 const s=setup();s.events.portfolioReady();s.run(2400);s.document.hidden=true;s.events.visibilitychange();
 assert.equal(s.frames.size,0);assert.equal(s.timers.size,0);
 s.document.hidden=false;s.events.visibilitychange();assert.equal(s.timers.size,2);
 s.classes.add('photo-viewer-open');s.events.photoViewerChange();assert.equal(s.timers.size,0);
});
test('reduced motion never schedules background effects',()=>{
 const s=setup(true);s.events.portfolioReady();assert.equal(s.timers.size,0);assert.equal(s.frames.size,0);
});
