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
// i podržava izvore iz db.json strukture { sources: [], features: [] }
server.get('/features', (req, res, next) => {
  const db = router.db; // lowdb instanca
  let features = db.get('features').value() || [];
  const sources = db.get('sources').value() || [];

  const hasSourceFilter = 'source_id' in req.query;

  // Rezervirani query parametri koje ručno obrađujemo
  const RESERVED = new Set(['source_id', 'include_sources']);

  // Determine if caller requested sources in the response
  const includeSourcesParam = req.query.include_sources;
  const includeSources = includeSourcesParam === '1' || includeSourcesParam === 'true' || includeSourcesParam === 'yes';

  // Parametri koji su samo property filteri (nisu rezervirani)
  const propertyFilters = Object.entries(req.query).filter(([k]) => !RESERVED.has(k));

  if (hasSourceFilter) {
    features = features.filter((f) => f.source_id === req.query.source_id);
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

  // Priloži sources samo ako je eksplicitno zatraženo
  if (includeSources && sources.length > 0) {
    payload.sources = sources;
  }

  res.json(payload);
});

// optionalni endpoint za listu izvora (metadata)
server.get('/sources', (req, res) => {
  const db = router.db;
  const sources = db.get('sources').value() || [];
  res.json(sources);
});

// Standardni json-server endpointi, npr. /features (fallback)
server.use(router);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`JSON Server is running on http://localhost:${port}`);
  console.log(`GeoJSON endpoint: http://localhost:${port}/features`);
  console.log(`Source metadata endpoint: http://localhost:${port}/sources`);
});
