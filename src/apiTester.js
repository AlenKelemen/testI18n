// Jednostavni API Tester panel za testiranje mock/server.js endpointa
import { elt } from './elt.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export function initApiTester() {
  // Output prikaz
  const output = elt('pre', {
    style: {
      maxHeight: '260px',
      overflowY: 'auto',
      fontSize: '11px',
      background: '#1e1e1e',
      color: '#d4d4d4',
      padding: '8px',
      borderRadius: '4px',
      margin: '0',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all'
    }
  }, '...');

  // Endpoint select
  const endpointSelect = elt('select', { class: 'form-select form-select-sm' }, [
    elt('option', { value: '/features' }, 'GET /features'),
    elt('option', { value: '/sources' }, 'GET /sources'),
  ]);

  // Query string input (npr. "layer_id=pipes&diameter=100")
  const queryInput = elt('input', {
    type: 'text',
    class: 'form-control form-control-sm',
    placeholder: 'Query: source_id=pipes&diameter=100',
  });

  // URL preview
  const urlPreview = elt('small', {
    style: { color: '#888', wordBreak: 'break-all', display: 'block', marginBottom: '4px' }
  }, `${API_BASE}/features`);

  function updatePreview() {
    const q = queryInput.value.trim();
    urlPreview.textContent = API_BASE + endpointSelect.value + (q ? '?' + q : '');
  }

  endpointSelect.addEventListener('change', updatePreview);
  queryInput.addEventListener('input', updatePreview);

  // Gumb za slanje
  const sendBtn = elt('button', { class: 'btn btn-primary btn-sm w-100', type: 'button' }, 'Pošalji');

  sendBtn.addEventListener('click', async () => {
    const q = queryInput.value.trim();
    const url = API_BASE + endpointSelect.value + (q ? '?' + q : '');
    output.textContent = 'Učitavam...';
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      output.textContent = 'Greška: ' + err.message;
    }
  });

  // Cijeli panel
  const panel = elt('div', {
    style: {
      position: 'fixed',
      bottom: '36px',
      right: '12px',
      width: '340px',
      background: '#fff',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      zIndex: '2000',
      overflow: 'hidden'
    }
  }, [
    elt('div', {
      style: {
        background: '#2f6f9a',
        color: '#fff',
        padding: '6px 12px',
        fontWeight: 'bold',
        fontSize: '13px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer'
      }
    }, [
      elt('span', {}, 'API Tester'),
      elt('span', { style: { fontSize: '16px' } }, '−')
    ]),
    elt('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' } }, [
      urlPreview,
      endpointSelect,
      queryInput,
      sendBtn,
      output
    ])
  ]);

  // Toggle collapse na header klik
  const header = panel.querySelector('div');
  const body = panel.children[1];
  const toggle = header.querySelector('span:last-child');
  let collapsed = false;

  header.addEventListener('click', () => {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'flex';
    toggle.textContent = collapsed ? '+' : '−';
  });

  document.body.appendChild(panel);
}
