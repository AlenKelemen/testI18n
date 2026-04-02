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
server.get('/features', (req, res, next) => {
  const db = router.db; // lowdb instanca
  const features = db.get('features').value() || [];

  // Ako postoje query parametri, json-server će ih obrađivati dalje
  if (Object.keys(req.query).length > 0) {
    return next();
  }

  res.json({
    type: 'FeatureCollection',
    features
  });
});

// Standardni json-server endpointi, npr. /features (fallback)
server.use(router);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`JSON Server is running on http://localhost:${port}`);
  console.log(`GeoJSON endpoint: http://localhost:${port}/geojson`);
});
