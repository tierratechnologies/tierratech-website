import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

/// The two side-by-side panels: what people bring, and what technology brings.
class Strengths extends StatelessComponent {
  const Strengths({super.key});

  @override
  Component build(BuildContext context) {
    return section(
      classes: 'strengths wrap',
      attributes: {'aria-label': 'What people bring and what technology brings'},
      [
        _panel(
          'People bring',
          const ['Judgement', 'Context', 'Care', 'Genuine ideas'],
          'panel--people',
          // A stippled profile of a person, in the style of the logo's speckled ring.
          img(
            classes: 'panel__specks panel__specks--profile',
            src: '/images/people-profile-white.svg',
            alt: '',
            width: 1000,
            height: 1270,
            loading: MediaLoading.lazy,
          ),
        ),
        _panel(
          'Technology and AI bring',
          const ['Speed', 'Memory', 'Patience', 'Incredible power'],
          'panel--technology',
          img(
            classes: 'panel__specks',
            src: '/images/tierra-specks-black.svg',
            alt: '',
            width: 1000,
            height: 1000,
            loading: MediaLoading.lazy,
          ),
        ),
      ],
    );
  }

  Component _panel(String label, List<String> items, String modifier, Component decoration) {
    return div(classes: 'panel $modifier', [
      decoration,
      p(classes: 'panel__label', [.text(label)]),
      ul(classes: 'panel__list', [
        for (final item in items) li([.text(item)]),
      ]),
    ]);
  }
}
