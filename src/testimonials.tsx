import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Skiper49 } from '@/components/ui/skiper49';
import { testimonials } from './testimonials-data';
import './testimonials.css';

function Testimonials() {
  const [selected, setSelected] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const current = selected === null ? null : testimonials[selected];
  const open = (index: number) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected(index);
  };
  const close = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) dialog.current?.close();
    else setClosing(true);
  };
  useEffect(() => {
    if (!closing) return;
    const timeout = window.setTimeout(() => dialog.current?.close(), 280);
    return () => window.clearTimeout(timeout);
  }, [closing]);
  useEffect(() => {
    if (selected === null) return;
    const el = dialog.current;
    if (!el) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el.showModal();
    el.querySelector('.testimonial-body')?.scrollTo(0,0);
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selected]);
  return <>
    <Skiper49 items={testimonials} onRead={open} />
    <dialog ref={dialog} className={`testimonial-dialog${closing ? " is-closing" : ""}`} aria-labelledby="testimonial-dialog-title"
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if(event.target === event.currentTarget) { const r=event.currentTarget.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) close(); } }}
      onClose={() => { setClosing(false); setSelected(null); opener.current?.focus({preventScroll:true}); }}>
      {current && <div className="testimonial-document">
        <header className="testimonial-dialog-header">
          <div className="testimonial-source"><img src={current.logo} alt={`${current.title} logo`} /><div><p>{current.level} · {current.years}</p><h3 id="testimonial-dialog-title">{current.title}</h3></div></div>
          <button type="button" className="testimonial-close" autoFocus aria-label="Close testimonial" onClick={close}>✕</button>
        </header>
        <div className="testimonial-body" tabIndex={0}>
          <div className="testimonial-letter-top"><p className="testimonial-document-label">In their words</p><span aria-hidden="true">“</span></div>
          <h4>Min Htut Khaing</h4><p className="testimonial-letter-subtitle">A reflection on character, learning &amp; growth</p>
          <blockquote>{current.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</blockquote>
          <footer>{current.title}<span>{current.years}</span></footer>
        </div>
      </div>}
    </dialog>
  </>;
}

const root = document.getElementById('testimonials-root');
if (root) createRoot(root).render(<Testimonials />);
