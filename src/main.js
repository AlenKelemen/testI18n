import i18n, { t } from './i18n.js';
document.body.innerHTML = `
  <h1 id="title"></h1>
  <button id="hr">HR</button>
  <button id="en">EN</button>
  <p id="zoomIn"></p>
`;
function render() {
  document.getElementById('title').textContent = t('app.title');
  document.getElementById('zoomIn').textContent = t('map.zoom_in');
}
document.getElementById('hr').addEventListener('click', async () => {
  await i18n.changeLanguage('hr');
  render();
});

document.getElementById('en').addEventListener('click', async () => {
  await i18n.changeLanguage('en');
  render();
});

render();