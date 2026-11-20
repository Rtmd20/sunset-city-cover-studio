// Fixed scenes for screenshots: ?shot=cover shows the cover alone;
// ?shot=editor shows the page with a sample photo loaded. The query picks
// the sample photo, the title, the subtitle, the grade and the layout, so
// each screenshot is a different cover the app itself painted.
// window.__shotReady is set once the cover has been painted.
export async function runShot(shot, query, load) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await load(
    query.get('photo') ?? 'pier',
    query.get('caption') ?? 'Sundown Racket',
    query.get('grade') ?? 'sunset',
    query.get('layout') ?? 'over',
    query.get('subtitle') ?? 'Paid in Sunsets',
  );
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
