const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function element(){
 const classes=new Set(),events={},attrs={};
 return {events,attrs,style:{setProperty(){},removeProperty(){}},offsetWidth:60,scrollWidth:700,textContent:'',
 classList:{add:(...v)=>v.forEach(x=>classes.add(x)),remove:(...v)=>v.forEach(x=>classes.delete(x)),contains:x=>classes.has(x),toggle(x,on){if(on===undefined)on=!classes.has(x);on?classes.add(x):classes.delete(x);return on;}},
 setAttribute:(k,v)=>attrs[k]=v,removeAttribute:k=>delete attrs[k],getAttribute:k=>attrs[k],
 addEventListener:(k,fn)=>events[k]=fn,focus(){this.focused=true;},matches:()=>false,querySelector:()=>null,contains:()=>false};
}
function setup(isMobile=false){
 const nav=element(), links=element(), logo=element(), toggle=element(), trigger=element(), title=element(), ring=element(), item=element();
 item.textContent='Projects';item.attrs.href='#projects';
 const children={'.nav-links':links,'.nav-logo':logo,'.nav-mobile-toggle':toggle,'.nav-island-trigger':trigger,'.nav-island-title':title,'.nav-progress-fill':ring};
 nav.querySelector=s=>children[s];nav.querySelectorAll=()=>[item];
 const window=element(),document=element(),mobile=element(),fine=element();mobile.matches=isMobile;fine.matches=!isMobile;
 const timers=new Map();let next=0;
 const context={window,document,scrollY:0,innerHeight:800,matchMedia:q=>q.includes('900px')?mobile:fine,
 setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>{context.frame=fn;return 1;}};
 const hero={id:'hero',getBoundingClientRect:()=>({top:-context.scrollY}),querySelector:()=>null};
 const projects={id:'projects',getBoundingClientRect:()=>({top:1000-context.scrollY}),querySelector:()=>null};
 document.getElementById=()=>nav;document.querySelectorAll=()=>[hero,projects];document.documentElement={scrollHeight:10800};document.fonts={ready:Promise.resolve()};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/portfolio-navigation.js'),'utf8'),context);
 function scroll(y){context.scrollY=y;window.events.scroll();context.frame();}
 return {nav,links,logo,toggle,trigger,title,ring,item,scroll,mobile};
}
test('scroll down shows section and progress; scroll up restores links',()=>{
 const s=setup();s.scroll(2000);assert.ok(s.nav.classList.contains('collapsed'));assert.equal(s.title.textContent,'Projects');assert.equal(s.ring.style.strokeDashoffset,'80');assert.equal(s.links.inert,true);
 s.scroll(1950);assert.equal(s.nav.classList.contains('collapsed'),false);assert.equal(s.links.inert,false);assert.equal(s.item.attrs['aria-current'],'location');
});
test('mouse hover shows menu mode without expanding, click opens accessible links',()=>{
 const s=setup();s.scroll(2000);s.nav.events.pointerenter({pointerType:'mouse'});assert.ok(s.nav.classList.contains('island-hover'));assert.ok(s.nav.classList.contains('collapsed'));
 s.nav.events.pointerleave();assert.equal(s.nav.classList.contains('island-hover'),false);
 s.trigger.events.click();assert.equal(s.links.inert,false);assert.ok(s.item.focused);
 s.nav.events.keydown({key:'Escape',preventDefault(){}});assert.equal(s.links.inert,true);assert.ok(s.trigger.focused);
});
test('mobile scroll up shows closed bar; only tapping opens sections',()=>{
 const s=setup(true);s.scroll(2000);s.trigger.events.click();assert.ok(s.nav.classList.contains('mobile-open'));assert.equal(s.toggle.attrs['aria-expanded'],'true');
 s.nav.events.click({target:{closest:()=>s.item}});assert.equal(s.links.inert,true);
 s.scroll(1900);assert.equal(s.nav.classList.contains('collapsed'),false);assert.equal(s.nav.classList.contains('mobile-open'),false);assert.equal(s.links.inert,true);assert.equal(s.toggle.attrs['aria-expanded'],'false');
 s.toggle.events.click();assert.ok(s.nav.classList.contains('mobile-open'));assert.equal(s.links.inert,false);
});

test('hero island consistently uses Intro',()=>{
 const s=setup();assert.equal(s.title.textContent,'Intro');s.scroll(500);
 assert.equal(s.title.textContent,'Intro');assert.match(s.trigger.attrs['aria-label'],/^Intro,/);
});
