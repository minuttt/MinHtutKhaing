// Dynamic Island behaviour integrated into the existing portfolio navigation.
(() => {
    const nav = document.getElementById('nav-pill');
    if (!nav) return;
    const mobile = matchMedia('(max-width: 900px)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const links = nav.querySelector('.nav-links');
    const logo = nav.querySelector('.nav-logo');
    const toggle = nav.querySelector('.nav-mobile-toggle');
    const trigger = nav.querySelector('.nav-island-trigger');
    const title = nav.querySelector('.nav-island-title');
    const ring = nav.querySelector('.nav-progress-fill');
    const items = Array.from(nav.querySelectorAll('.nav-link'));
    const sections = Array.from(document.querySelectorAll('section[id]'));
    let collapsed = false, timer = 0, raf = 0;
    let lastY = scrollY, travel = 0, direction = 0, active = '';

    function measure() {
        if (mobile.matches) { nav.style.removeProperty('width'); return; }
        const width = `${logo.offsetWidth + links.scrollWidth - 2}px`;
        nav.style.setProperty('--expanded-width', width);
        nav.style.width = width;
    }
    function accessibility() {
        const open = !collapsed && (!mobile.matches || nav.classList.contains('mobile-open'));
        links.inert = !open;
        logo.inert = collapsed;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        trigger.tabIndex = collapsed ? 0 : -1;
        trigger.setAttribute('aria-expanded', 'false');
    }
    function idle() {
        clearTimeout(timer);
        if (scrollY > 100) timer = setTimeout(() => collapse(), 2500);
    }
    function collapse(force = false) {
        if (!force && nav.matches(':hover, :focus-within')) return;
        clearTimeout(timer);
        collapsed = true;
        nav.classList.add('collapsed');
        nav.classList.remove('mobile-open', 'island-hover');
        accessibility();
    }
    function expand(openMobile = true) {
        collapsed = false;
        nav.classList.remove('collapsed', 'island-hover');
        nav.classList.toggle('mobile-open', mobile.matches && openMobile);
        measure(); accessibility(); idle();
    }
    function updateContext() {
        let current = sections[0];
        const edge = Math.min(180, innerHeight * .25);
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= edge) current = section;
            else break;
        }
        const id = current?.id || 'hero';
        const item = items.find(link => link.getAttribute('href') === `#${id}`);
        const label = item?.textContent.trim() || current?.querySelector('h2')?.textContent.trim() || 'Explore';
        const total = document.documentElement.scrollHeight - innerHeight;
        const progress = total > 0 ? Math.min(100, Math.max(0, scrollY / total * 100)) : 0;
        ring.style.strokeDashoffset = String(100 - progress);
        trigger.setAttribute('aria-label', `${label}, ${Math.round(progress)}% through portfolio. Open navigation menu`);
        if (id === active) return;
        active = id;
        title.textContent = label;
        title.classList.remove('is-changing');
        // Only restart this small label animation when the section actually changes.
        void title.offsetWidth;
        title.classList.add('is-changing');
        items.forEach(link => {
            const selected = link === item;
            link.classList.toggle('active', selected);
            if (selected) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }
    function onScroll() {
        raf = 0;
        const y = Math.max(0, scrollY), delta = y - lastY, next = Math.sign(delta);
        if (next && next !== direction) travel = 0;
        if (next) direction = next;
        travel += Math.abs(delta);
        if (y <= 100) { expand(false); clearTimeout(timer); }
        else if (direction > 0 && travel > 36) { collapse(); travel = 0; }
        else if (direction < 0 && travel > 18) { expand(); travel = 0; }
        lastY = y;
        updateContext();
    }
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(onScroll); }, { passive: true });
    nav.addEventListener('pointerenter', event => {
        clearTimeout(timer);
        if (collapsed && finePointer.matches && event.pointerType === 'mouse') nav.classList.add('island-hover');
    });
    nav.addEventListener('pointerleave', () => { nav.classList.remove('island-hover'); idle(); });
    nav.addEventListener('focusin', () => clearTimeout(timer));
    nav.addEventListener('focusout', idle);
    trigger.addEventListener('click', () => { expand(); items[0]?.focus({ preventScroll: true }); });
    toggle.addEventListener('click', () => {
        nav.classList.toggle('mobile-open'); accessibility();
    });
    nav.addEventListener('click', event => {
        if (mobile.matches && event.target.closest('a')) collapse(true);
    });
    nav.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        event.preventDefault(); collapse(true); trigger.focus({ preventScroll: true });
    });
    document.addEventListener('pointerdown', event => {
        if (mobile.matches && nav.classList.contains('mobile-open') && !nav.contains(event.target)) collapse(true);
    });
    items.forEach((link, index) => link.style.setProperty('--nav-order', index));
    mobile.addEventListener('change', () => { lastY = scrollY; travel = 0; expand(false); updateContext(); });
    window.addEventListener('resize', () => { measure(); updateContext(); }, { passive: true });
    document.fonts.ready.then(measure);
    // Expanding testimonials or loading media can change the total reading length.
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateContext).observe(document.body);
    measure(); accessibility(); updateContext(); idle();
})();
