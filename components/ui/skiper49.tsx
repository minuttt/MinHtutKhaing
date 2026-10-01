"use client";

// Adapted from Skiper UI's Skiper49 / Carousel_003 (free attribution license).
import { motion, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { EffectCoverflow, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { cn } from "@/lib/utils";

type School = { title: string; level: string; years: string; logo: string };
type Props = { items: School[]; onRead: (index: number) => void; className?: string };

function SchoolCard({ school, active, warm, onRead }: { school: School; active: boolean; warm: boolean; onRead: () => void }) {
  const reduced = useReducedMotion();
  const gesture = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 220, damping: 22 });
  const rotateY = useSpring(y, { stiffness: 220, damping: 22 });
  const scale = useSpring(1, { stiffness: 220, damping: 24 });
  return <button type="button" className={`school-card-hit ${warm ? 'school-card-warm' : 'school-card-cool'}`}
    aria-hidden={!active} tabIndex={active ? 0 : -1} aria-label={`Read ${school.title} testimonial`}
    onMouseEnter={() => { if (!reduced) { x.set(-3); y.set(3); scale.set(1.035); } }}
    onMouseMove={event => {
      if (reduced || event.buttons) return;
      const rect = event.currentTarget.parentElement!.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      x.set(-(py - .5) * 20);
      y.set((px - .5) * 20);
      event.currentTarget.style.setProperty('--pointer-x', `${px * 100}%`);
      event.currentTarget.style.setProperty('--pointer-y', `${py * 100}%`);
    }} onMouseLeave={() => { x.set(0); y.set(0); scale.set(1); }}
    onPointerDown={event => { gesture.current = { x: event.clientX, y: event.clientY, moved: false }; }}
    onPointerMove={event => {
      const g = gesture.current;
      if (g && event.buttons && Math.hypot(event.clientX - g.x, event.clientY - g.y) > 10) g.moved = true;
    }}
    onPointerCancel={() => { gesture.current = null; }}
    onPointerUp={event => {
      const g = gesture.current;
      gesture.current = null;
      if (!g || g.moved || Math.hypot(event.clientX - g.x, event.clientY - g.y) > 10) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      x.set(0); y.set(0); scale.set(1);
      onRead();
    }}
    onClick={event => {
      // Pointer activation is handled on release; native keyboard activation has detail 0.
      if (event.detail === 0) onRead();
    }}>
    <motion.span className="school-coverflow-card" style={{ rotateX, rotateY, scale, transformPerspective: 800 }}>
    <span className="school-coverflow-logo"><img src={school.logo} alt="" draggable={false} /></span>
    <span className="school-coverflow-copy">
      <span className="school-card-meta">{school.level} <span>· {school.years}</span></span>
      <span className="school-card-title">{school.title}</span>
      <span className="school-card-read"><span className="animated-underline">Read testimonial</span><ArrowUpRight size={15} aria-hidden="true" /></span>
    </span>
    </motion.span>
  </button>;
}

export function Carousel_003({ items, onRead, className }: Props) {
  const swiper = useRef<SwiperInstance | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const reduced = useReducedMotion();
  // Coverflow needs more slides than its visible span for seamless wrapping.
  // Repeat the two schools visually, retaining just two logical selections.
  const slides = Array.from({ length: 3 }, () => items).flat();
  const active = activeSlide % items.length;
  return <motion.div className={cn("school-coverflow", className)}
    initial={reduced ? false : { opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }}
    transition={{ duration: .3 }} role="region" aria-label="School testimonials" aria-roledescription="carousel"
    onKeyDown={event => {
      if (event.key === "ArrowRight") { event.preventDefault(); swiper.current?.slideNext(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); swiper.current?.slidePrev(); }
    }}>
    <Swiper onSwiper={instance => { swiper.current = instance; }}
      onSlideChange={instance => setActiveSlide(instance.realIndex)}
      effect="coverflow" grabCursor slidesPerView="auto" centeredSlides loop
      preventClicks={false} preventClicksPropagation={false} threshold={10}
      focusableElements="input, select, textarea"
      spaceBetween={0} speed={reduced ? 0 : 550}
      coverflowEffect={{ rotate: 40, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
      modules={[EffectCoverflow, A11y]} className="Carousal_003">
      {slides.map((school, index) => <SwiperSlide key={index}>
        <SchoolCard school={school} active={index === activeSlide} warm={index % items.length === 0}
          onRead={() => onRead(index % items.length)} />
      </SwiperSlide>)}
    </Swiper>
    <div className="school-coverflow-controls">
      <button type="button" className="school-coverflow-arrow" aria-label="Previous school" onClick={() => swiper.current?.slidePrev()}><ChevronLeftIcon size={19} /></button>
      <div className="school-coverflow-dots" aria-label="Choose a school">
        {items.map((school, index) => <button type="button" key={school.title} aria-label={`Show ${school.title}`}
          aria-pressed={active === index} onClick={() => { if (active !== index) swiper.current?.slideNext(); }} />)}
      </div>
      <button type="button" className="school-coverflow-arrow" aria-label="Next school" onClick={() => swiper.current?.slideNext()}><ChevronRightIcon size={19} /></button>
    </div>
    <p className="school-coverflow-status" aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} <span>Drag to explore</span></p>
  </motion.div>;
}

export const Skiper49 = Carousel_003;
export default Skiper49;
