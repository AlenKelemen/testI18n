import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import OSM from 'ol/source/OSM.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { defaults as defaultControls } from 'ol/control';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
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

export async function loadGeoJSON() {
  try {
    const layersMeta = await fetchSources();

    if (!Array.isArray(layersMeta) || layersMeta.length === 0) {
      // Legacy fallback: stari endpoint vraća FeatureCollection
      const data = await fetchFeatures();
      const source = new VectorSource({
        features: new GeoJSON().readFeatures(data, { featureProjection: 'EPSG:3857' })
      });
      const fallbackLayer = new VectorLayer({ source });
      map.addLayer(fallbackLayer);
      return;
    }

    clearFeatureLayers();

    for (const layerDef of layersMeta) {
      if (layerDef.visible === false) continue;

      const layerData = await fetchFeatures({ source_id: layerDef.id });
      const features = new GeoJSON().readFeatures(layerData, { featureProjection: 'EPSG:3857' });

      const source = new VectorSource({ features });
      const vectorLayer = new VectorLayer({
        source,
        style: createStyleForLayer(layerDef),
        visible: layerDef.visible !== false,
        properties: { sourceId: layerDef.id, title: layerDef.title }
      });
      console.log(source)
      map.addLayer(vectorLayer);
    }
  } catch (err) {
    console.error('Neuspjelo učitavanje GeoJSON-a:', err);
  }
}

export function getMap() {
  return map;
}
