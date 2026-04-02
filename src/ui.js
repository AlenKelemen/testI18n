// UI modul: definira HTML konstruktore za topbar, offcanvas panele i dropdown menu
// Koristi vlastite helper funkcije `elt` i `icon`, tj. vanjske funkcije za dom elemente
import i18n, { t } from './i18n.js';
import { elt } from './elt.js';
import { icon } from './icon.js';

// Vraća labelu jezika u topbaru
function langLabel() {
  return i18n.language === 'hr' ? 'HR' : 'EN';
}

// Prebacuje jezik i prijavljuje promjenu na i18n
async function toggleLang() {
  const current = i18n.language;
  const next = current === 'hr' ? 'en' : 'hr';
  await i18n.changeLanguage(next);
}

// Inicijalizira sve UI komponente (topbar, offcanvas, dropdown)
export function initUI() {
  // Dugme za legendu (lijevi topbar)
  const legendButton = elt('button', {
    class: 'btn btn-light btn-sm d-flex align-items-center gap-2',
    type: 'button',
    'data-bs-toggle': 'offcanvas',
    'data-bs-target': '#legendOffcanvas'
  }, [ icon('layer-group'), ' ' + t('legend') ]);

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
    elt('div', { class: 'offcanvas-body' }, [ elt('div', {}, 'Legend content...') ])
  ]);

  const toolsButton = elt('button', {
    class: 'btn btn-light btn-sm d-flex align-items-center gap-2 map-btn-square',
    type: 'button',
    'data-bs-toggle': 'offcanvas',
    'data-bs-target': '#toolsOffcanvas'
  }, [ icon('sliders') ]);

  const toolsTitle = elt('h5', { class: 'offcanvas-title' }, t('tools'));

  const mapToolsButton = elt('button', {
    class: 'accordion-button',
    type: 'button',
    'data-bs-toggle': 'collapse',
    'data-bs-target': '#collapseTools1'
  }, t('map_tools'));

  const selectButton = elt('button', { class: 'btn btn-outline-secondary btn-sm me-2' }, t('select'));
  const measureButton = elt('button', { class: 'btn btn-outline-secondary btn-sm me-2' }, t('measure'));

  // Offcanvas lijeve bočne trake za map tools (select + measure)
  const toolsOffcanvas = elt('div', {
    class: 'offcanvas offcanvas-start',
    id: 'toolsOffcanvas',
    tabindex: '-1'
  }, [
    elt('div', { class: 'offcanvas-header' }, [
      toolsTitle,
      elt('button', {
        class: 'btn-close',
        type: 'button',
        'data-bs-dismiss': 'offcanvas'
      })
    ]),
    elt('div', { class: 'offcanvas-body' }, [
      elt('div', { class: 'accordion', id: 'toolsAccordion' }, [
        elt('div', { class: 'accordion-item' }, [
          elt('h2', { class: 'accordion-header' }, [mapToolsButton]),
          elt('div', {
            id: 'collapseTools1',
            class: 'accordion-collapse collapse show',
            'data-bs-parent': '#toolsAccordion'
          }, [
            elt('div', { class: 'accordion-body' }, [ selectButton, measureButton ])
          ])
        ])
      ])
    ])
  ]);

  document.body.appendChild(legendOffcanvas);
  document.body.appendChild(toolsOffcanvas);

  const topbarLeft = elt('div', { class: 'map-topbar-left' }, [ legendButton, toolsButton ]);

  const langBtn = elt('button', {
    class: 'dropdown-item d-flex align-items-center gap-2',
    type: 'button',
    onclick: async () => { await toggleLang(); }
  }, [ icon('language'), ' ' + t('language') + ' ' + langLabel() ]);

  const printButton = elt('button', { class: 'dropdown-item d-flex align-items-center gap-2', type: 'button' }, [ icon('print'), ' ' + t('print') ]);
  const exportButton = elt('button', { class: 'dropdown-item d-flex align-items-center gap-2', type: 'button' }, [ icon('file-arrow-down'), ' ' + t('export') ]);
  const permanentLinkButton = elt('button', { class: 'dropdown-item d-flex align-items-center gap-2', type: 'button' }, [ icon('link'), ' ' + t('permanent_link') ]);
  const settingsButton = elt('button', { class: 'dropdown-item d-flex align-items-center gap-2', type: 'button' }, [ icon('gear'), ' ' + t('settings') ]);

  const menu = elt('div', { class: 'dropdown' }, [
    elt('button', { class: 'btn btn-success btn-sm', type: 'button', 'data-bs-toggle': 'dropdown', 'aria-expanded': 'false' }, icon('bars')),
    elt('ul', { class: 'dropdown-menu dropdown-menu-end' }, [
      elt('li', {}, printButton),
      elt('li', {}, exportButton),
      elt('li', {}, permanentLinkButton),
      elt('li', {}, langBtn),
      elt('li', {}, settingsButton)
    ])
  ]);

  const topbarRight = elt('div', { class: 'map-topbar-right' }, [ menu, elt('button', { class: 'btn btn-success btn-sm', type: 'button' }, icon('user')) ]);

  const bottombar = elt('div', { class: 'map-bottombar' }, [ elt('span', {}, '1:5000') ]);

  document.body.append(topbarLeft, topbarRight, bottombar);

  function renderUI() {
    legendButton.lastChild.textContent = ' ' + t('legend');
    legendTitle.textContent = t('legend');
    langBtn.lastChild.textContent = ' ' + t('language') + ' ' + langLabel();
    toolsTitle.textContent = t('tools');
    mapToolsButton.textContent = t('map_tools');
    selectButton.textContent = t('select');
    measureButton.textContent = t('measure');
    printButton.lastChild.textContent = ' ' + t('print');
    exportButton.lastChild.textContent = ' ' + t('export');
    permanentLinkButton.lastChild.textContent = ' ' + t('permanent_link');
    settingsButton.lastChild.textContent = ' ' + t('settings');
  }

  renderUI();

  i18n.on('languageChanged', () => {
    renderUI();
  });
}
