// Sunset City Cover Studio — the editor.
//
// Wires the page: load one or two photos, type a title, pick a grade and a
// layout, crop and position each panel, then export the cover as a PNG in
// 1080 x 1080, 1080 x 1350 or 1920 x 1080. A `?shot=` query sets up a fixed
// scene for a screenshot instead (./shots.js).
import { paintPoster, freshState, fillFromPhoto, PANELS } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
let state = freshState();
let photos = [];
let activePanel = 0;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function paint() {
  paintPoster(canvas, photos, state);
  syncCropControls();
}

function syncCropControls() {
  const panel = PANELS[activePanel];
  const crop = state.crops[panel.id];
  document.getElementById('zoom').value = crop.zoom;
  document.getElementById('offx').value = crop.dx;
  document.getElementById('offy').value = crop.dy;
  document.getElementById('role').value = panel.role;
  document.getElementById('zoomval').textContent = `${Math.round(crop.zoom * 100)}%`;
  document.querySelectorAll('#panels button').forEach((b, i) => {
    b.classList.toggle('on', i === activePanel);
  });
}

function pullForm() {
  state.title = document.getElementById('title').value;
  state.subtitle = document.getElementById('subtitle').value;
  state.quote = document.getElementById('quote').value;
  state.paper = document.getElementById('paper').value;
  state.vol = document.getElementById('vol').value;
  state.grade = document.querySelector('input[name="grade"]:checked').value;
  state.layout = document.querySelector('input[name="layout"]:checked').value;
}

/** Paints the poster off-screen at an export size and downloads it. */
export function downloadCover(width, height, filename) {
  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  paintPoster(off, photos, state);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    status.textContent = `Saved ${filename}`;
  }, 'image/png');
}

async function loadSample(name) {
  photos[0] = await loadImage(`samples/${name}.jpg`);
  paint();
}

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  photos[0] = await loadImage(URL.createObjectURL(file));
  paint();
  status.textContent = 'Photo loaded — tap “Make it a poster” or crop a panel.';
});
document.getElementById('photo2').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  photos[1] = await loadImage(URL.createObjectURL(file));
  paint();
});
document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier'));
document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard'));
document.getElementById('make-poster').addEventListener('click', () => {
  pullForm();
  state = fillFromPhoto(state, photos.length);
  document.getElementById('title').value = state.title;
  paint();
  status.textContent = 'Poster made — hero, panels, roles and title filled in. Tweak a panel, then export.';
});
['title', 'subtitle', 'quote', 'paper', 'vol'].forEach((id) => {
  document.getElementById(id).addEventListener('input', () => {
    pullForm();
    paint();
  });
});
document.querySelectorAll('input[name="grade"]').forEach((r) => {
  r.addEventListener('change', () => {
    pullForm();
    paint();
  });
});
document.querySelectorAll('input[name="layout"]').forEach((r) => {
  r.addEventListener('change', () => {
    pullForm();
    paint();
  });
});
document.querySelectorAll('#panels button').forEach((b, i) => {
  b.addEventListener('click', () => {
    activePanel = i;
    syncCropControls();
  });
});
document.getElementById('zoom').addEventListener('input', (e) => {
  state.crops[PANELS[activePanel].id].zoom = Number(e.target.value);
  paint();
});
document.getElementById('offx').addEventListener('input', (e) => {
  state.crops[PANELS[activePanel].id].dx = Number(e.target.value);
  paint();
});
document.getElementById('offy').addEventListener('input', (e) => {
  state.crops[PANELS[activePanel].id].dy = Number(e.target.value);
  paint();
});
document.getElementById('role').addEventListener('input', (e) => {
  PANELS[activePanel].role = e.target.value.toUpperCase().slice(0, 14) || PANELS[activePanel].role;
  paint();
});
document.getElementById('export-square').addEventListener('click', () => downloadCover(1080, 1080, 'cover-1080x1080.png'));
document.getElementById('export-portrait').addEventListener('click', () => downloadCover(1080, 1350, 'cover-1080x1350.png'));
document.getElementById('export-wide').addEventListener('click', () => downloadCover(1920, 1080, 'cover-1920x1080.png'));

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async (sample, text, grade, layout, subtitle) => {
    photos[0] = await loadImage(`samples/${sample}.jpg`);
    photos[1] = await loadImage(`samples/${sample === 'pier' ? 'boulevard' : 'pier'}.jpg`);
    state = fillFromPhoto({ ...state, title: text, subtitle, grade, layout }, photos.length);
    document.getElementById('title').value = state.title;
    document.getElementById('subtitle').value = state.subtitle;
    document.querySelector(`input[name="grade"][value="${state.grade}"]`).checked = true;
    document.querySelector(`input[name="layout"][value="${state.layout}"]`).checked = true;
    paint();
  });
} else {
  // First run: load the pier sample so the preview is never blank.
  loadSample('pier');
}
