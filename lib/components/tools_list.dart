import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

import '../data/tools.dart';

class ToolsList extends StatelessComponent {
  const ToolsList({super.key});

  @override
  Component build(BuildContext context) {
    return section(id: 'tools', classes: 'tools wrap', [
      h2([.text("What we've built")]),
      for (final tool in tools)
        article(classes: 'tool', [
          if (tool.logo case final logo?)
            div(classes: 'tool__logo', [
              h3([
                img(src: logo, alt: tool.name, width: 190, height: tool.logoHeight),
              ]),
            ])
          else
            h3(classes: 'tool__name', [.text(tool.name)]),
          p(classes: 'tool__description', [.text(tool.description)]),
          a(
            classes: 'tool__link',
            href: tool.url,
            attributes: {'aria-label': '${tool.linkLabel}: ${tool.name}'},
            [
              .text(tool.linkLabel),
            ],
          ),
        ]),
    ]);
  }
}
