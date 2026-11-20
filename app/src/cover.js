// Sunset City Cover Studio — the poster painter.
//
// Paints a complete fake-movie-poster cover on any canvas: a hero close-up
// kept safe by a headroom guard, four side panels in deliberately different
// shapes, a big original gradient title with a script subtitle, a press-quote
// strip, a VOL. badge, a gold seal, a barcode and a billing line. Everything
// is drawn with the canvas 2D API from the user's own photos. No Rockstar
// logo, artwork, character or font anywhere: the lettering is drawn with
// system fonts, and nothing is fetched over the network.

// Six colour grades. `sky` is the poster's background gradient, `tint` the
// warm wash laid over each photo, `title` the chrome gradient of the big
// title lettering.
export const GRADES = {
  sunset: { label: 'Sunset', sky: ['#2b1245', '#ff7a4d'], tint: '#ff5e8a', title: ['#ffd76a', '#ff7a4d', '#ff3d81'] },
  neon: { label: 'Neon Pink', sky: ['#1c0b33', '#ff2e88'], tint: '#ff2e88', title: ['#ffe66d', '#ff5ec4', '#b04dff'] },
  teal: { label: 'Vice Teal', sky: ['#062a33', '#00c2a8'], tint: '#00c2a8', title: ['#c9fff2', '#37e0c8', '#ff8a5c'] },
  golden: { label: 'Golden Hour', sky: ['#33150a', '#ffb347'], tint: '#ffb347', title: ['#fff3b0', '#ffc233', '#ff7a1a'] },
  night: { label: 'Night Drive', sky: ['#0a0a24', '#4d4dff'], tint: '#4d6bff', title: ['#e8ecff', '#8fa8ff', '#ff5e8a'] },
  chrome: { label: 'Palm Chrome', sky: ['#20242e', '#9aa5b1'], tint: '#9aa5b1', title: ['#ffffff', '#c8d2dc', '#7d8a99'] },
};

// The five panels, as fractions of the art area. Their shapes are
// deliberately varied: a tall strip on the left, the hero in the middle, a
// wide strip and a slanted parallelogram on the right, a small square at
// the bottom left.
export const PANELS = [
  { id: 'hero', role: 'THE DRIVER', x: 0.27, y: 0.02, w: 0.46, h: 0.62, shape: 'rect' },
  { id: 'tall', role: 'THE BOSS', x: 0.01, y: 0.02, w: 0.24, h: 0.62, shape: 'rect' },
  { id: 'wide', role: 'THE MECHANIC', x: 0.75, y: 0.02, w: 0.24, h: 0.30, shape: 'rect' },
  { id: 'slant', role: 'THE LOOKOUT', x: 0.75, y: 0.35, w: 0.24, h: 0.29, shape: 'slant' },
  { id: 'small', role: 'THE RIDER', x: 0.01, y: 0.67, w: 0.24, h: 0.31, shape: 'rect' },
];

/** A fresh poster: one photo, one caption, ready to paint. */
export function freshState() {
  return {
    title: 'SUNDOWN RACKET',
    subtitle: 'Paid in Sunsets',
    quote: 'The most fun you can have with one photo.',
    paper: 'Sunset City Gazette',
    vol: 'VOL. 6',
    grade: 'sunset',
    layout: 'over', // 'over' lays the title on the art; 'below' puts it under the art
    crops: {
      hero: { photo: 0, zoom: 1.15, dx: 0, dy: -0.08 },
      tall: { photo: 1, zoom: 1.35, dx: 0.1, dy: 0 },
      wide: { photo: 0, zoom: 1.5, dx: -0.15, dy: 0.1 },
      slant: { photo: 1, zoom: 1.4, dx: 0, dy: -0.05 },
      small: { photo: 0, zoom: 1.45, dx: 0.12, dy: -0.05 },
    },
  };
}

/**
 * One click fills the whole poster from the photos that exist: each panel
 * takes a turn from a photo, each with its own zoom and offset, so a single
 * photo still fills every panel differently. The title, subtitle, grade and
 * layout the user already picked are kept.
 */
export function fillFromPhoto(state, photoCount) {
  const next = freshState();
  next.title = (state.title || '').trim() || 'SUNDOWN RACKET';
  next.subtitle = state.subtitle || 'Paid in Sunsets';
  next.quote = state.quote || next.quote;
  next.paper = state.paper || next.paper;
  next.vol = state.vol || next.vol;
  next.grade = state.grade || 'sunset';
  next.layout = state.layout || 'over';
  const zooms = [1.15, 1.33, 1.51, 1.4, 1.45];
  const xs = [-0.12, 0.1, 0, -0.08, 0.14];
  const ys = [-0.08, 0.05, 0.1, -0.05, -0.05];
  PANELS.forEach((panel, i) => {
    const crop = next.crops[panel.id];
    crop.photo = photoCount > 1 ? i % photoCount : 0;
    crop.zoom = zooms[i];
    crop.dx = xs[i];
    crop.dy = ys[i];
  });
  return next;
}

