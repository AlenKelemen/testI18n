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
