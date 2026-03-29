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

/* LEFT TOPBAR */
const legendButton = elt('button', {
  class: 'btn btn-light btn-sm d-flex align-items-center gap-2',
  type: 'button',
  'data-bs-toggle': 'offcanvas',
  'data-bs-target': '#legendOffcanvas'
}, [
  icon('layer-group'),
  ' ' + t('legend')
]);

const legendTitle = elt('h5', { class: 'offcanvas-title' }, t('legend'));

const legendOffcanvas = elt('div', {
  class: 'offcanvas offcanvas-start',
  id: 'legendOffcanvas',
  tabindex: '-1'
}, [
  elt('div', { class: 'offcanvas-header' }, [
    legendTitle,
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

/* RIGHT TOPBAR */
function langLabel() {
  return i18n.language === 'hr' ? 'HR' : 'EN';
}

async function toggleLang() {
  const current = i18n.language;
  const next = current === 'hr' ? 'en' : 'hr';
  await i18n.changeLanguage(next);
}

const langBtn = elt('button', {
  class: 'dropdown-item d-flex align-items-center gap-2',
  type: 'button',
  onclick: async () => {
    await toggleLang();
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
    elt('li', {}, elt('button', {
      class: 'dropdown-item d-flex align-items-center gap-2',
      type: 'button'
    }, [
      icon('print'),
      ' Ispis'
    ])),

    elt('li', {}, elt('button', {
      class: 'dropdown-item d-flex align-items-center gap-2',
      type: 'button'
    }, [
      icon('file-arrow-down'),
      ' Izvoz'
    ])),

    elt('li', {}, elt('button', {
      class: 'dropdown-item d-flex align-items-center gap-2',
      type: 'button'
    }, [
      icon('link'),
      ' Trajna veza'
    ])),

    elt('li', {}, langBtn),

    elt('li', {}, elt('button', {
      class: 'dropdown-item d-flex align-items-center gap-2',
      type: 'button'
    }, [
      icon('gear'),
      ' Postavke'
    ])),
  ])
]);

const topbarRight = elt('div', { class: 'map-topbar-right' }, [
  menu,
  elt('button', {
    class: 'btn btn-success btn-sm',
    type: 'button'
  }, icon('user'))
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

function renderUI() {
  legendButton.lastChild.textContent = ' ' + t('legend');
  legendTitle.textContent = t('legend');
  langBtn.lastChild.textContent = ' ' + langLabel();
}

renderUI();

i18n.on('languageChanged', () => {
  renderUI();
});

console.log(map);