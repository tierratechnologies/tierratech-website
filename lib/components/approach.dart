import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

class Approach extends StatelessComponent {
  const Approach({super.key});

  static const _principles = [
    ('We start with the work', 'Every tool begins with a real job and the person doing it.'),
    ('We use AI on purpose', 'It goes where it saves effort or improves the result, and nowhere else.'),
    ('People stay in control', "Our tools support decisions. They don't take them away."),
  ];

  @override
  Component build(BuildContext context) {
    return section(id: 'approach', classes: 'approach wrap', [
      h2([.text('Useful first. Clever second.')]),
      div(classes: 'approach__list', [
        for (final (title, body) in _principles)
          div(classes: 'approach__item', [
            h3([.text(title)]),
            p([.text(body)]),
          ]),
      ]),
    ]);
  }
}
