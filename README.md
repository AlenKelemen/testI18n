# testI18n

Web aplikacija s OpenLayers kartom, internacionalizacijom (i18next) i mock API serverom za GeoJSON podatke.

## Šta je napravljeno

### 1. Osnovna postavka
- **Vite** kao build tool
- **OpenLayers** za interaktivnu kartu
- **Bootstrap** za UI komponente
- **i18next** za internacionalizaciju (hrvatski/engleski)

### 2. Mock API server
- **json-server** za simulaciju REST API-ja
- Custom server (`mock/server.js`) koji vraća GeoJSON `FeatureCollection`
- Endpoint `/features` za dohvat točaka na karti
- Testni podaci: Zagreb i Beč u `mock/db.json`

### 3. API apstrakcija
- `src/api.js`: jedinstvena funkcija `fetchFeatures()` za API pozive
- Environment varijable za jednostavan prelazak između development/production
- Podrška za query parametre (filtriranje)

### 4. Korisnički interfejs
- **Topbar lijevo**: Legend dugme (offcanvas panel)
- **Topbar desno**: Menu s opcijama (print, export, permanent link, settings, language toggle)
- **Tools panel**: Map tools (select, measure) u offcanvas panelu
- **Bottom bar**: Trenutna skala karte (1:5000)
- **Centralna mapa**: OpenLayers karta s GeoJSON točkama
- **Internacionalizacija**: Svi tekstovi prevedeni na hrvatski/engleski

### 5. Frontend integracija
- OpenLayers karta s VectorLayer za prikaz GeoJSON točaka
- Automatsko učitavanje podataka pri pokretanju
- Centriranje karte na područje Zagreba i Beča

## Kako pokrenuti

### Development
```bash
# Terminal 1: Mock server
npm run mock

# Terminal 2: Frontend
npm run dev
```

Otvori `http://localhost:3000` u browseru.

### Build za produkciju
```bash
npm run build
npm run preview  # Test lokalno
```

## Struktura projekta

```
testI18n/
├── mock/
│   ├── server.js      # Custom json-server sa GeoJSON endpointom
│   └── db.json        # Testni GeoJSON podaci
├── public/
│   └── locales/       # Prijevodi za i18n
├── src/
│   ├── api.js         # API funkcije
│   ├── main.js        # Glavna logika + OpenLayers
│   ├── i18n.js        # i18next konfiguracija
│   └── ...
├── .env               # Development environment
├── .env.production    # Production environment (kreiraj)
├── package.json
└── README.md
```

## Environment varijable

### Development (`.env`)
```
VITE_API_BASE_URL=http://localhost:3001
```

### Production (`.env.production`)
```
VITE_API_BASE_URL=https://api.tvojdomain.com
```

## Prelazak na pravi API

1. Kreiraj `.env.production` sa pravim API URL-om
2. `npm run build`
3. Deploy `dist/` folder na server
4. Kod se ne mijenja - samo environment varijabla!

## Testni podaci

- **Zagreb**: [15.9819, 45.8150]
- **Beč**: [16.3402, 48.2027]

Podaci su u GeoJSON formatu sa `properties` (name, category) i `geometry` (Point).

## Dodatne mogućnosti

- Filtriranje: `fetchFeatures({ category: 'example' })`
- Popup na klik točke
- Više slojeva na karti
- Custom styling točaka
