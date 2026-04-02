import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import OSM from 'ol/source/OSM.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { defaults as defaultControls } from 'ol/control';
import { fetchFeatures } from './api.js';

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({ source: vectorSource });

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({ source: new OSM() }),
    vectorLayer
  ],
  view: new View({
    center: [1663262, 5145374],
    zoom: 7
  }),
  controls: defaultControls({ zoom: false })
});

export async function loadGeoJSON() {
  try {
    const geojson = await fetchFeatures();
    console.log('GeoJSON data:', geojson);

    const features = new GeoJSON().readFeatures(geojson, {
      featureProjection: 'EPSG:3857'
    });

    vectorSource.clear();
    vectorSource.addFeatures(features);
  } catch (err) {
    console.error('Neuspjelo učitavanje GeoJSON-a:', err);
  }
}

export function getMap() {
  return map;
}
