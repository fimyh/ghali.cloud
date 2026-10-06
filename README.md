# Ghali Cloud multilingual HTMX website

Languages: English (`en`), French (`fr`) and Arabic (`ar`). Arabic automatically enables RTL layout.

## Run

```bash
npx serve .
```

Open `http://localhost:3000/?lang=en`, `?lang=fr`, or `?lang=ar`. The selected language is stored in `localStorage`.

## Validate

```bash
npx html-validate index.html partials/*/*.html
node --check assets/js/app.js
npx csstree-validator assets/css/app.css
```
