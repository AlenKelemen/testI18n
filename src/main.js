import i18n, { t } from './i18n.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

document.body.innerHTML = `
<div class="container-fluid">
  <h1 id="title"></h1>
  <button id="hr" class="btn btn-primary">HR</button>
  <button id="en" class="btn btn-primary">EN</button>
  <p id="zoomIn"></p>
</div>
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