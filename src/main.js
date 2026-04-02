import i18n from './i18n.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'ol/ol.css';
import './style.css';
import { initUI } from './ui.js';
import { loadGeoJSON } from './map.js';

async function initApp() {
  initUI();
  await i18n.changeLanguage(i18n.language || 'en');
  await loadGeoJSON();
}

initApp();
