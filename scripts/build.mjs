import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
await build({ entryPoints: ['src/testimonials.tsx', 'src/motion.ts'], bundle: true,
  loader: { '.png': 'dataurl' }, minify: true, format: 'iife', target: 'es2020', outdir: 'assets' });
await mkdir('assets/vendor', { recursive: true });
for (const file of ['gsap.min.js', 'ScrollTrigger.min.js']) {
  await copyFile(`node_modules/gsap/dist/${file}`, `assets/vendor/${file}`);
}
