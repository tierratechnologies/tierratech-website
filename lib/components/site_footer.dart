import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

class SiteFooter extends StatelessComponent {
  const SiteFooter({super.key});

  @override
  Component build(BuildContext context) {
    return footer(classes: 'site-footer wrap', [
      p(classes: 'site-footer__eyebrow', [.text('Made in New Zealand')]),
      h2([.text('A small team of Kiwis, working toward a brighter future.')]),
      div(classes: 'site-footer__base', [
        img(src: '/images/tierra-wordmark-white.svg', alt: 'Tierra Technologies', width: 114, height: 40),
        // No year: a build-time year goes stale because the site only rebuilds on deploy.
        p([.text('© Tierra Technologies Ltd')]),
      ]),
    ]);
  }
}
