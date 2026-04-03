// Mock server za local development: vraća GeoJSON podatke iz mock/db.json
// Koristi json-server paket za standardne REST endpointe 
// i custom endpoint /features za OpenLayers FeatureCollection.
const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);

// `features` endpoint vraća standardni FeatureCollection za OpenLayers
// i podržava slojeve iz db.json strukture { layers: [], features: [] }
server.get('/features', (req, res, next) => {
  const db = router.db; // lowdb instanca
  let features = db.get('features').value() || [];
  const layers = db.get('layers').value() || [];

  const hasLayerFilter = 'layer_id' in req.query;

  // Rezervirani query parametri koje ručno obrađujemo
  const RESERVED = new Set(['layer_id', 'include_layers']);

  // Determine if caller requested layers in the response
  const includeLayersParam = req.query.include_layers;
  const includeLayers = includeLayersParam === '1' || includeLayersParam === 'true' || includeLayersParam === 'yes';

  // Parametri koji su samo property filteri (nisu rezervirani)
  const propertyFilters = Object.entries(req.query).filter(([k]) => !RESERVED.has(k));

  if (hasLayerFilter) {
    features = features.filter((f) => f.layer_id === req.query.layer_id);
  }

  // Filtriraj po properties.* poljima (npr. ?diameter=100&material=PEHD)
  for (const [key, value] of propertyFilters) {
    features = features.filter((f) => {
      const prop = f.properties && f.properties[key];
      return String(prop) === String(value);
    });
  }

  const payload = {
    type: 'FeatureCollection',
    features
  };

  // Priloži layers samo ako je eksplicitno zatraženo
  if (includeLayers && layers.length > 0) {
    payload.layers = layers;
  }

  res.json(payload);
});

// optionalni endpoint za listu slojeva (metadata)
server.get('/layers', (req, res) => {
  const db = router.db;
  const layers = db.get('layers').value() || [];
  res.json(layers);
});

// Standardni json-server endpointi, npr. /features (fallback)
server.use(router);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`JSON Server is running on http://localhost:${port}`);
  console.log(`GeoJSON endpoint: http://localhost:${port}/features`);
  console.log(`Layer metadata endpoint: http://localhost:${port}/layers`);
});
