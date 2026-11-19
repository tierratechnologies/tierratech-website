import 'package:jaspr/dom.dart';
import 'package:jaspr/jaspr.dart';

import 'components/approach.dart';
import 'components/hero.dart';
import 'components/site_footer.dart';
import 'components/site_header.dart';
import 'components/strengths.dart';
import 'components/tools_list.dart';

/// The one-page Tierra Technologies site.
class App extends StatelessComponent {
  const App({super.key});

  @override
  Component build(BuildContext context) {
    return .fragment([
      a(classes: 'skip-link', href: '#main', [.text('Skip to content')]),
      const SiteHeader(),
      main_(id: 'main', [
        const Hero(),
        div(classes: 'band band--paper', [
          const Strengths(),
          const Approach(),
        ]),
        div(classes: 'band band--white', [
          const ToolsList(),
        ]),
      ]),
      const SiteFooter(),
    ]);
  }
}
