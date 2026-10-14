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
        const dpr = Math.min(devicePixelRatio || 1, 2);
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
        const length = random(Math.min(260, width * .48), Math.min(560, width * .72));
        const distance = width + length + 64;
        const maxSlope = Math.min(.48, height * .58 / distance);
        const slope = random(.1, Math.max(.11, maxSlope)) * (Math.random() < .7 ? 1 : -1);
        const drift = slope * distance;
        const margin = height * .12;
        const startY = random(margin + Math.max(0, -drift), height - margin - Math.max(0, drift));
        meteor = {
            start: performance.now(), duration: random(1500, 5000), length, distance,
            y: startY, slope, angle: Math.atan(slope), radius: random(width < 600 ? 4.5 : 6, width < 600 ? 6.5 : 9),
            phase: random(0, Math.PI * 2), tint: Math.random() < .5 ? '34,211,238' : '69,224,180',
            sparks: Array.from({ length: width < 600 ? 48 : 80 }, () => ({
                behind: random(.12, 1), offset: random(-1, 1), size: random(.6, 1.9), phase: random(0, 6.28)
            }))
        };
        canvas.dataset.phase = 'entering';
        frame = requestAnimationFrame(draw);
        // Start-to-start spacing, rather than adding flight time to the interval.
        schedule();
    }

    // Travelling waves run away from the head through a broad, tapering plasma wake.
    function ribbon(length, spread, alpha, tint, time, phase, filament = 0) {
        const gradient = ctx.createLinearGradient(-length, 0, 5, 0);
        gradient.addColorStop(0, `rgba(${tint},0)`);
        gradient.addColorStop(.24, `rgba(16,185,129,${alpha * .2})`);
        gradient.addColorStop(.65, `rgba(${tint},${alpha * .65})`);
        gradient.addColorStop(1, `rgba(191,250,244,${alpha})`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        for (const side of [-1, 1]) {
            for (let i = 0; i <= 48; i++) {
                const u = side < 0 ? i / 48 : 1 - i / 48;
                const envelope = Math.sin(Math.PI * u) ** .7;
                const wave = (Math.sin(u * 11 - time * 8 + phase) + .42 * Math.sin(u * 27 - time * 13 + phase)) * u;
                const y = wave * spread * .28 + filament * spread * envelope + side * spread * envelope * (.72 + .15 * Math.sin(u * 19 - time * 9));
                const x = -u * length;
                if (side < 0 && i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
        }
        ctx.closePath(); ctx.fill();
    }

    function draw(now) {
        frame = 0;
        ctx.clearRect(0, 0, width, height);
        if (!meteor || !allowed()) return;
        const m = meteor;
        const progress = (now - m.start) / m.duration;
        if (progress >= 1) { meteor = null; canvas.dataset.phase = 'idle'; return; }
        const phase = progress < .35 ? 'entering' : progress < .7 ? 'crossing' : 'leaving';
        if (canvas.dataset.phase !== phase) canvas.dataset.phase = phase;
        const travel = progress * m.distance;
        const time = (now - m.start) / 1000;
        ctx.save();
        ctx.translate(-32 + travel, m.y + travel * m.slope);
        ctx.rotate(m.angle);
        ctx.globalAlpha = .82 * Math.min(1, progress * 16, (1 - progress) * 12);
        ctx.globalCompositeOperation = 'lighter';

        // Distinct outer dust fan and narrower ion tail, with independently moving filaments.
        ribbon(m.length, m.radius * 4.2, .11, m.tint, time, m.phase);
        ribbon(m.length * .92, m.radius * 2.4, .23, m.tint, time, m.phase + .5);
        ribbon(m.length * .83, m.radius * .9, .4, m.tint, time, m.phase);
        for (let strand = 0; strand < 7; strand++) {
            ctx.save();
            ctx.translate(-m.radius, (strand - 3) * m.radius * .55);
            ribbon(m.length * (.64 + strand * .035), m.radius * .14, .28,
                strand % 2 ? '64,226,190' : '96,221,249', time * (1 + strand * .07), m.phase + strand, strand - 3);
            ctx.restore();
        }
        // Embers continuously peel away, spread out, twinkle, and extinguish along the wake.
        for (const spark of m.sparks) {
            const age = (spark.behind + time * (.32 + spark.size * .13)) % 1;
            const x = -age * m.length;
            const y = spark.offset * m.radius * (1 + age * 5) + Math.sin(time * 5 + spark.phase) * age * m.radius;
            const opacity = Math.sin(Math.PI * age) * (1 - age) * (.4 + .18 * Math.sin(time * 12 + spark.phase));
            ctx.strokeStyle = `rgba(${m.tint},${opacity})`;
            ctx.lineWidth = spark.size;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3 - (1 - age) * 11, y - spark.offset * 2); ctx.stroke();
        }
        const pulse = 1 + .07 * Math.sin(time * 10 + m.phase) + .035 * Math.sin(time * 23);
        ctx.save(); ctx.scale(pulse * 1.35, pulse);
        const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, m.radius * 5.5);
        halo.addColorStop(0, 'rgba(221,255,247,.8)');
        halo.addColorStop(.12, `rgba(${m.tint},.55)`);
        halo.addColorStop(.38, `rgba(${m.tint},.13)`);
        halo.addColorStop(1, `rgba(${m.tint},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(0, 0, m.radius * 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // A curved bow shock wraps the leading edge of the comet's coma.
        ctx.strokeStyle = `rgba(167,250,231,${.3 + .08 * Math.sin(time * 7)})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.ellipse(m.radius * .25, 0, m.radius * 1.7, m.radius * 2.1, 0, -1.3, 1.3); ctx.stroke();

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
        frame = 0; meteor = null; canvas.dataset.phase = 'idle';
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
