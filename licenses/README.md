# Motion dependencies

- GSAP 3.12.5 and ScrollTrigger: https://github.com/greensock/GSAP. Vendored from the pinned npm package; upstream license notices are preserved in both minified files. https://gsap.com/standard-license/
- Lenis 1.3.27: https://github.com/darkroomengineering/lenis. MIT license in licenses/lenis.txt.
- React Bits Magnet by David Haz: https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Animations/Magnet/Magnet.tsx. Retrieved 2026-10-30; license in licenses/react-bits.md. Adapted to accept only mouse input on fine-pointer devices; used in the existing testimonial controls.

Run `npm run build` to regenerate motion/testimonial bundles and vendor GSAP. Run `npm run typecheck` and `node --test tests/*.test.cjs` for checks.
