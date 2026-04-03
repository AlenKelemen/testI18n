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
- `GET /layers` — returns the layer metadata array from `mock/db.json`.

Important change: `layers` is no longer automatically attached to the `/features` response. To include the `layers` array alongside the features, add the `include_layers` query parameter with a truthy value (accepted values: `1`, `true`, `yes`).

Examples:

- `GET /features` — returns only the FeatureCollection with `features`
- `GET /features?include_layers=1` — returns `features` and `layers`
- `GET /features?layer_id=pipe1&include_layers=true` — filters by `layer_id` and includes `layers`
- `GET /features?diameter=100` — filters features whose `properties.diameter` equals `100`

Filtering behavior:

- `layer_id` — supported as a reserved query parameter to return features belonging to a specific layer (e.g. `?layer_id=pipe1`).
- Property filters — any other query parameter is treated as a property filter and matches features where `properties.<key>` equals the provided value (exact match).

Note: There is no advanced operator syntax implemented in the server yet (e.g. `__gt`) — only equality and the `layer_id` filter. If you want range/comparison operators, that can be added quickly.

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
- Multiple layers support (metadata available via `/layers`)

If you want operator filters (greater-than, less-than, etc.), I can add a simple convention (e.g. `field__gt=100`) and update the server implementation.