/**
 * A cover-fit window into a photo for a panel of size (w, h), zoomed in
 * and nudged by (dx, dy), each -1..1. With `guardTop` set — the hero — the
 * window is biased toward the top of the photo and clamped so it never
 * starts more than 8% of its own height below the top: the top of the
 * head is never cut off, however far the user drags the crop down.
 */
export function cropWindow(photo, w, h, zoom, dx, dy, guardTop) {
  const iw = photo.naturalWidth;
  const ih = photo.naturalHeight;
  const panelRatio = w / h;
  const imgRatio = iw / ih;
  let sw;
  let sh;
  if (imgRatio > panelRatio) {
    sh = ih;
    sw = ih * panelRatio;
  } else {
    sw = iw;
    sh = iw / panelRatio;
  }
  sw /= zoom;
  sh /= zoom;
  let sx = (iw - sw) / 2 + (dx * (iw - sw)) / 2;
  let sy = (ih - sh) / 2 + (dy * (ih - sh)) / 2;
  if (guardTop) sy = Math.max(0, Math.min(sy, sh * 0.08, ih - sh));
  else sy = Math.max(0, Math.min(sy, ih - sh));
  sx = Math.max(0, Math.min(sx, iw - sw));
  return { sx, sy, sw, sh };
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// The clip path of a panel: a rounded rectangle, or a parallelogram for
// the slanted panel so its shape stands apart from the others.
function panelClip(ctx, box) {
  if (box.shape === 'slant') {
    const s = box.w * 0.1;
    ctx.beginPath();
    ctx.moveTo(box.x + s, box.y);
    ctx.lineTo(box.x + box.w, box.y);
    ctx.lineTo(box.x + box.w - s, box.y + box.h);
    ctx.lineTo(box.x, box.y + box.h);
    ctx.closePath();
    return;
  }
  rounded(ctx, box.x, box.y, box.w, box.h, Math.min(box.w, box.h) * 0.03);
}

function paintPanel(ctx, photo, box, panel, crop, isHero, grade, chipOnTop) {
  const src = cropWindow(photo, box.w, box.h, crop.zoom, crop.dx, crop.dy, isHero);
  ctx.save();
  panelClip(ctx, box);
  ctx.clip();
  ctx.drawImage(photo, src.sx, src.sy, src.sw, src.sh, box.x, box.y, box.w, box.h);
  const wash = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
  wash.addColorStop(0, 'rgba(255,122,77,0)');
  wash.addColorStop(1, grade.tint + '55');
  ctx.fillStyle = wash;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(2, box.w * 0.008);
  panelClip(ctx, box);
  ctx.stroke();
  // Role chip. It sits at the foot of the panel — except on the bottom-left
  // panel when the title lies over the art, where the big title would run
  // across it: there it rides at the top of the panel instead.
  const chipH = Math.max(18, box.h * 0.09);
  ctx.font = `700 ${chipH * 0.52}px system-ui, sans-serif`;
  const chipW = ctx.measureText(panel.role).width + chipH * 1.2;
  const chipY = chipOnTop ? box.y + 6 : box.y + box.h - chipH - 6;
  ctx.fillStyle = '#14101c';
  rounded(ctx, box.x + 6, chipY, chipW, chipH, chipH / 2);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(panel.role, box.x + 6 + chipH * 0.6, chipY + chipH / 2);
  ctx.restore();
}

function paintTitle(ctx, text, cx, y, maxW, size, grade) {
  let s = size;
  ctx.font = `900 ${s}px system-ui, sans-serif`;
  try {
    ctx.letterSpacing = `${Math.round(s * 0.04)}px`;
  } catch (e) {
    /* letterSpacing is not in every canvas build */
  }
  let w = ctx.measureText(text).width;
  while (w > maxW * 0.96 && s > 20) {
    s = Math.max(20, Math.floor((s * maxW * 0.96) / w));
    ctx.font = `900 ${s}px system-ui, sans-serif`;
    w = ctx.measureText(text).width;
  }
  const grad = ctx.createLinearGradient(0, y - s, 0, y + s * 0.2);
  grade.title.forEach((c, i) => grad.addColorStop(i / (grade.title.length - 1), c));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1a0f24';
  ctx.lineWidth = s * 0.09;
  ctx.strokeText(text, cx, y);
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, y);
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = Math.max(1, s * 0.015);
  ctx.strokeText(text, cx, y - s * 0.02);
  try {
    ctx.letterSpacing = '0px';
  } catch (e) {
    /* older canvas */
  }
  return s;
}

function paintSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#e8b64c';
  ctx.fill();
  ctx.lineWidth = r * 0.1;
  ctx.strokeStyle = '#8a5a12';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.strokeStyle = '#8a5a12';
  ctx.lineWidth = r * 0.05;
  ctx.stroke();
  ctx.fillStyle = '#5c3a08';
  ctx.font = `900 ${r * 0.42}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', cx, cy - r * 0.08);
  ctx.font = `700 ${r * 0.16}px system-ui, sans-serif`;
  ctx.fillText('ORIGINAL', cx, cy + r * 0.38);
  ctx.fillText('COVER ART', cx, cy + r * 0.58);
  ctx.restore();
}

function paintBarcode(ctx, x, y, w, h, seedText) {
  let seed = 0;
  for (const ch of seedText) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  ctx.save();
  ctx.fillStyle = '#14101c';
  let bx = x;
  while (bx < x + w) {
    const bw = 2 + (seed % 5);
    seed = (seed * 1103515245 + 12345) >>> 0;
    if (seed % 3 !== 0) ctx.fillRect(bx, y, bw, h);
    bx += bw + 2;
  }
  ctx.restore();
}

/**
 * Paints the whole poster on `canvas` at its own pixel size, from `state`
 * and the loaded `photos` (an array of images; a panel with no photo draws
 * a sunset placeholder instead). Returns the canvas.
 */
export function paintPoster(canvas, photos, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const u = W / 1080; // one unit, so the same painting works at every export size
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, '#1a0f24');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.32, 10, W * 0.5, H * 0.32, W * 0.45);
  glow.addColorStop(0, 'rgba(255,214,106,0.55)');
  glow.addColorStop(1, 'rgba(255,214,106,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const below = state.layout === 'below';
  // Vertical zones, kept tight so there is no dead band: in the "over"
  // layout the title sits on the art itself, over a dark scrim; in the
  // "below" layout the art is shorter and the title follows it at once.
  const artH = below ? H * 0.58 : H * 0.8;
  const artY = H * 0.02;
  const artW = W * 0.96;
  const artX = W * 0.02;

  ctx.save();
  ctx.translate(artX, artY);
  for (const panel of PANELS) {
    const box = {
      x: panel.x * artW,
      y: panel.y * artH,
      w: panel.w * artW,
      h: panel.h * artH,
      shape: panel.shape,
    };
    const crop = state.crops[panel.id];
    const photo = photos[crop.photo] || photos[0] || null;
    if (photo) {
      paintPanel(ctx, photo, box, panel, crop, panel.id === 'hero', grade, panel.id === 'small' && !below);
    } else {
      ctx.fillStyle = '#3a2340';
      rounded(ctx, box.x, box.y, box.w, box.h, 8 * u);
      ctx.fill();
      ctx.fillStyle = '#ffd76a';
      ctx.font = `700 ${18 * u}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(panel.role, box.x + box.w / 2, box.y + box.h / 2);
    }
  }
  ctx.restore();

  const titleText = (state.title || 'SUNDOWN RACKET').trim().toUpperCase();
  const titleY = below ? H * 0.66 : H * 0.79;
  if (!below) {
    const scrim = ctx.createLinearGradient(0, H * 0.7, 0, H * 0.88);
    scrim.addColorStop(0, 'rgba(20,10,28,0)');
    scrim.addColorStop(0.5, 'rgba(20,10,28,0.72)');
    scrim.addColorStop(1, 'rgba(20,10,28,0)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, H * 0.7, W, H * 0.18);
  }
  const titleSize = paintTitle(ctx, titleText, W / 2, titleY, W * 0.82, (below ? 88 : 96) * u, grade);
  ctx.font = `italic 700 ${Math.round(34 * u)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 6 * u;
  ctx.fillText(state.subtitle || 'Paid in Sunsets', W / 2, titleY + titleSize * 0.4);
  ctx.shadowBlur = 0;

  const qy = below ? H * 0.78 : H * 0.9;
  ctx.font = `700 ${Math.round(24 * u)}px system-ui, sans-serif`;
  ctx.fillStyle = '#ffd76a';
  ctx.fillText('★★★★★', W / 2, qy);
  ctx.font = `italic ${Math.round(24 * u)}px Georgia, serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`“${state.quote || 'The most fun you can have with one photo.'}” — ${state.paper || 'Sunset City Gazette'}`, W / 2, qy + 30 * u);

  ctx.fillStyle = '#14101c';
  rounded(ctx, W * 0.02, H * 0.02, 150 * u, 44 * u, 8 * u);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.font = `800 ${Math.round(22 * u)}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.vol || 'VOL. 6', W * 0.02 + 16 * u, H * 0.02 + 22 * u);
  paintSeal(ctx, W * 0.92, artY + artH - 6 * u, 48 * u);
  paintBarcode(ctx, W * 0.03, H - 34 * u, 150 * u, 26 * u, titleText);
  ctx.font = `${Math.round(17 * u)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'center';
  ctx.fillText('STARRING YOU  •  SHOT ON YOUR OWN PHONE  •  A SUNSET CITY POSTER', W / 2, H - 12 * u);
  ctx.textBaseline = 'alphabetic';
  return canvas;
}
