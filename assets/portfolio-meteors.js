// Occasional atmospheric meteors, behind the content and independent of scrolling.
(() => {
    const canvas = document.getElementById('portfolio-meteors');
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!ctx) return;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, frame = 0, timer = 0, meteor = null, ready = false;
    const random = (min, max) => min + Math.random() * (max - min);
    const allowed = () => ready && !document.hidden && !reducedMotion.matches;

    function resize() {
        width = innerWidth;
        height = innerHeight;
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function schedule(delay = random(5000, 20000)) {
        clearTimeout(timer);
        if (allowed()) timer = setTimeout(launch, delay);
    }

    function launch() {
        if (!allowed()) return;
        const length = random(Math.min(115, width * .3), Math.min(300, width * .43));
        const distance = width + length + 64;
        const maxSlope = Math.min(.48, height * .58 / distance);
        const slope = random(.1, Math.max(.11, maxSlope)) * (Math.random() < .7 ? 1 : -1);
        const drift = slope * distance;
        const margin = height * .12;
        const startY = random(margin + Math.max(0, -drift), height - margin - Math.max(0, drift));
        meteor = {
            start: performance.now(), duration: random(1500, 5000), length, distance,
            y: startY, slope, angle: Math.atan(slope), radius: random(2.4, width < 600 ? 3.7 : 5.2),
            phase: random(0, Math.PI * 2), tint: Math.random() < .5 ? '34,211,238' : '69,224,180',
            sparks: Array.from({ length: 22 }, () => ({
                behind: random(.12, 1), offset: random(-1, 1), size: random(.45, 1.3), phase: random(0, 6.28)
            }))
        };
        frame = requestAnimationFrame(draw);
        // Start-to-start spacing, rather than adding flight time to the interval.
        schedule();
    }

    function ribbon(length, spread, alpha, tint, time, phase) {
        const bend = Math.sin(time * 2.2 + phase) * spread * .35;
        const gradient = ctx.createLinearGradient(-length, 0, 4, 0);
        gradient.addColorStop(0, `rgba(${tint},0)`);
        gradient.addColorStop(.3, `rgba(16,185,129,${alpha * .25})`);
        gradient.addColorStop(.74, `rgba(${tint},${alpha * .7})`);
        gradient.addColorStop(1, `rgba(187,246,244,${alpha})`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.bezierCurveTo(-length * .14, -spread, -length * .57, bend - spread * .5, -length, bend);
        ctx.bezierCurveTo(-length * .57, bend + spread * .5, -length * .14, spread, 4, 0);
        ctx.fill();
    }

    function draw(now) {
        frame = 0;
        ctx.clearRect(0, 0, width, height);
        if (!meteor || !allowed()) return;
        const m = meteor;
        const progress = (now - m.start) / m.duration;
        if (progress >= 1) { meteor = null; return; }
        const travel = progress * m.distance;
        const time = (now - m.start) / 1000;
        ctx.save();
        ctx.translate(-32 + travel, m.y + travel * m.slope);
        ctx.rotate(m.angle);
        ctx.globalAlpha = .82 * Math.min(1, progress * 16, (1 - progress) * 12);
        ctx.globalCompositeOperation = 'lighter';

        // Soft sheath, coloured wake, and fine bright spine, without a screen-wide flash.
        ribbon(m.length, m.radius * 4.4, .10, m.tint, time, m.phase);
        ribbon(m.length * .94, m.radius * 1.9, .29, m.tint, time, m.phase);
        ribbon(m.length * .76, m.radius * .52, .62, m.tint, time, m.phase);
        for (const spark of m.sparks) {
            const behind = (spark.behind + time * .23) % 1;
            const x = -behind * m.length;
            const y = spark.offset * m.radius * (1 + behind * 2.8) + Math.sin(time * 4 + spark.phase) * behind * 2;
            ctx.strokeStyle = `rgba(${m.tint},${(1 - behind) ** 2 * .42})`;
            ctx.lineWidth = spark.size;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3 - (1 - behind) * 7, y); ctx.stroke();
        }
        const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, m.radius * 5);
        halo.addColorStop(0, `rgba(190,249,241,.58)`);
        halo.addColorStop(.23, `rgba(${m.tint},.26)`);
        halo.addColorStop(1, `rgba(${m.tint},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(0, 0, m.radius * 5, 0, Math.PI * 2); ctx.fill();

        // An irregular, lit nucleus makes the head read as a small object, not a laser.
        ctx.globalCompositeOperation = 'source-over';
        const core = ctx.createLinearGradient(-m.radius, m.radius, m.radius, -m.radius);
        core.addColorStop(0, '#237779'); core.addColorStop(.6, '#83dbd5'); core.addColorStop(1, '#e0fcf2');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.moveTo(m.radius, -.2 * m.radius);
        ctx.lineTo(.4 * m.radius, -.7 * m.radius);
        ctx.lineTo(-.65 * m.radius, -.45 * m.radius);
        ctx.lineTo(-m.radius, .2 * m.radius);
        ctx.lineTo(-.2 * m.radius, .65 * m.radius);
        ctx.lineTo(.75 * m.radius, .35 * m.radius);
        ctx.closePath(); ctx.fill();
        ctx.restore();
        frame = requestAnimationFrame(draw);
    }

    function stop() {
        clearTimeout(timer);
        cancelAnimationFrame(frame);
        frame = 0; meteor = null;
        ctx.clearRect(0, 0, width, height);
    }
    function sync() { stop(); if (allowed()) schedule(); }
    function start() {
        if (ready) return;
        ready = true;
        // One early sighting establishes the effect, then use the normal random cadence.
        schedule(900);
    }
    window.addEventListener('portfolioReady', start, { once: true });
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    window.addEventListener('resize', () => { resize(); sync(); }, { passive: true });
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', event => { if (event.persisted) sync(); });
    resize();
    if (document.getElementById('hero')?.classList.contains('visible') && !document.body.classList.contains('no-scroll')) start();
})();
