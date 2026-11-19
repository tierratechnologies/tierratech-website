/// A product shown in the "What we've built" list. Add an entry here to add a product.
class Tool {
  const Tool({
    required this.name,
    required this.description,
    required this.linkLabel,
    required this.url,
    this.logo,
    this.logoHeight = 45,
  });

  final String name;
  final String description;
  final String linkLabel;
  final String url;

  /// Optional logo, shown on a black tile in place of the product name.
  final String? logo;

  /// The logo's height when it is 190 wide.
  final int logoHeight;
}

const tools = [
  Tool(
    name: 'Logmate',
    description:
        'An NZTA approved electronic work-time management system for drivers and operators across New Zealand.',
    linkLabel: 'Find out more',
    url: 'https://logmate.co.nz',
    logo: '/images/logmate.jpg',
  ),
  Tool(
    name: 'Regula',
    description: "It's time online payments got real.",
    linkLabel: 'Watch this space',
    url: 'https://regula.nz',
    logo: '/images/regula-white.svg',
    logoHeight: 56,
  ),
];
