/**
 * elt(tag, props?, children?)
 *
 * Helper for creating DOM elements.
 *
 * props:
 * - class: string
 * - style: object (e.g. { width: '100px' })
 * - dataset: object (e.g. { id: 1 } → data-id="1")
 * - events: onclick, onchange, etc.
 * - other: set as attribute or property (id, title, checked...)
 *
 * children:
 * - string | number | element | array
 *
 * Examples:
 *
 * elt('div')
 *
 * elt('button', { class: 'btn btn-primary' }, 'Click')
 *
 * elt('input', { type: 'checkbox', checked: true })
 *
 * elt('div', {
 *   style: { color: 'red' }
 * }, 'Text')
 *
 * elt('button', {
 *   dataset: { action: 'save' },
 *   onclick: e => console.log(e.currentTarget.dataset.action)
 * }, 'Save')
 *
 * elt('div', {}, [
 *   elt('span', {}, 'A'),
 *   elt('span', {}, 'B')
 * ])
 */

export function elt(tag, props = {}, children = []) {
  const el = document.createElement(tag);

  for (const key in props) {
    const value = props[key];

    if (key === 'class') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.substring(2), value);
    } else if (key in el) {
      el[key] = value; // <-- važan dio
    } else {
      el.setAttribute(key, value);
    }
  }

  if (!Array.isArray(children)) children = [children];

  children.forEach(child => {
    if (child == null) return;
    el.appendChild(
      typeof child === 'string' || typeof child === 'number'
        ? document.createTextNode(child)
        : child
    );
  });

  return el;
}