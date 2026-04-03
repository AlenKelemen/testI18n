# testI18n

Web application with an OpenLayers map, internationalization (i18next) and a mock API server returning GeoJSON data.

## What this project contains

- Vite as the build tool
- OpenLayers for the interactive map
- Bootstrap for UI components
- i18next for translations (Croatian / English)
- A small mock API (json-server) returning a GeoJSON FeatureCollection

## Mock API server

The project includes a custom mock server at `mock/server.js` (based on `json-server`). It exposes:

- `GET /features` — returns a GeoJSON FeatureCollection with features from `mock/db.json`.
- `GET /sources` — returns the source metadata array from `mock/db.json`.

Important change: `sources` is no longer automatically attached to the `/features` response. To include the `sources` array alongside the features, add the `include_sources` query parameter with a truthy value (accepted values: `1`, `true`, `yes`).

Examples:

- `GET /features` — returns only the FeatureCollection with `features`
- `GET /features?include_sources=1` — returns `features` and `sources`
- `GET /features?source_id=pipe1&include_sources=true` — filters by `source_id` and includes `sources`
- `GET /features?diameter=100` — filters features whose `properties.diameter` equals `100`

Filtering behavior:

- `source_id` — supported as a reserved query parameter to return features belonging to a specific source (e.g. `?source_id=pipe1`).
- Property filters — any other query parameter is treated as a property filter and matches features where `properties.<key>` equals the provided value (exact match).

Note: There is no advanced operator syntax implemented in the server yet (e.g. `__gt`) — only equality and the `source_id` filter. If you want range/comparison operators, that can be added quickly.

Example: fetch all features for a source

- Direct URL: `GET /features?source_id=pipes`
- With sources included: `GET /features?source_id=pipes&include_sources=1`
- curl:

  curl "http://localhost:3001/features?source_id=pipes"

- JavaScript (client helper):

  const data = await fetchFeatures({ source_id: 'pipes' });
  // with sources
  const dataWithSources = await fetchFeatures({ source_id: 'pipes', include_sources: '1' });

## Legend query UI (minimal)

A simple query UI was added to the Legend offcanvas that lets you add a layer for a given source with a lightweight filter. This is a quick way to preview and add filtered datasets without changing the server.

- UI controls:
  - Source select (choose a `source`)
  - Field select (populated from a sample feature's properties for the chosen source)
  - Operator select (`=`, `contains`, `>`, `<`)
  - Value input
  - Preview button (shows matching features count)
  - Add (`+`) button — adds a new Vector layer built from the chosen source and applies the simple filter client-side

- Filter format (client-side):
  - The client uses a simple filter object: { field: 'propName', op: 'contains'|'eq'|'gt'|'lt'|..., value: '...' }
  - When adding via the UI the application calls `addLayerFromSource(sourceId, applyStyle = true, filter)` where `filter` is the object above.
  - This filtering is performed client-side on the fetched features. It is intentionally simple (string contains and numeric comparisons) to keep the UI light.

- Preview: pressing Preview counts matching features locally and shows the result.

- Legend entry: when a filtered layer is added, the legend shows the layer title plus a short filter summary and a remove button that calls `removeLayerBySourceId(sourceId)`.

## Client helpers and behavior

- addLayerFromSource(sourceId, applyStyle = true, filter = null)
  - Adds a VectorLayer created from `GET /features?source_id=<sourceId>`
  - If `filter` is provided it will filter features client-side before adding
  - `applyStyle` controls whether a default style is applied

- removeLayerBySourceId(sourceId)
  - Removes the first layer with the matching `sourceId` property

- removeAutoLoadedLayers()
  - Helper to remove layers that were marked as auto-loaded. Note: the app no longer auto-adds feature layers on startup in the default flow; layers are expected to be added by the legend UI or programmatically.

- Initial map view
  - On startup the app attempts to compute an initial view extent from available features (fetched once) and fits the map to that extent. If no features are available the view falls back to Zagreb center and zoom.

## How to run

### Development

Open two terminals:

```bash
# Terminal 1: Mock server
npm run mock

# Terminal 2: Frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

### Build for production

```bash
npm run build
npm run preview  # test locally
```

## Project structure

```
testI18n/
├── mock/
│   ├── server.js      # Custom json-server with GeoJSON endpoint
│   └── db.json        # Test GeoJSON data
├── public/
│   └── locales/       # i18n translation files
├── src/
│   ├── api.js         # API helper functions
│   ├── main.js        # App initialization + OpenLayers
│   ├── i18n.js        # i18next configuration
│   └── ...
├── .env               # Development environment
├── .env.production    # Production environment (create if needed)
├── package.json
└── README.md
```

## Environment variables

### Development (`.env`)

```
VITE_API_BASE_URL=http://localhost:3001
```

### Production (`.env.production`)

```
VITE_API_BASE_URL=https://api.your-domain.com
```

## Notes on deploying to a real API

1. Create `.env.production` with the real API base URL
2. `npm run build`
3. Deploy the `dist/` folder to your server

## Test data

- Zagreb: [15.9819, 45.8150]
- Vienna: [16.3402, 48.2027]

Test data is stored in GeoJSON format with `properties` (e.g. `name`, `category`) and `geometry` (Point).

## Additional features

- Filtering via query params (exact match)
- Popup on feature click
- Multiple layers support (build layers from sources; source metadata available via `/sources`)

If you want operator filters (greater-than, less-than, etc.) implemented server-side (e.g. `field__gt=100`) I can add that quickly.
