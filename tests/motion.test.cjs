const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { transformSync } = require('esbuild');
const code = transformSync(readFileSync(resolve(__dirname, '../src/motion.ts'), 'utf8')
  .replace(/^import .*;\r?\n/gm, ''), { loader: 'ts', format: 'iife' }).code;
function target() {
  const events = new Map(), classes = new Set();
  return {
    style: {}, classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) },
    addEventListener: (type, fn) => { if (!events.has(type)) events.set(type, new Set()); events.get(type).add(fn); },
    removeEventListener: (type, fn) => events.get(type)?.delete(fn),
    fire: (type, event) => events.get(type)?.forEach(fn => fn(event))
  };
}
function setup({ desktop = true, reduced = false, missingGSAP = false } = {}) {
  const window = target(), document = target(); let cleanup, observe;
  document.body = target(); document.documentElement = target(); document.querySelectorAll = () => [];
  const instances = [], ticks = new Set();
  class Lenis {
    constructor(options) { this.options = options; instances.push(this); }
    on() {} raf() {} stop() { this.isStopped = true; } start() { this.isStopped = false; }
    destroy() { this.destroyed = true; }
  }
  window.gsap = missingGSAP ? null : {
    matchMedia: () => ({ add: (_, callback) => { cleanup = callback({ conditions: { desktop, reduced } }); } }),
    ticker: { add: fn => ticks.add(fn), remove: fn => ticks.delete(fn), lagSmoothing() {} },
    killTweensOf() {}, set() {}
  };
  window.ScrollTrigger = { update() {}, refresh() {}, batch() {} };
  class MutationObserver { constructor(callback) { observe = callback; } observe() {} disconnect() {} }
  vm.runInNewContext(code, { Lenis, window, document, MutationObserver });
  return { window, document, instances, ticks, changed: () => observe(), cleanup: () => cleanup() };
}
test('Lenis starts after launch, suspends for modal lock, and resumes after close', () => {
  const t = setup(); assert.equal(t.instances.length, 0);
  t.window.fire('portfolioReady'); const lenis = t.instances[0];
  assert.equal(lenis.isStopped, false); assert.equal(t.ticks.size, 1);
  t.document.body.style.overflow = 'hidden'; t.changed(); assert.equal(lenis.isStopped, true);
  t.document.body.style.overflow = ''; t.changed(); assert.equal(lenis.isStopped, false);
  assert.equal(lenis.options.syncTouch, false);
  assert.equal(lenis.options.prevent({ closest: () => ({}) }), true);
  t.cleanup(); assert.equal(lenis.destroyed, true); assert.equal(t.ticks.size, 0);
});
test('touch and reduced-motion visitors retain native scrolling', () => {
  for (const options of [{ desktop: false }, { reduced: true }]) {
    const t = setup(options); t.window.fire('portfolioReady');
    assert.equal(t.instances.length, 0); assert.equal(t.ticks.size, 0); t.cleanup();
  }
});
test('missing GSAP leaves content visible and scrolling native', () => {
  const t = setup({ missingGSAP: true }); t.window.fire('portfolioReady');
  assert.equal(t.instances.length, 0);
  assert.equal(t.document.documentElement.classList.contains('motion-ready'), false);
});
