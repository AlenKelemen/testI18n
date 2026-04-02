import { elt } from './elt.js';

// Icon helper za font awesome klasne oznake
// name: ime ikone (npr. 'globe', 'bars', 'language')
// style: 'solid' (default), 'regular' ili 'brands'
export function icon(name, style = 'solid') {
  return elt('i', { class: `fa-${style} fa-${name}` });
}