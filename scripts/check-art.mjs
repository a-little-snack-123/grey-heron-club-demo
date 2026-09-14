import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIRS = ['public/art/noir-v2', 'public/art/folio-v3', 'public/art/seal-v4', 'public/art/club-v7'];
const LIMIT = 185;
let bad = 0;

for (const DIR of DIRS) for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.webp'))) {
  if (!DIR.endsWith('noir-v2') && !['entrance.webp','round-table.webp','writing-desk.webp'].includes(f)) {
    const meta = await sharp(path.join(DIR, f)).metadata();
    const alpha = (await sharp(path.join(DIR, f)).ensureAlpha().stats()).channels[3];
    if (!meta.hasAlpha || alpha.min !== 0 || alpha.max < 254) {
      bad++; console.log(`✗ ${f} 缺少完整透明/不透明像素`);
    }
  }
  const { data, info } = await sharp(path.join(DIR, f))
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const lum = (x, y) => {
    const safeX = Math.max(0, Math.min(w - 1, x));
    const safeY = Math.max(0, Math.min(h - 1, y));
    const i = (safeY * w + safeX) * c;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };
  const pts = (n, fx, fy) => Array.from({ length: n }, (_, k) => [fx(k, n), fy(k, n)]);
  const avg = (a) => a.reduce((s, [x, y]) => s + lum(x, y), 0) / a.length;

  const T = avg(pts(40, (k, n) => Math.round((k + 0.5) * w / n), () => 1));
  const B = avg(pts(40, (k, n) => Math.round((k + 0.5) * w / n), () => h - 2));
  const L = avg(pts(40, () => 1, (k, n) => Math.round((k + 0.5) * h / n)));
  const R = avg(pts(40, () => w - 2, (k, n) => Math.round((k + 0.5) * h / n)));

  const hit = [['上', T], ['下', B], ['左', L], ['右', R]].filter(([, value]) => value > LIMIT);
  if (hit.length) {
    bad++;
    console.log(`✗ ${f}  ${w}x${h}  ${hit.map(([direction, value]) => `${direction}:${value.toFixed(0)}`).join(' ')}`);
  }
}

console.log(bad ? `\n${bad} 个素材边缘不合格` : `\n✓ 所有素材边缘合格（均 ≤ ${LIMIT}）`);
process.exit(bad ? 1 : 0);
