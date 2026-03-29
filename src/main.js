import i18n, { t } from './i18n.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import { defaults as defaultControls } from 'ol/control';
import 'ol/ol.css';
import './style.css';
import { elt } from './elt.js';



const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  }),
  controls: defaultControls({ zoom: false })
});

/* LEFT TOPBAR (tools placeholder) */
const topbarLeft = elt('div', { class: 'map-topbar-left' }, [
  elt('button', { class: 'btn btn-light btn-sm' }, 'Tool 1'),
  elt('button', { class: 'btn btn-light btn-sm' }, 'Tool 2')
]);

/* RIGHT TOPBAR (menu placeholder) */
const topbarRight = elt('div', { class: 'map-topbar-right' }, [
  elt('button', { class: 'btn btn-success btn-sm' }, '☰'),
  elt('button', { class: 'btn btn-success btn-sm' }, '👤')
]);

/* BOTTOM BAR */
const bottombar = elt('div', { class: 'map-bottombar' }, [
  elt('span', {}, '1:5000'),

  elt('select', { class: 'form-select form-select-sm' }, [
    elt('option', {}, 'Layer 1'),
    elt('option', {}, 'Layer 2')
  ])
]);

/* ADD TO DOM */
document.body.append(
  topbarLeft,
  topbarRight,
  bottombar
);

console.log(map);

/** for i18next
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
**/
