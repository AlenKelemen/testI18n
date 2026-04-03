// UI modul: definira HTML konstruktore za topbar, offcanvas panele i dropdown menu
// Koristi vlastite helper funkcije `elt` i `icon`, tj. vanjske funkcije za dom elemente
import i18n, { t } from './i18n.js';
import { elt } from './elt.js';
import { icon } from './icon.js';
import { fetchSources, fetchFeatures } from './api.js';
import { addLayerFromSource, removeLayerBySourceId } from './map.js';

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
  }, [icon('layer-group'), ' ' + t('legend')]);

  const legendTitle = elt('h5', { class: 'offcanvas-title' }, t('legend'));

  // Legend offcanvas with add-layer + simple query control
  const sourceSelect = elt('select', { class: 'form-select form-select-sm' }, [elt('option', { value: '' }, t('loading'))]);
  const addSourceBtn = elt('button', { class: 'btn btn-primary btn-sm ms-2', type: 'button', title: t('add_layer') }, '+');
  // simple filter inputs: field, operator, value, preview
  const fieldSelect = elt('select', { class: 'form-select form-select-sm me-1', style: 'min-width:120px' }, [elt('option', { value: '' }, t('select_field') || 'Field')]);
  const opSelect = elt('select', { class: 'form-select form-select-sm me-1', style: 'min-width:90px' }, [
    elt('option', { value: 'eq' }, '='),
    elt('option', { value: 'contains' }, 'contains'),
    elt('option', { value: 'gt' }, '>'),
    elt('option', { value: 'lt' }, '<')
  ]);
  const valueInput = elt('input', { class: 'form-control form-control-sm me-1', placeholder: t('value') || 'Value' });
  const previewBtn = elt('button', { class: 'btn btn-outline-secondary btn-sm me-1', type: 'button' }, t('preview') || 'Preview');
  const addRow = elt('div', { class: 'd-flex mb-2 gap-1' }, [sourceSelect, addSourceBtn]);
  const filterRow = elt('div', { class: 'd-flex mb-2' }, [fieldSelect, opSelect, valueInput, previewBtn]);

  const layersList = elt('div', { id: 'legendLayersList' }, []);

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
    elt('div', { class: 'offcanvas-body' }, [addRow, filterRow, layersList])
  ]);

  // Populate sources into select
  async function populateSources() {
    try {
      sourceSelect.innerHTML = '';
      const sources = await fetchSources();
      sourceSelect.appendChild(elt('option', { value: '' }, t('select_source')));
      for (const s of sources) {
        sourceSelect.appendChild(elt('option', { value: s.id }, (s.title || s.id)));
      }
    } catch (err) {
      sourceSelect.innerHTML = '';
      sourceSelect.appendChild(elt('option', { value: '' }, 'Error loading sources'));
    }
  }

  // Populate fieldSelect when source changes (sample properties)
  sourceSelect.addEventListener('change', async () => {
    const id = sourceSelect.value;
    fieldSelect.innerHTML = '';
    fieldSelect.appendChild(elt('option', { value: '' }, t('select_field') || 'Field'));
    if (!id) return;
    try {
      const data = await fetchFeatures({ source_id: id });
      const features = Array.isArray(data) ? data : (data.features || []);
      const sample = features[0] || {};
      const props = sample.properties || sample || {};
      const keys = Object.keys(props || {});
      for (const k of keys) fieldSelect.appendChild(elt('option', { value: k }, k));
    } catch (e) {
      // ignore
    }
  });

  // Preview button: show how many features match the simple filter
  previewBtn.addEventListener('click', async () => {
    const id = sourceSelect.value; if (!id) return;
    try {
      const data = await fetchFeatures({ source_id: id });
      const items = Array.isArray(data) ? data : (data.features || []);
      const field = fieldSelect.value; const op = opSelect.value; const val = valueInput.value;
      let matched = items;
      if (field) {
        matched = items.filter((it) => {
          const props = it.properties || it;
          const prop = props[field];
          if (prop === undefined || prop === null) return false;
          if (op === 'contains') return String(prop).toLowerCase().includes(String(val).toLowerCase());
          if (op === 'gt') return Number(prop) > Number(val);
          if (op === 'lt') return Number(prop) < Number(val);
          return String(prop) === String(val);
        });
      }
      alert((t('matching_features') || 'Matching features') + ': ' + matched.length);
    } catch (e) {
      console.error(e);
      alert(t('error_loading_features') || 'Error loading features');
    }
  });

  // Add layer button behavior (uses client-side simple filter)
  addSourceBtn.addEventListener('click', async () => {
    const id = sourceSelect.value;
    if (!id) return;
    const filter = fieldSelect.value ? { field: fieldSelect.value, op: opSelect.value, value: valueInput.value } : null;
    try {
      const layer = await addLayerFromSource(id, true, filter);
      const title = layer.get('title') || id;
      const item = elt('div', { class: 'd-flex align-items-center justify-content-between mb-1' }, [
        elt('span', {}, title + (filter ? ` (${fieldSelect.value} ${opSelect.value} ${valueInput.value})` : '')),
        elt('div', {}, [elt('button', { class: 'btn btn-sm btn-outline-danger', type: 'button', onclick: () => { removeLayerBySourceId(id); item.remove(); } }, t('remove'))])
      ]);
      layersList.appendChild(item);
    } catch (err) {
      console.error('Failed to add layer from source', err);
    }
  });

  // Populate when legend opens
  legendOffcanvas.addEventListener('show.bs.offcanvas', () => {
    populateSources();
  });

  const toolsButton = elt('button', {
    class: 'btn btn-light btn-sm d-flex align-items-center gap-2 map-btn-square',
    type: 'button',
    'data-bs-toggle': 'offcanvas',
    'data-bs-target': '#toolsOffcanvas'
  }, [icon('sliders')]);

  const toolsTitle = elt('h5', { class: 'offcanvas-title' }, t('tools'));

  const mapToolsButton = elt('button', {
    class: 'accordion-button w-100',
    type: 'button',
    'data-bs-toggle': 'collapse',
    'data-bs-target': '#collapseTools1'
  }, t('map_tools'));

  const selectButton = elt('button', { class: 'btn btn-outline-secondary btn-sm w-100 mb-2' }, t('select'));
  const measureButton = elt('button', { class: 'btn btn-outline-secondary btn-sm w-100 mb-2' }, t('measure'));

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
      elt('div', { class: 'accordion accordion-flush', id: 'toolsAccordion' }, [
        elt('div', { class: 'accordion-item w-100' }, [
          elt('h2', { class: 'accordion-header' }, [mapToolsButton]),
          elt('div', {
            id: 'collapseTools1',
            class: 'accordion-collapse collapse show',
            'data-bs-parent': '#toolsAccordion'
          }, [
            elt('div', { class: 'accordion-body px-0 py-2' }, [selectButton, measureButton])
          ])
        ])
      ])
    ])
  ]);

  document.body.appendChild(legendOffcanvas);
  document.body.appendChild(toolsOffcanvas);

  const topbarLeft = elt('div', { class: 'map-topbar-left' }, [legendButton, toolsButton]);

  const langBtn = elt('button', {
    class: 'dropdown-item d-flex align-items-center gap-2',
    type: 'button',
    onclick: async () => { await toggleLang(); }
  }, [icon('language'), ' ' + t('language') + ' ' + langLabel()]);

  const printButton = elt('button', { class: 'dropdown-item d-flex align-items-center gap-2', type: 'button' }, [icon('print'), ' ' + t('print')]);
  const exportButton = elt('button', { class: 'dropdown-item d-flex align-items-center gap-2', type: 'button' }, [icon('file-arrow-down'), ' ' + t('export')]);
  const permanentLinkButton = elt('button', { class: 'dropdown-item d-flex align-items-center gap-2', type: 'button' }, [icon('link'), ' ' + t('permanent_link')]);
  const settingsButton = elt('button', { class: 'dropdown-item d-flex align-items-center gap-2', type: 'button' }, [icon('gear'), ' ' + t('settings')]);

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

  const topbarRight = elt('div', { class: 'map-topbar-right' }, [menu, elt('button', { class: 'btn btn-success btn-sm', type: 'button' }, icon('user'))]);

  const bottombar = elt('div', { class: 'map-bottombar' }, [elt('span', {}, '1:5000')]);

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
