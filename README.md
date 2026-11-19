# tierratech website

[![Netlify Status](https://api.netlify.com/api/v1/badges/079b2558-aa4b-47e2-9976-9e19a37f4a32/deploy-status)](https://app.netlify.com/sites/tierratechnz/deploys)

The Tierra Technologies website: a one-page static site built with [Jaspr](https://jaspr.site).
It is hosted on Netlify and deploys automatically when `main` is updated.

## Develop

You need Dart 3.13 and the Jaspr CLI 0.23.5:

```sh
dart pub global activate jaspr_cli 0.23.5
dart pub get
jaspr serve
```

The site runs at <http://localhost:8080>.

## Build

```sh
bash scripts/netlify-build.sh
```

This installs the pinned Dart and Jaspr versions if needed and writes the site to `build/jaspr/`.

## Where things live

- `lib/components/`: the page sections
- `lib/data/tools.dart`: the product list
- `web/styles.css`: the theme
- `web/`: fonts, images, icons and the 404 page
- `brand/`: master logo files
