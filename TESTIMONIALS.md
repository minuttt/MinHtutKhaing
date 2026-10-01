# Testimonials

The school selector uses components/ui/skiper49.tsx, adapted from the supplied Skiper UI Carousel_003 reference with Swiper coverflow (40-degree rotation, 100px depth, centered slides and looping). School logos replace the sample illustrations. Six visual slides repeat the two schools to satisfy loop requirements; the controls expose only two school selections. Swipe, arrows and focused left/right keys navigate. Reduced-motion preferences disable animated transitions.

The existing testimonial reader and complete text in src/testimonials-data.ts are preserved. Both school PNGs are bundled as data URLs. Skiper UI attribution is retained in THIRD_PARTY_CREDITS.md and the component source. The old WebGL carousel is no longer imported or included in the build.

Run npm ci, npm run typecheck, and npm run build after editing. Deploy assets/testimonials.js and assets/testimonials.css with index.html. No production Node server is needed. components.json and tsconfig.json define the shadcn-style component paths and @/ alias. The page supplies Tailwind; scoped styling lives in src/testimonials.css.

Cards use isolated inner transforms for the portfolio’s 8-degree pointer tilt, school-colored gradients and an animated underline. A stationary full-card button owns pointer and keyboard activation; the visual face alone rotates. A 10px gesture threshold separates clicks from swipes, without Swiper click suppression. The reader closes with a 260ms fade/scale and backdrop transition, bypassed for reduced motion.
