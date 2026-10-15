// Exercise the production inline player with controlled mobile lifecycle/audio events.
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const source = html.slice(html.indexOf('// ===== MUSIC PLAYER ====='), html.indexOf('// ===== END MUSIC PLAYER ====='));
assert(source.length > 1000);
class Target {
    constructor() {
        this.listeners = {}; this.style = {}; this.value = 70; this.attributes = {};
        this.classes = new Set(); this.classList = {
            add: name => this.classes.add(name), remove: name => this.classes.delete(name),
            toggle: (name, on) => on ? this.classes.add(name) : this.classes.delete(name)
        };
        this.paused = true; this.calls = 0;
    }
    addEventListener(type, fn) { (this.listeners[type] ??= new Set()).add(fn); }
    removeEventListener(type, fn) { this.listeners[type]?.delete(fn); }
    fire(type, event = {}) { for (const fn of [...(this.listeners[type] ?? [])]) fn({ type, target: this, ...event }); }
    contains(target) { return target === this; }
    setAttribute(name, value) { this.attributes[name] = value; }
    focus() {}
    play() {
        this.calls++;
        if (this.fail) { this.fail = false; return Promise.reject(Error('NotAllowedError')); }
        this.paused = false;
        return this.deferred ?? Promise.resolve();
    }
    pause() { this.paused = true; this.fire('pause'); }
}
function setup(protocol = 'https:') {
    const elements = new Map(), doc = new Target(), win = new Target(); let context;
    doc.hidden = false;
    doc.getElementById = id => {
        if (!elements.has(id)) elements.set(id, new Target());
        return elements.get(id);
    };
    win.loaderIsComplete = true; win.matchMedia = () => ({ matches: false });
    win.dismissLanding = () => { win.dismissals = (win.dismissals ?? 0) + 1; };
    win.AudioContext = class extends Target {
        constructor() { super(); context = this; this.state = 'suspended'; this.currentTime = 0; this.resumes = 0; }
        createMediaElementSource() { return { connect() {} }; }
        createGain() { return { connect() {}, gain: {
            cancelScheduledValues() {}, setValueAtTime: value => { this.gain = value; }
        } }; }
        resume() {
            this.resumes++;
            if (this.block) return Promise.reject(Error('blocked context'));
            this.state = 'running'; this.fire('statechange'); return Promise.resolve();
        }
    };
    vm.runInNewContext(source, { document: doc, window: win, location: { protocol },
        console: { log() {}, warn() {} }, Promise, Math });
    return { doc, win, e: id => doc.getElementById(id), context: () => context };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
const launch = async t => { t.doc.fire('touchend'); await flush(); };
const spinning = t => t.e('album-art').classes.has('spinning');

test('launch uses tap release and retries a rejected first attempt', async () => {
    const t = setup(); t.doc.fire('touchstart'); assert.equal(t.e('audio-player').calls, 0);
    t.e('audio-player').fail = true; await launch(t);
    assert.equal(t.doc.listeners.click.size, 1);
    t.doc.fire('click'); await flush(); assert.equal(t.win.dismissals, 1);
    assert.equal(t.doc.listeners.click.size, 0); assert(spinning(t));
    assert(t.e('audio-player').src.includes('1.02%20Opening.mp3'));
});
test('background silences immediately; foreground resumes same track and position', async () => {
    const t = setup(); await launch(t); const audio = t.e('audio-player'), src = audio.src;
    audio.currentTime = 12; t.doc.hidden = true; t.doc.fire('visibilitychange');
    assert(audio.paused); assert(audio.muted); assert.equal(t.context().gain, 0); assert(!spinning(t));
    t.context().state = 'interrupted'; t.doc.hidden = false; t.doc.fire('visibilitychange');
    t.win.fire('focus'); await flush();
    assert.equal(audio.calls, 2); assert(!audio.paused); assert(!audio.muted);
    assert.equal(audio.src, src); assert.equal(audio.currentTime, 12); assert(spinning(t));
});
test('manual pause remains paused on focus, pageshow, transition end, and track changes', async () => {
    const t = setup(); await launch(t); t.e('play-pause-btn').fire('click');
    t.doc.hidden = true; t.doc.fire('visibilitychange');
    t.doc.hidden = false; t.doc.fire('visibilitychange');
    for (const event of ['focus', 'pageshow', 'portfolioReady']) t.win.fire(event);
    t.e('next-btn').fire('click'); await flush();
    assert(t.e('audio-player').paused); assert(t.e('audio-player').muted);
    assert.equal(t.e('audio-player').calls, 1); assert(!spinning(t));
});
test('pause cancels pending play, including late playing events', async () => {
    const t = setup(); let complete;
    t.e('audio-player').deferred = new Promise(resolve => { complete = resolve; });
    t.doc.fire('touchend'); t.e('play-pause-btn').fire('click');
    assert(t.e('audio-player').muted); assert.equal(t.context().gain, 0);
    complete(); await flush(); t.e('audio-player').paused = false; t.e('audio-player').fire('playing');
    assert(t.e('audio-player').paused); assert(!spinning(t));
});
test('stale rejected play cannot stop a newer successful play', async () => {
    const t = setup(); let reject;
    t.e('audio-player').deferred = new Promise((_, fail) => { reject = fail; });
    t.doc.fire('touchend'); t.e('play-pause-btn').fire('click');
    t.e('audio-player').deferred = null; t.e('play-pause-btn').fire('click'); await flush();
    reject(Error('old interrupted play')); await flush();
    assert(!t.e('audio-player').paused); assert(spinning(t));
});
test('blocked foreground resume displays play and a single tap retries', async () => {
    const t = setup(); await launch(t);
    t.doc.hidden = true; t.doc.fire('visibilitychange');
    t.context().state = 'interrupted'; t.context().block = true;
    t.doc.hidden = false; t.doc.fire('visibilitychange'); await flush();
    assert(!spinning(t)); assert.equal(t.e('play-pause-btn').attributes['aria-label'], 'Play music');
    t.context().block = false; t.e('play-pause-btn').fire('click'); await flush(); assert(spinning(t));
});
test('media and audio-context interruptions update UI immediately', async () => {
    const t = setup(); await launch(t);
    t.context().state = 'interrupted'; t.context().fire('statechange'); assert(!spinning(t));
    assert.equal(t.e('play-pause-btn').attributes['aria-label'], 'Play music');
    t.e('play-pause-btn').fire('click'); await flush(); assert(spinning(t));
    t.e('audio-player').fire('waiting'); assert(!spinning(t));
    t.e('audio-player').fire('playing'); assert(spinning(t));
    t.e('audio-player').pause(); assert(!spinning(t));
});
test('native file playback and loader gate remain supported', async () => {
    const t = setup('file:'); t.win.loaderIsComplete = false; await launch(t);
    assert.equal(t.e('audio-player').calls, 0); t.win.loaderIsComplete = true; await launch(t);
    assert.equal(t.context(), undefined); assert(spinning(t));
});
