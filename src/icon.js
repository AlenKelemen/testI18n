import { elt } from './elt.js';

export function icon(name, style = 'solid') {
  return elt('i', { class: `fa-${style} fa-${name}` });
}