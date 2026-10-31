import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import './gallery-modal-accordion.css';

// Adapted from the user's gallery-modal-accordion: hover expansion + full-photo modal.
// Native images and the existing Framer Motion dependency keep this static site portable.
const photos = [
  { file: 'basketball1.jpeg', title: 'On the court', alt: 'Basketball player on an indoor court wearing a MIN number 0 jersey', position: '50% 45%' },
  { file: 'basketball2.jpeg', title: 'Preparing the shot', alt: 'Basketball player holding the ball and preparing to shoot', position: '50% 50%' },
  { file: 'basketball3.jpeg', title: 'Yuan Ching team', alt: 'Yuan Ching basketball team posing together on the court', position: '50% 50%' },
  { file: 'basketball4.jpeg', title: 'At the rim', alt: 'Basketball player jumping towards the hoop for a layup', position: '60% 48%' }
];
const source = (index: number) => `assets/basketball/${photos[index].file}`;

export default function AccordionModal() {
  const [active, setActive] = useState(2);
  const [selected, setSelected] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const close = () => {
    if (reduced) dialog.current?.close();
    else setClosing(true);
  };
  useEffect(() => {
    if (selected === null) return;
    const element = dialog.current!;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!element.open) element.showModal();
    return () => { document.body.style.overflow = previous; };
  }, [selected !== null]);
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => dialog.current?.close(), 200);
    return () => window.clearTimeout(timer);
  }, [closing]);
  const step = (direction: number) => {
    if (closing) return;
    setSelected(index => index === null ? null : (index + direction + photos.length) % photos.length);
  };
  return <div className="basketball-gallery" data-stable-gallery="">
    <div className="basketball-accordion" role="group" aria-label="Basketball photo gallery">
      {photos.map((photo, index) => <button key={photo.file} type="button"
        className={`basketball-photo${active === index ? ' is-active' : ''}`}
        aria-label={`Enlarge photo ${index + 1}: ${photo.title}`} aria-haspopup="dialog"
        onPointerEnter={event => { if (event.pointerType === 'mouse') setActive(index); }}
        onFocus={() => setActive(index)}
        onClick={event => { opener.current = event.currentTarget; setActive(index); setSelected(index); }}>
        <img src={source(index)} alt={photo.alt} loading="lazy" decoding="async" draggable={false} style={{ objectPosition: photo.position }} />
        <span className="basketball-photo-caption"><span>{photo.title}</span><Expand size={17} aria-hidden="true" /></span>
        <span className="basketball-photo-number" aria-hidden="true">0{index + 1}</span>
      </button>)}
    </div>
    <p className="basketball-gallery-hint">Select a photo to view it in full.</p>
    {createPortal(<dialog ref={dialog} className={`basketball-lightbox${closing ? ' is-closing' : ''}`}
      aria-label="Basketball photo viewer" onCancel={event => { event.preventDefault(); close(); }}
      onClose={() => { setSelected(null); setClosing(false); opener.current?.focus({ preventScroll: true }); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
      }}>
      {selected !== null && <motion.div className="basketball-viewer" initial={reduced ? false : { opacity: 0, scale: .97 }}
        animate={{ opacity: closing ? 0 : 1, scale: closing && !reduced ? .97 : 1 }} transition={{ duration: reduced ? 0 : .2 }}>
        <button type="button" className="basketball-viewer-close" aria-label="Close basketball photo" onClick={close} autoFocus><X size={22} /></button>
        <img className="basketball-full-photo" src={source(selected)} alt={photos[selected].alt} />
        <div className="basketball-viewer-footer">
          <button type="button" aria-label="Previous basketball photo" onClick={() => step(-1)}><ChevronLeft size={22} /></button>
          <p aria-live="polite"><span>{photos[selected].title}</span><span>{selected + 1} / {photos.length}</span></p>
          <button type="button" aria-label="Next basketball photo" onClick={() => step(1)}><ChevronRight size={22} /></button>
        </div>
      </motion.div>}
    </dialog>, document.body)}
  </div>;
}
