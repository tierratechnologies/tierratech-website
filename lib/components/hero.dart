import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

class Hero extends StatelessComponent {
  const Hero({super.key});

  @override
  Component build(BuildContext context) {
    return section(classes: 'hero wrap', [
      div(classes: 'hero__mark', [
        div(classes: 'hero__circle', [
          img(
            src: '/images/tierra-ring-white.svg',
            alt: '',
            width: 1000,
            height: 1000,
            attributes: {'fetchpriority': 'high'},
          ),
          span(classes: 'hero__marker', attributes: {'role': 'img', 'aria-label': 'Auckland, New Zealand'}, []),
          h1([.text('Tools for'), br(), .text('people.')]),
        ]),
      ]),
      div(classes: 'hero__intro', [
        p([
          .text(
            'We build software and AI tools that handle the heavy lifting, '
            'so people can get on with the parts that need a person.',
          ),
        ]),
        a(classes: 'button', href: '#tools', [.text('See our tools')]),
        // Revealed by globe.js once the globe is ready.
        p(classes: 'hero__hint', attributes: {'hidden': ''}, [.text('Drag the globe to spin it.')]),
      ]),
    ]);
  }
}
