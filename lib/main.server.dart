/// Entrypoint for pre-rendering. The site ships as static HTML with no client-side Dart.
library;

import 'package:jaspr/dom.dart';
import 'package:jaspr/server.dart';

import 'app.dart';
import 'main.server.options.dart';

const _siteUrl = 'https://tierratech.nz/';
const _title = 'Tierra Technologies | Tools for people';
const _description = 'Tierra Technologies builds software and AI tools for people. Made in New Zealand.';

void main() {
  Jaspr.initializeApp(options: defaultServerOptions);

  runApp(
    Document(
      title: _title,
      lang: 'en-NZ',
      meta: const {
        'description': _description,
        'theme-color': '#211F1F',
        'twitter:card': 'summary_large_image',
        'twitter:title': _title,
        'twitter:description': _description,
        'twitter:image': '${_siteUrl}images/og-image.png',
      },
      head: const [
        link(rel: 'canonical', href: _siteUrl),
        link(rel: 'icon', href: '/favicon.ico', attributes: {'sizes': '48x48'}),
        link(rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml'),
        link(rel: 'apple-touch-icon', href: '/apple-touch-icon.png'),
        link(
          rel: 'preload',
          href: '/fonts/league-spartan-700.woff2',
          as: 'font',
          type: 'font/woff2',
          attributes: {'crossorigin': ''},
        ),
        link(rel: 'stylesheet', href: '/styles.css'),
        script(src: '/globe.js', attributes: {'type': 'module'}),
        meta(attributes: {'property': 'og:type', 'content': 'website'}),
        meta(attributes: {'property': 'og:site_name', 'content': 'Tierra Technologies'}),
        meta(attributes: {'property': 'og:locale', 'content': 'en_NZ'}),
        meta(attributes: {'property': 'og:url', 'content': _siteUrl}),
        meta(attributes: {'property': 'og:title', 'content': _title}),
        meta(attributes: {'property': 'og:description', 'content': _description}),
        meta(attributes: {'property': 'og:image', 'content': '${_siteUrl}images/og-image.png'}),
        meta(attributes: {'property': 'og:image:width', 'content': '1200'}),
        meta(attributes: {'property': 'og:image:height', 'content': '630'}),
        meta(
          attributes: {
            'property': 'og:image:alt',
            'content': 'Tools for people, inside the stippled Tierra Technologies circle',
          },
        ),
      ],
      body: const App(),
    ),
  );
}
