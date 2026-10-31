import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './motion.css';
import type { gsap as GSAP } from 'gsap';
import type { ScrollTrigger as Trigger } from 'gsap/ScrollTrigger';

declare global {
  interface Window { gsap: typeof GSAP; ScrollTrigger: typeof Trigger; }
}

// One animation clock; no second GSAP instance is bundled into the page.
function startPortfolioMotion() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal, .reveal-bounce'));
  if (!gsap || !ScrollTrigger) return; // Content is visible without the enhancement.
  const media = gsap.matchMedia();
  media.add({
    desktop: '(hover: hover) and (pointer: fine)',
    reduced: '(prefers-reduced-motion: reduce)',
    all: 'all'
  }, context => {
    const { desktop, reduced } = context.conditions!;
    let lenis: Lenis | undefined;
    let clock: ((time: number) => void) | undefined;
    let lockObserver: MutationObserver | undefined;
    let navigate: ((event: MouseEvent) => void) | undefined;
    if (desktop && !reduced) {
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        prevent: node => Boolean(node.closest('dialog, #music-player, #nav-pill, .swiper'))
      });
      // Respect the nav's expand-first click and normal modified-link behavior.
      navigate = event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
        if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
        const id = link.getAttribute('href')!.slice(1);
        const target = document.getElementById(id);
        if (!target || !lenis || lenis.isStopped) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: -96, onComplete: () => {
          if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
          const hadTabIndex = target.hasAttribute('tabindex');
          if (!hadTabIndex) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          if (!hadTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        } });
      };
      document.addEventListener('click', navigate);
      lenis.on('scroll', ScrollTrigger.update);
      clock = time => lenis?.raf(time * 1000);
      gsap.ticker.add(clock);
      gsap.ticker.lagSmoothing(0);
      const syncLock = () => {
        if (document.body.classList.contains('no-scroll') || document.body.style.overflow === 'hidden') lenis?.stop();
        else lenis?.start();
      };
      lockObserver = new MutationObserver(syncLock);
      lockObserver.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
      syncLock();
    }

    const pending = reveals.filter(element => !element.classList.contains('active'));
    if (reduced) pending.forEach(element => element.classList.add('active'));
    else {
      document.documentElement.classList.add('motion-ready');
      ScrollTrigger.batch(pending, {
        start: 'top 94%', once: true, interval: 0.08, batchMax: 4,
        onEnter: batch => gsap.to(batch, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.75, stagger: 0.065, ease: 'power3.out', overwrite: 'auto',
          onComplete: () => {
            batch.forEach(element => element.classList.add('active'));
            gsap.set(batch, { clearProps: 'opacity,transform' });
          }
        })
      });
    }

    const cleanups: Array<() => void> = [];
    if (desktop && !reduced) {
      document.querySelectorAll<HTMLElement>('.tilt-3d, section:not(#awards) .glow-hover').forEach(card => {
        if (card.querySelector('iframe, #basketball-gallery-root')) return;
        // The same 3D treatment as before, with retargetable easing and a reliable return to rest.
        const x = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
        const y = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        const scale = gsap.quickTo(card, 'scale', { duration: 0.4, ease: 'power3.out' });
        let bounds: DOMRect | null = null;
        const move = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse' || event.buttons ||
              (card.matches('.reveal, .reveal-bounce') && !card.classList.contains('active'))) return;
          bounds ??= card.getBoundingClientRect();
          gsap.set(card, { transformPerspective: 800 });
          x(-gsap.utils.clamp(-0.5, 0.5, (event.clientY - bounds.top) / bounds.height - 0.5) * 8);
          y(gsap.utils.clamp(-0.5, 0.5, (event.clientX - bounds.left) / bounds.width - 0.5) * 8);
          scale(1.02);
        };
        const reset = () => { bounds = null; x(0); y(0); scale(1); };
        card.addEventListener('pointermove', move);
        card.addEventListener('pointerleave', reset);
        card.addEventListener('pointercancel', reset);
        window.addEventListener('blur', reset);
        cleanups.push(() => {
          card.removeEventListener('pointermove', move);
          card.removeEventListener('pointerleave', reset);
          card.removeEventListener('pointercancel', reset);
          window.removeEventListener('blur', reset);
          x.tween.kill(); y.tween.kill(); scale.tween.kill();
          gsap.set(card, { clearProps: 'transform' });
        });
      });
    }
    ScrollTrigger.refresh();
    return () => {
      lockObserver?.disconnect();
      if (navigate) document.removeEventListener('click', navigate);
      if (clock) gsap.ticker.remove(clock);
      lenis?.destroy();
      cleanups.forEach(cleanup => cleanup());
      gsap.killTweensOf(reveals);
      gsap.set(reveals, { clearProps: 'opacity,transform' });
      document.documentElement.classList.remove('motion-ready');
      // A changed accessibility preference must never hide content already encountered.
      reveals.forEach(element => element.classList.add('active'));
    };
  });
}
window.addEventListener('portfolioReady', startPortfolioMotion, { once: true });
