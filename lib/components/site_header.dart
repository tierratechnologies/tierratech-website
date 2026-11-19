import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

class SiteHeader extends StatelessComponent {
  const SiteHeader({super.key});

  @override
  Component build(BuildContext context) {
    return header(classes: 'site-header wrap', [
      a(
        classes: 'site-header__brand',
        href: '#main',
        attributes: {'aria-label': 'Tierra Technologies, top of page'},
        [
          img(src: '/images/tierra-wordmark-white.svg', alt: '', width: 131, height: 46),
        ],
      ),
      nav(
        classes: 'site-header__nav',
        attributes: {'aria-label': 'Main'},
        [
          a(href: '#approach', [.text('Approach')]),
          a(href: '#tools', [.text('Tools')]),
        ],
      ),
    ]);
  }
}
