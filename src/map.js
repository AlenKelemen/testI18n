import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import OSM from 'ol/source/OSM.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { defaults as defaultControls } from 'ol/control';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import { createEmpty, extend as extendExtent } from 'ol/extent';
import { fromLonLat } from 'ol/proj.js';
import { fetchFeatures, fetchSources } from './api.js';

const baseLayer = new TileLayer({ source: new OSM() });

const map = new Map({
  target: 'map',
  layers: [baseLayer],
  view: new View({
    center: [1663262, 5145374],
    zoom: 7
  }),
  controls: defaultControls({ zoom: false })
});

function createStyleForLayer(layer) {
  const baseStyle = {
    stroke: new Stroke({ color: '#2f6f9a', width: 3 }),
    fill: new Fill({ color: 'rgba(47, 111, 154, 0.2)' }),
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: 'rgba(47, 111, 154, 0.9)' }),
      stroke: new Stroke({ color: '#fff', width: 1 })
    })
  };

  if (!layer || !layer.geom_type) {
    return new Style(baseStyle);
  }

  switch (layer.geom_type.toLowerCase()) {
    case 'linestring':
      return new Style({ stroke: new Stroke({ color: '#d44f4f', width: 4 }) });
    case 'point':
      return new Style(baseStyle);
    case 'polygon':
      return new Style({
        fill: new Fill({ color: 'rgba(31, 136, 63, 0.35)' }),
        stroke: new Stroke({ color: '#1f883f', width: 2 })
      });
    default:
      return new Style(baseStyle);
  }
}

function clearFeatureLayers() {
  const layers = map.getLayers();
  const existing = layers.getArray().slice();

  existing.forEach((l) => {
    if (l !== baseLayer) {
      layers.remove(l);
    }
  });
}

function normalizeFeatureCollection(data) {
  if (!data) return { type: 'FeatureCollection', features: [] };
  if (Array.isArray(data)) return { type: 'FeatureCollection', features: data };
  if (data.type === 'FeatureCollection' && Array.isArray(data.features)) return data;
  if (data.features && Array.isArray(data.features)) return { type: 'FeatureCollection', features: data.features };
  return { type: 'FeatureCollection', features: [] };
}

export async function loadGeoJSON() {
  try {
    const layersMeta = await fetchSources();

    // Attempt to compute initial view from available features (do not auto-add them)
    try {
      const allData = await fetchFeatures();
      const allFc = normalizeFeatureCollection(allData);
      const allFeatures = new GeoJSON().readFeatures(allFc, { featureProjection: 'EPSG:3857' });
      if (allFeatures && allFeatures.length) {
        const ex = createEmpty();
        for (const f of allFeatures) {
          const g = f.getGeometry();
          if (g) extendExtent(ex, g.getExtent());
        }
        // If extent is valid, fit view; otherwise fall back to Zagreb
        if (ex[0] !== Infinity) {
          map.getView().fit(ex, { padding: [50, 50, 50, 50], maxZoom: 16, duration: 400 });
        } else {
          map.getView().setCenter(fromLonLat([15.9770, 45.8144]));
          map.getView().setZoom(12);
        }
      } else {
        // no features, center on Zagreb
        map.getView().setCenter(fromLonLat([15.9770, 45.8144]));
        map.getView().setZoom(12);
      }
    } catch (e) {
      // ignore errors and set fallback center
      map.getView().setCenter(fromLonLat([15.9770, 45.8144]));
      map.getView().setZoom(12);
    }

    if (!Array.isArray(layersMeta) || layersMeta.length === 0) {
      // Legacy fallback: stari endpoint vraća FeatureCollection
      // Do not auto-add features on load. Let UI add layers explicitly via addLayerFromSource().
      return;
    }

    clearFeatureLayers();

    for (const layerDef of layersMeta) {
      if (layerDef.visible === false) continue;

      // Intentionally skip loading features here. Use addLayerFromSource(sourceId) to add on demand.
    }
  } catch (err) {
    console.error('Neuspjelo učitavanje GeoJSON-a:', err);
  }
}

export function getMap() {
  return map;
}

export async function addLayerFromSource(sourceId, applyStyle = true, filter = null) {
  // fetch source metadata (optional)
  let sourceMeta = null;
  try {
    const sources = await fetchSources();
    sourceMeta = sources.find(s => s.id === sourceId) || null;
  } catch (e) {
    // ignore metadata fetch errors
  }

  const data = await fetchFeatures({ source_id: sourceId });
  const fc = normalizeFeatureCollection(data);
  let features = new GeoJSON().readFeatures(fc, { featureProjection: 'EPSG:3857' });

  // optional client-side filtering (simple operators)
  if (filter && filter.field) {
    const op = (filter.op || 'eq').toString().toLowerCase();
    const rawVal = filter.value;
    features = features.filter((f) => {
      const prop = f.get(filter.field);
      if (prop === undefined || prop === null) return false;
      // numeric comparison if both can be numbers
      const numProp = Number(prop);
      const numVal = Number(rawVal);
      switch (op) {
        case 'contains':
          return String(prop).toLowerCase().includes(String(rawVal).toLowerCase());
        case 'gt':
        case '>':
          return !Number.isNaN(numProp) && !Number.isNaN(numVal) && numProp > numVal;
        case 'lt':
        case '<':
          return !Number.isNaN(numProp) && !Number.isNaN(numVal) && numProp < numVal;
        case 'gte':
        case '>=':
          return !Number.isNaN(numProp) && !Number.isNaN(numVal) && numProp >= numVal;
        case 'lte':
        case '<=':
          return !Number.isNaN(numProp) && !Number.isNaN(numVal) && numProp <= numVal;
        default:
          return String(prop) === String(rawVal);
      }
    });
  }

  const src = new VectorSource({ features });
  const layerOpts = { source: src, visible: sourceMeta?.visible !== false };
  if (applyStyle) {
    layerOpts.style = createStyleForLayer(sourceMeta);
  }
  const layer = new VectorLayer(layerOpts);

  layer.set('sourceId', sourceId);
  layer.set('title', sourceMeta?.title || sourceId);

  map.addLayer(layer);
  return layer;
}

export function removeLayerBySourceId(sourceId) {
  const layers = map.getLayers().getArray();
  const found = layers.find(l => l.get('sourceId') === sourceId);
  if (found) map.removeLayer(found);
}

// Remove layers that were automatically loaded on startup
export function removeAutoLoadedLayers() {
  const layers = map.getLayers().getArray().slice();
  for (const l of layers) {
    if (l !== baseLayer && l.get && l.get('autoLoaded')) {
      map.removeLayer(l);
    }
  }
}
