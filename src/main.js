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
import { icon } from './icon.js';



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
const legendButton = elt('button', {
  class: 'btn btn-light btn-sm d-flex align-items-center gap-2',
  type: 'button',
  'data-bs-toggle': 'offcanvas',
  'data-bs-target': '#legendOffcanvas'
}, [
  icon('layer-group'),
  'Legenda'
]);
const legendOffcanvas = elt('div', {
  class: 'offcanvas offcanvas-start',
  id: 'legendOffcanvas',
  tabindex: '-1'
}, [
  elt('div', { class: 'offcanvas-header' }, [
    elt('h5', { class: 'offcanvas-title' }, 'Legenda'),
    elt('button', {
      class: 'btn-close',
      type: 'button',
      'data-bs-dismiss': 'offcanvas'
    })
  ]),

  elt('div', { class: 'offcanvas-body' }, [
    elt('div', {}, 'Legend content...')
  ])
]);
document.body.appendChild(legendOffcanvas);
const topbarLeft = elt('div', { class: 'map-topbar-left' }, [
  legendButton,
  elt('button', { class: 'btn btn-light btn-sm' }, 'Tool 2')
]);

/* RIGHT TOPBAR (menu placeholder) */
const langBtn = elt('button', {
  class: 'dropdown-item d-flex align-items-center gap-2',
  onclick: () => {
    toggleLang();
    langBtn.lastChild.textContent = ' ' + langLabel();
  }
}, [
  icon('language'),
  ' ' + langLabel()
]);
const menu = elt('div', { class: 'dropdown' }, [
  elt('button', {
    class: 'btn btn-success btn-sm',
    type: 'button',
    'data-bs-toggle': 'dropdown',
    'aria-expanded': 'false'
  }, icon('bars')),

  elt('ul', { class: 'dropdown-menu dropdown-menu-end' }, [

    elt('li', {}, elt('button', { class: 'dropdown-item' }, [
      icon('print'),
      ' Ispis'
    ])),

    elt('li', {}, elt('button', { class: 'dropdown-item' }, [
      icon('file-arrow-down'),
      ' Izvoz'
    ])),

    elt('li', {}, elt('button', { class: 'dropdown-item' }, [
      icon('link'),
      ' Trajna veza'
    ])),
    langBtn,
    elt('li', {}, elt('button', { class: 'dropdown-item' }, [
      icon('gear'),
      ' Postavke'
    ])),
  ])
]);

const topbarRight = elt('div', { class: 'map-topbar-right' }, [
  menu,
  elt('button', { class: 'btn btn-success btn-sm' }, icon('user'))
]);

/* BOTTOM BAR */
const bottombar = elt('div', { class: 'map-bottombar' }, [
  elt('span', {}, '1:5000')
]);

/* ADD TO DOM */
document.body.append(
  topbarLeft,
  topbarRight,
  bottombar
);

console.log(map);

function toggleLang() {
  const current = i18n.language;
  const next = current === 'hr' ? 'en' : 'hr';

  i18n.changeLanguage(next);
}
function langLabel() {
  return i18n.language === 'hr' ? 'HR' : 'EN';
}

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
