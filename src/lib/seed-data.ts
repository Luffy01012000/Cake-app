export interface SeedFaq {
  question: string;
  answer: string;
  order: number;
}

export interface SeedCake {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  occasion: string;
  price: number;
  image: string;
  imageAlt: string;
  imageCaption: string;
  finishColor: string;
  swatchName: string;
  servings: string;
  tiers: number;
  isNew: boolean;
  flavors: string[];
  description: string;
  tastingNotes: string[];
  dimensions: string;
  leadTime: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogImage?: string;
  rawJsonLd?: string;
  faqs: SeedFaq[];
}

export interface SeedPageSeo {
  path: string;
  title: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogImage?: string;
  rawJsonLd?: string;
  noIndex?: boolean;
  faqs: SeedFaq[];
}

export const SEED_CAKES: SeedCake[] = [
  {
    id: "elysian-wedding-tier",
    slug: "elysian-wedding-tier",
    name: "The Elysian Grand Tier",
    tagline: "Architectural purity crafted for eternal vows.",
    occasion: "Weddings",
    price: 680,
    image: "/images/wedding_cake.jpg",
    imageAlt: "Architectural 3-tier ivory luxury wedding cake with 24k gold leaf and hand-sculpted sugar flowers",
    imageCaption: "The Elysian Grand Tier wedding cake styled for a luxury bridal reception",
    finishColor: "#f0e4d3",
    swatchName: "Starlight Ivory",
    servings: "65–80 guests",
    tiers: 3,
    isNew: true,
    flavors: ["Tahitian Vanilla Bean", "Champagne Strawberry Ganache", "French Buttercream"],
    description: "An awe-inspiring 3-tier centerpiece cloaked in immaculate ivory fondant, hand-applied 24k gold leaf flecks, and delicate sculpted wafer-paper ranunculus blooms.",
    tastingNotes: ["Floral Madagascar vanilla", "Sparkling rosé champagne notes", "Velvety whipped ganache"],
    dimensions: "10\" base, 8\" middle, 6\" crown — 24\" height",
    leadTime: "7 days minimum",
    metaTitle: "The Elysian Grand Tier | Luxury Architectural Wedding Cake | AURA",
    metaDescription: "Discover The Elysian Grand Tier: a handcrafted 3-tier architectural wedding cake adorned with pure ivory fondant, 24k gold leaf flecks, and delicate sugar florals. Serves 65-80 guests.",
    canonicalUrl: "https://aurapatisserie.com/cakes/elysian-wedding-tier",
    ogImage: "/images/wedding_cake.jpg",
    faqs: [
      {
        question: "How far in advance should we order The Elysian Grand Tier wedding cake?",
        answer: "We recommend reserving at least 7 to 14 days in advance, though prime wedding season slots often fill 3 to 6 months ahead.",
        order: 1,
      },
      {
        question: "Can we request a private tasting consultation for this wedding cake?",
        answer: "Yes, our Private Tasting Flight Experience couriers 6 signature flavor sponges and fillings straight to your home, 100% credited toward your wedding cake.",
        order: 2,
      },
      {
        question: "What dietary accommodations are available for wedding guests?",
        answer: "We offer gluten-free and dairy-conscious tiers upon request during your bespoke consultation.",
        order: 3,
      },
    ],
  },
  {
    id: "blush-seraphina-birthday",
    slug: "blush-seraphina-birthday",
    name: "The Seraphina Blush",
    tagline: "A celebration of another magnificent year around the sun.",
    occasion: "Birthdays",
    price: 195,
    image: "/images/birthday_cake.jpg",
    imageAlt: "The Seraphina Blush minimalist pink velvet birthday cake with wild mountain raspberries and gold leaf dust",
    imageCaption: "Single tier modern architectural birthday cake in blush rose velvet cocoa butter spray",
    finishColor: "#e8d0d0",
    swatchName: "Blush Rose",
    servings: "14–18 guests",
    tiers: 1,
    isNew: true,
    flavors: ["Valrhona White Chocolate", "Wild Mountain Raspberry", "Lychee Blossom"],
    description: "Modern minimalist single-tier masterpiece finished in soft pink velvet cocoa butter spray, fluid architectural piping, wild organic strawberries, and gold leaf dust.",
    tastingNotes: ["Tart alpine raspberries", "Subtle lychee perfume", "Melt-in-mouth cocoa butter velvet"],
    dimensions: "8\" diameter — 7\" height",
    leadTime: "48 hours",
    metaTitle: "The Seraphina Blush | Modern Luxury Birthday Cake | AURA",
    metaDescription: "Order The Seraphina Blush single-tier celebration cake. Finished in delicate cocoa butter velvet with Valrhona white chocolate, wild raspberry, and gold leaf dust. Serves 14-18.",
    canonicalUrl: "https://aurapatisserie.com/cakes/blush-seraphina-birthday",
    ogImage: "/images/birthday_cake.jpg",
    faqs: [
      {
        question: "Can we include a custom birthday inscription?",
        answer: "Yes, complimentary custom chocolate plaque inscriptions up to 40 characters can be added during order configuration.",
        order: 1,
      },
      {
        question: "What is the shelf life and storage recommendation?",
        answer: "Store chilled at 4°C and bring to room temperature 30 minutes prior to serving for maximum velvet flavor release.",
        order: 2,
      },
    ],
  },
  {
    id: "nocturne-anniversary-velvet",
    slug: "nocturne-anniversary-velvet",
    name: "The Nocturne Reserve",
    tagline: "Deep, sensual, and unforgettable tribute to timeless love.",
    occasion: "Anniversaries",
    price: 360,
    image: "/images/anniversary_cake.jpg",
    imageAlt: "The Nocturne Reserve two-tier dark chocolate velvet anniversary cake with sculpted gold drape",
    imageCaption: "Nocturne Reserve anniversary cake with 24k gold drape and Araguani dark chocolate",
    finishColor: "#2e3642",
    swatchName: "Midnight Truffle",
    servings: "28–35 guests",
    tiers: 2,
    isNew: false,
    flavors: ["72% Araguani Dark Chocolate", "Smoked Fleur de Sel Caramel", "Espresso Crème"],
    description: "Architectural two-tier cylinder adorned with matte chocolate velvet and a dramatic hand-sculpted edible 24k gold drape, punctuated by a pristine white sugar blossom.",
    tastingNotes: ["Smoky single-origin cocoa", "Warm bourbon vanilla caramel", "Deep roasted espresso warmth"],
    dimensions: "8\" base, 6\" tier — 16\" height",
    leadTime: "3 days",
    metaTitle: "The Nocturne Reserve | Luxury Dark Chocolate Anniversary Cake | AURA",
    metaDescription: "Celebrate timeless love with The Nocturne Reserve: an architectural 2-tier cake with Araguani dark chocolate, smoked fleur de sel caramel, and sculpted edible 24k gold drape. Serves 28-35.",
    canonicalUrl: "https://aurapatisserie.com/cakes/nocturne-anniversary-velvet",
    ogImage: "/images/anniversary_cake.jpg",
    faqs: [
      {
        question: "How many guests does The Nocturne Reserve serve?",
        answer: "The 2-tier cylinder design generously serves 28 to 35 guests.",
        order: 1,
      },
      {
        question: "Is the gold drape 100% edible?",
        answer: "Yes, the sculptured drape is handcrafted from organic edible wafer lace finished in certified 24k culinary gold leaf.",
        order: 2,
      },
    ],
  },
  {
    id: "celeste-baby-shower",
    slug: "celeste-baby-shower",
    name: "The Céleste Cloud",
    tagline: "Welcoming new miracles with ethereal softness and light.",
    occasion: "Baby Showers",
    price: 320,
    image: "/images/baby_shower_cake.jpg",
    imageAlt: "The Céleste Cloud two-tier pastel sky blue and ivory baby shower cake with cluster spheres",
    imageCaption: "Ethereal baby shower cake composition in pastel sky blue velvet with hand-piped micro blossoms",
    finishColor: "#c8d8e0",
    swatchName: "Sky Azure",
    servings: "24–30 guests",
    tiers: 2,
    isNew: false,
    flavors: ["Earl Grey Bergamot", "Blueberry Lavender Compote", "Cloud Mascarpone"],
    description: "Harmonious two-tier composition with pastel sky-blue velvet and soft ivory cream, adorned with modern cluster spheres and hand-piped micro sugar blossoms.",
    tastingNotes: ["Fragrant bergamot citrus", "Wild berry coulis", "Featherlight sweet mascarpone"],
    dimensions: "8\" base, 6\" tier — 15\" height",
    leadTime: "72 hours",
    metaTitle: "The Céleste Cloud | Designer Pastel Baby Shower Cake | AURA",
    metaDescription: "Ethereal two-tier baby shower cake featuring Earl Grey bergamot, blueberry lavender compote, and mascarpone cloud cream. Beautiful pastel blue velvet finish.",
    canonicalUrl: "https://aurapatisserie.com/cakes/celeste-baby-shower",
    ogImage: "/images/baby_shower_cake.jpg",
    faqs: [
      {
        question: "Can the finish color be adjusted for gender reveal or neutral palettes?",
        answer: "Yes! Choose from Sky Azure, Blush Rose, Ivory Starlight, or Sage Cloud during customization.",
        order: 1,
      },
      {
        question: "Are the decorative cluster spheres edible?",
        answer: "Yes, all spherical accents are crafted from hollow Belgian white chocolate.",
        order: 2,
      },
    ],
  },
  {
    id: "solaris-gala-architectural",
    slug: "solaris-gala-architectural",
    name: "The Solaris Cube Gala",
    tagline: "Avant-garde geometry for brand galas and grand banquets.",
    occasion: "Galas",
    price: 850,
    image: "/images/gala_pistachio_cake.jpg",
    imageAlt: "The Solaris Cube Gala four-tier geometric square gala banquet cake in citrus pistachio with gold bevels",
    imageCaption: "Four-tier architectural cantilever cube cake for galas and luxury banquets",
    finishColor: "#dddc8c",
    swatchName: "Citrus Pistachio",
    servings: "90–110 guests",
    tiers: 4,
    isNew: false,
    flavors: ["Bronte Pistachio Praliné", "Yuzu Meyer Lemon Gelée", "Matcha Joconde"],
    description: "Four geometric square tiers with stepped cantilever planes, crisp linear grooves, hand-gilded bevels, and modern white chocolate origami crown.",
    tastingNotes: ["Toasted Italian pistachio", "Vibrant Japanese yuzu acidity", "Earthy matcha tea depth"],
    dimensions: "12\" stepped cube — 26\" total height",
    leadTime: "10 days",
    metaTitle: "The Solaris Cube Gala | Architectural Banqueting & Event Cake | AURA",
    metaDescription: "Avant-garde four-tier stepped cube cake with Italian Bronte pistachio, yuzu meyer lemon, and white chocolate origami. Serves 90-110 guests.",
    canonicalUrl: "https://aurapatisserie.com/cakes/solaris-gala-architectural",
    ogImage: "/images/gala_pistachio_cake.jpg",
    faqs: [
      {
        question: "What setup and delivery service is provided for galas?",
        answer: "Our white-glove pastry team coordinates refrigerated delivery and on-site assembly directly with your banquet manager.",
        order: 1,
      },
      {
        question: "What is the lead time for corporate or gala events?",
        answer: "We require a minimum 10-day notice for the Solaris Cube due to intricate hand-beveled geometry.",
        order: 2,
      },
    ],
  },
  {
    id: "rosalia-intimate-romance",
    slug: "rosalia-intimate-romance",
    name: "The Rosalia Mirror",
    tagline: "High-gloss mirror glaze for proposals and intimate dinners.",
    occasion: "Anniversaries",
    price: 165,
    image: "/images/romance_blush_cake.jpg",
    imageAlt: "The Rosalia Mirror blush high-gloss mirror glaze cake with fresh raspberries and dark chocolate lotus petals",
    imageCaption: "Intimate celebration mirror glaze cake with edible dark chocolate lotus petals and 24k gold foil",
    finishColor: "#e8d0d0",
    swatchName: "Blush Glaze",
    servings: "8–12 guests",
    tiers: 1,
    isNew: false,
    flavors: ["Ispahan Rosewater", "Fresh Raspberry Compote", "Almond Genoise"],
    description: "Immaculate reflective blush mirror glaze crowned with organic dark chocolate lotus petals, whole ruby raspberries, and 24k gold leaf foil.",
    tastingNotes: ["Delicate French rose essence", "Crisp almond biscuit crunch", "Tangy raspberry coulis"],
    dimensions: "7\" diameter — 5\" height",
    leadTime: "24 hours",
    metaTitle: "The Rosalia Mirror | Luxury Mirror Glaze Romance Cake | AURA",
    metaDescription: "High-gloss reflective blush mirror glaze cake for intimate dinners and proposals. Flavored with Ispahan rosewater, fresh raspberries, and almond genoise. Serves 8-12.",
    canonicalUrl: "https://aurapatisserie.com/cakes/rosalia-intimate-romance",
    ogImage: "/images/romance_blush_cake.jpg",
    faqs: [
      {
        question: "How fast can The Rosalia Mirror be delivered?",
        answer: "Available with 24 hours notice for intimate dinners, proposals, and romantic milestones.",
        order: 1,
      },
      {
        question: "What makes the mirror glaze unique?",
        answer: "Hand-poured reflective Valrhona glaze infused with organic Damask rose essence and real gold foil accents.",
        order: 2,
      },
    ],
  },
];

export const SEED_PAGES: SeedPageSeo[] = [
  {
    path: "/",
    title: "AURA Patisserie — Architectural Cakes for Every Occasion",
    metaDescription: "Bespoke architectural cakes for weddings, milestone birthdays, anniversaries, baby showers, and grand galas. Handcrafted with pristine culinary artistry and white-glove delivery.",
    canonicalUrl: "https://aurapatisserie.com",
    ogImage: "/images/wedding_cake.jpg",
    faqs: [
      {
        question: "How does AURA Patisserie deliver luxury cakes safely?",
        answer: "All cakes travel in climate-controlled suspension containers with refrigerated white-glove couriers directly to your venue or residence.",
        order: 1,
      },
      {
        question: "Can I customize tiers, color palettes, and flavor combinations?",
        answer: "Yes, our interactive Atelier Configurator allows you to customize finishes, tiers, and flavors to match your event theme.",
        order: 2,
      },
      {
        question: "Where is AURA Patisserie located and what areas do you serve?",
        answer: "Our flagship atelier is based in New York, with specialized refrigerated couriers serving the greater metropolitan area.",
        order: 3,
      },
      {
        question: "How far in advance should I place my cake order?",
        answer: "Intimate cakes require 24 to 48 hours notice, while tiered wedding and gala showstoppers require 7 to 10 days notice.",
        order: 4,
      },
    ],
  },
  {
    path: "/cakes",
    title: "The Haute Cake Catalog — Handcrafted Architectural Masterpieces | AURA",
    metaDescription: "Explore our complete portfolio of luxury architectural cakes. Filter by occasion, flavor profile, and guest servings with white-glove delivery.",
    canonicalUrl: "https://aurapatisserie.com/cakes",
    ogImage: "/images/wedding_cake.jpg",
    faqs: [
      {
        question: "What flavor combinations are available across the catalog?",
        answer: "Our catalog features 6 signature flavor profiles including Tahitian Vanilla & Rosé Champagne, Bronte Pistachio & Yuzu, and Valrhona 72% Dark Truffle.",
        order: 1,
      },
      {
        question: "Can I order tasting samples before committing to a full cake?",
        answer: "Yes! Order our Private Tasting Flight Experience featuring all 6 cake flavors couriered in an insulated gift vault.",
        order: 2,
      },
    ],
  },
  {
    path: "/occasions/weddings",
    title: "Architectural Wedding Cakes — Bespoke Luxury Bridal Tiers | AURA",
    metaDescription: "Elegantly sculpted wedding tiers crafted with 24k gold leaf, Tahitian vanilla bean, and sugar florals. Schedule a private bridal tasting.",
    canonicalUrl: "https://aurapatisserie.com/occasions/weddings",
    ogImage: "/images/wedding_cake.jpg",
    faqs: [
      {
        question: "Do you coordinate delivery and setup with wedding planners?",
        answer: "Yes, our white-glove concierge coordinates directly with your venue manager and wedding planner for seamless on-site installation.",
        order: 1,
      },
      {
        question: "Can tiers have different flavor profiles?",
        answer: "Absolutely. Multi-tier wedding cakes can feature distinct flavor combinations for each individual tier.",
        order: 2,
      },
    ],
  },
  {
    path: "/occasions/birthdays",
    title: "Designer Birthday Cakes — Modern Celebration Showstoppers | AURA",
    metaDescription: "Mark another magnificent year with bespoke architectural birthday cakes. Single and multi-tier designs with custom chocolate inscriptions.",
    canonicalUrl: "https://aurapatisserie.com/occasions/birthdays",
    ogImage: "/images/birthday_cake.jpg",
    faqs: [
      {
        question: "Are custom birthday plaques included?",
        answer: "Yes, every birthday centerpiece includes a complimentary chocolate plaque with custom gold foil calligraphy.",
        order: 1,
      },
    ],
  },
  {
    path: "/occasions/anniversaries",
    title: "Haute Anniversary Cakes — Celebrate Timeless Love | AURA",
    metaDescription: "Sensual dark chocolate, salted caramel, and high-gloss mirror glaze cakes designed for intimate anniversary dinners and milestone celebrations.",
    canonicalUrl: "https://aurapatisserie.com/occasions/anniversaries",
    ogImage: "/images/anniversary_cake.jpg",
    faqs: [
      {
        question: "Can anniversary cakes be delivered same-week?",
        answer: "Yes, selected anniversary cakes such as The Rosalia Mirror can be delivered with 24 hours notice.",
        order: 1,
      },
    ],
  },
  {
    path: "/occasions/baby-showers",
    title: "Bespoke Baby Shower Cakes — Ethereal Pastel Creations | AURA",
    metaDescription: "Ethereal pastel velvet cakes for baby showers and gender reveals. Delicate Earl Grey, lavender compote, and cloud mascarpone.",
    canonicalUrl: "https://aurapatisserie.com/occasions/baby-showers",
    ogImage: "/images/baby_shower_cake.jpg",
    faqs: [
      {
        question: "Do you create secret gender-reveal sponges?",
        answer: "Yes, we can tint the interior sponge blush pink or azure blue concealed beneath a neutral ivory velvet exterior.",
        order: 1,
      },
    ],
  },
  {
    path: "/occasions/galas",
    title: "Gala & Banquet Architectural Cakes — Avant-Garde Centerpieces | AURA",
    metaDescription: "Dramatic multi-tier geometric centerpieces for brand galas, charity balls, and high-capacity luxury banquets serving up to 110+ guests.",
    canonicalUrl: "https://aurapatisserie.com/occasions/galas",
    ogImage: "/images/gala_pistachio_cake.jpg",
    faqs: [
      {
        question: "Can gala centerpieces be customized with corporate brand branding?",
        answer: "Yes, our sculptors can integrate custom edible geometric emblems and corporate pantone color matching.",
        order: 1,
      },
    ],
  },
];

export const SEED_ROBOTS = {
  gptBotAllowed: true,
  perplexityBotAllowed: true,
  claudeBotAllowed: true,
  googleExtendedAllowed: true,
  ccBotAllowed: true,
  customRules: "# Allow standard search crawlers\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\n# Disallow private admin routes\nUser-agent: *\nDisallow: /admin\nDisallow: /admin/*\nDisallow: /api/admin/*\n",
  sitemapUrl: "/sitemap.xml",
};

export const SEED_USERS = [
  {
    email: "admin@aurapatisserie.com",
    name: "Aura Administrator",
    role: "ADMIN" as const,
    plainPassword: "Admin@Aura2026!",
  },
  {
    email: "seo@aurapatisserie.com",
    name: "SEO Specialist",
    role: "SEO_SPECIALIST" as const,
    plainPassword: "Seo@Aura2026!",
  },
];

export const SEED_SETTINGS = {
  siteName: "AURA Patisserie",
  siteUrl: "https://aurapatisserie.com",
  siteDescription: "Architectural Haute Patisserie & Bespoke Luxury Cakes for Weddings, Galas, and Milestones.",
  logoUrl: "/images/wedding_cake.jpg",
  contactEmail: "concierge@aurapatisserie.com",
  contactPhone: "+1 (800) 555-AURA",
  currency: "USD",
};

export interface SeedVisit {
  id: string;
  path: string;
  userAgent: string;
  isBot: boolean;
  botName?: string;
  ip?: string;
  createdAt: string;
}

export const SEED_VISITS: SeedVisit[] = [
  {
    "id": "seed-visit-001",
    "path": "/",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-06T05:30:00.000Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-002",
    "path": "/cakes",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-06T02:11:45.679Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-003",
    "path": "/cakes/elysian-wedding-tier",
    "userAgent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "isBot": true,
    "createdAt": "2026-11-05T22:53:31.358Z",
    "botName": "Googlebot",
    "ip": "66.249.66.1"
  },
  {
    "id": "seed-visit-004",
    "path": "/cakes/blush-seraphina-birthday",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-05T19:35:17.037Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-005",
    "path": "/cakes/nocturne-anniversary-velvet",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-05T16:17:02.716Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-006",
    "path": "/sitemap.xml",
    "userAgent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "isBot": true,
    "createdAt": "2026-11-05T12:58:48.395Z",
    "botName": "Googlebot",
    "ip": "66.249.66.1"
  },
  {
    "id": "seed-visit-007",
    "path": "/cakes/solaris-gala-architectural",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-05T09:40:34.074Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-008",
    "path": "/occasions/weddings",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-05T06:33:20.000Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-009",
    "path": "/occasions/birthdays",
    "userAgent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "isBot": true,
    "createdAt": "2026-11-05T03:15:05.679Z",
    "botName": "Googlebot",
    "ip": "66.249.66.1"
  },
  {
    "id": "seed-visit-010",
    "path": "/occasions/galas",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-04T23:56:51.358Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-011",
    "path": "/about",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-04T20:38:37.037Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-012",
    "path": "/contact",
    "userAgent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "isBot": true,
    "createdAt": "2026-11-04T17:20:22.716Z",
    "botName": "Googlebot",
    "ip": "66.249.66.1"
  },
  {
    "id": "seed-visit-013",
    "path": "/",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-04T14:02:08.395Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-014",
    "path": "/cakes",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-04T10:43:54.074Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-015",
    "path": "/cakes/elysian-wedding-tier",
    "userAgent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "isBot": true,
    "createdAt": "2026-11-04T07:36:40.000Z",
    "botName": "Googlebot",
    "ip": "66.249.66.1"
  },
  {
    "id": "seed-visit-016",
    "path": "/cakes/blush-seraphina-birthday",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-04T04:18:25.679Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-017",
    "path": "/cakes/nocturne-anniversary-velvet",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-04T01:00:11.358Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-018",
    "path": "/cakes/rosalia-intimate-romance",
    "userAgent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "isBot": true,
    "createdAt": "2026-11-03T21:41:57.037Z",
    "botName": "Googlebot",
    "ip": "66.249.66.1"
  },
  {
    "id": "seed-visit-019",
    "path": "/cakes/solaris-gala-architectural",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-03T18:23:42.716Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-020",
    "path": "/occasions/weddings",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-03T15:05:28.395Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-021",
    "path": "/robots.txt",
    "userAgent": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "isBot": true,
    "createdAt": "2026-11-03T11:47:14.074Z",
    "botName": "GPTBot",
    "ip": "20.150.130.4"
  },
  {
    "id": "seed-visit-022",
    "path": "/occasions/galas",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-03T08:40:00.000Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-023",
    "path": "/about",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-03T05:21:45.679Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-024",
    "path": "/contact",
    "userAgent": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "isBot": true,
    "createdAt": "2026-11-03T02:03:31.358Z",
    "botName": "GPTBot",
    "ip": "20.150.130.4"
  },
  {
    "id": "seed-visit-025",
    "path": "/",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-02T22:45:17.037Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-026",
    "path": "/cakes",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-02T19:27:02.716Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-027",
    "path": "/cakes/elysian-wedding-tier",
    "userAgent": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "isBot": true,
    "createdAt": "2026-11-02T16:08:48.395Z",
    "botName": "GPTBot",
    "ip": "20.150.130.4"
  },
  {
    "id": "seed-visit-028",
    "path": "/cakes/blush-seraphina-birthday",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-02T12:50:34.074Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-029",
    "path": "/cakes/nocturne-anniversary-velvet",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-02T09:43:20.000Z",
    "ip": "198.51.100.10"
  },
  {
    "id": "seed-visit-030",
    "path": "/cakes/rosalia-intimate-romance",
    "userAgent": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "isBot": true,
    "createdAt": "2026-11-02T06:25:05.679Z",
    "botName": "GPTBot",
    "ip": "20.150.130.4"
  },
  {
    "id": "seed-visit-031",
    "path": "/cakes/solaris-gala-architectural",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-02T03:06:51.358Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-032",
    "path": "/occasions/weddings",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-01T23:48:37.037Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-033",
    "path": "/occasions/birthdays",
    "userAgent": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "isBot": true,
    "createdAt": "2026-11-01T20:30:22.716Z",
    "botName": "GPTBot",
    "ip": "20.150.130.4"
  },
  {
    "id": "seed-visit-034",
    "path": "/occasions/galas",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-01T17:12:08.395Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-035",
    "path": "/about",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-01T13:53:54.074Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-036",
    "path": "/sitemap.xml",
    "userAgent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "isBot": true,
    "createdAt": "2026-11-01T10:46:40.000Z",
    "botName": "Bingbot",
    "ip": "157.55.39.1"
  },
  {
    "id": "seed-visit-037",
    "path": "/",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-01T07:28:25.679Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-038",
    "path": "/cakes",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-11-01T04:10:11.358Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-039",
    "path": "/cakes/elysian-wedding-tier",
    "userAgent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "isBot": true,
    "createdAt": "2026-11-01T00:51:57.037Z",
    "botName": "Bingbot",
    "ip": "157.55.39.1"
  },
  {
    "id": "seed-visit-040",
    "path": "/cakes/blush-seraphina-birthday",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-31T21:33:42.716Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-041",
    "path": "/cakes/nocturne-anniversary-velvet",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-31T18:15:28.395Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-042",
    "path": "/cakes/rosalia-intimate-romance",
    "userAgent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "isBot": true,
    "createdAt": "2026-10-31T14:57:14.074Z",
    "botName": "Bingbot",
    "ip": "157.55.39.1"
  },
  {
    "id": "seed-visit-043",
    "path": "/cakes/solaris-gala-architectural",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-31T11:50:00.000Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-044",
    "path": "/occasions/weddings",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-31T08:31:45.679Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-045",
    "path": "/occasions/birthdays",
    "userAgent": "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "isBot": true,
    "createdAt": "2026-10-31T05:13:31.358Z",
    "botName": "ClaudeBot",
    "ip": "160.79.104.5"
  },
  {
    "id": "seed-visit-046",
    "path": "/occasions/galas",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-31T01:55:17.037Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-047",
    "path": "/about",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-30T22:37:02.716Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-048",
    "path": "/contact",
    "userAgent": "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "isBot": true,
    "createdAt": "2026-10-30T19:18:48.395Z",
    "botName": "ClaudeBot",
    "ip": "160.79.104.5"
  },
  {
    "id": "seed-visit-049",
    "path": "/",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-30T16:00:34.074Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-050",
    "path": "/cakes",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-30T12:53:20.000Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-051",
    "path": "/robots.txt",
    "userAgent": "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "isBot": true,
    "createdAt": "2026-10-30T09:35:05.679Z",
    "botName": "ClaudeBot",
    "ip": "160.79.104.5"
  },
  {
    "id": "seed-visit-052",
    "path": "/cakes/blush-seraphina-birthday",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-30T06:16:51.358Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-053",
    "path": "/cakes/nocturne-anniversary-velvet",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-30T02:58:37.037Z",
    "ip": "198.51.100.14"
  },
  {
    "id": "seed-visit-054",
    "path": "/cakes/rosalia-intimate-romance",
    "userAgent": "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    "isBot": true,
    "createdAt": "2026-10-29T23:40:22.716Z",
    "botName": "PerplexityBot",
    "ip": "104.28.12.33"
  },
  {
    "id": "seed-visit-055",
    "path": "/cakes/solaris-gala-architectural",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-29T20:22:08.395Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-056",
    "path": "/occasions/weddings",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-29T17:03:54.074Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-057",
    "path": "/occasions/birthdays",
    "userAgent": "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    "isBot": true,
    "createdAt": "2026-10-29T13:56:40.000Z",
    "botName": "PerplexityBot",
    "ip": "104.28.12.33"
  },
  {
    "id": "seed-visit-058",
    "path": "/occasions/galas",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-29T10:38:25.679Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-059",
    "path": "/about",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-29T07:20:11.358Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-060",
    "path": "/contact",
    "userAgent": "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    "isBot": true,
    "createdAt": "2026-10-29T04:01:57.037Z",
    "botName": "PerplexityBot",
    "ip": "104.28.12.33"
  },
  {
    "id": "seed-visit-061",
    "path": "/",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-29T00:43:42.716Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-062",
    "path": "/cakes",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-28T21:25:28.395Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-063",
    "path": "/cakes/elysian-wedding-tier",
    "userAgent": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)",
    "isBot": true,
    "createdAt": "2026-10-28T18:07:14.074Z",
    "botName": "ChatGPT-User",
    "ip": "23.98.142.1"
  },
  {
    "id": "seed-visit-064",
    "path": "/cakes/blush-seraphina-birthday",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-28T15:00:00.000Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-065",
    "path": "/cakes/nocturne-anniversary-velvet",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-28T11:41:45.679Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-066",
    "path": "/sitemap.xml",
    "userAgent": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)",
    "isBot": true,
    "createdAt": "2026-10-28T08:23:31.358Z",
    "botName": "ChatGPT-User",
    "ip": "23.98.142.1"
  },
  {
    "id": "seed-visit-067",
    "path": "/cakes/solaris-gala-architectural",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-28T05:05:17.037Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-068",
    "path": "/occasions/weddings",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-28T01:47:02.716Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-069",
    "path": "/occasions/birthdays",
    "userAgent": "Mozilla/5.0 (compatible; Google-Extended; +https://developers.google.com/search)",
    "isBot": true,
    "createdAt": "2026-10-27T22:28:48.395Z",
    "botName": "Google-Extended",
    "ip": "66.249.66.12"
  },
  {
    "id": "seed-visit-070",
    "path": "/occasions/galas",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-27T19:10:34.074Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-071",
    "path": "/about",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
    "isBot": false,
    "createdAt": "2026-10-27T16:03:20.000Z",
    "ip": "198.51.100.22"
  },
  {
    "id": "seed-visit-072",
    "path": "/contact",
    "userAgent": "Mozilla/5.0 (compatible; Google-Extended; +https://developers.google.com/search)",
    "isBot": true,
    "createdAt": "2026-10-27T12:45:05.679Z",
    "botName": "Google-Extended",
    "ip": "66.249.66.12"
  },
  {
    "id": "seed-visit-073",
    "path": "/",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "isBot": false,
    "createdAt": "2026-10-27T09:26:51.358Z",
    "ip": "198.51.100.28"
  },
  {
    "id": "seed-visit-074",
    "path": "/cakes",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "isBot": false,
    "createdAt": "2026-10-27T06:08:37.037Z",
    "ip": "198.51.100.28"
  },
  {
    "id": "seed-visit-075",
    "path": "/cakes/elysian-wedding-tier",
    "userAgent": "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)",
    "isBot": true,
    "createdAt": "2026-10-27T02:50:22.716Z",
    "botName": "DuckDuckBot",
    "ip": "50.16.241.115"
  },
  {
    "id": "seed-visit-076",
    "path": "/cakes/blush-seraphina-birthday",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "isBot": false,
    "createdAt": "2026-10-26T23:32:08.395Z",
    "ip": "198.51.100.28"
  },
  {
    "id": "seed-visit-077",
    "path": "/cakes/nocturne-anniversary-velvet",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "isBot": false,
    "createdAt": "2026-10-26T20:13:54.074Z",
    "ip": "198.51.100.28"
  },
  {
    "id": "seed-visit-078",
    "path": "/cakes/rosalia-intimate-romance",
    "userAgent": "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)",
    "isBot": true,
    "createdAt": "2026-10-26T17:06:40.000Z",
    "botName": "DuckDuckBot",
    "ip": "50.16.241.115"
  },
  {
    "id": "seed-visit-079",
    "path": "/cakes/solaris-gala-architectural",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "isBot": false,
    "createdAt": "2026-10-26T13:48:25.679Z",
    "ip": "198.51.100.28"
  },
  {
    "id": "seed-visit-080",
    "path": "/occasions/weddings",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "isBot": false,
    "createdAt": "2026-10-26T10:30:11.358Z",
    "ip": "198.51.100.28"
  },
  {
    "id": "seed-visit-081",
    "path": "/robots.txt",
    "userAgent": "curl/8.4.0",
    "isBot": true,
    "createdAt": "2026-10-26T07:11:57.037Z",
    "botName": "curl",
    "ip": "192.0.2.45"
  },
  {
    "id": "seed-visit-082",
    "path": "/occasions/galas",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "isBot": false,
    "createdAt": "2026-10-26T03:53:42.716Z",
    "ip": "198.51.100.28"
  },
  {
    "id": "seed-visit-083",
    "path": "/about",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "isBot": false,
    "createdAt": "2026-10-26T00:35:28.395Z",
    "ip": "198.51.100.28"
  },
  {
    "id": "seed-visit-084",
    "path": "/contact",
    "userAgent": "curl/8.4.0",
    "isBot": true,
    "createdAt": "2026-10-25T21:17:14.074Z",
    "botName": "curl",
    "ip": "192.0.2.45"
  },
  {
    "id": "seed-visit-085",
    "path": "/",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "isBot": false,
    "createdAt": "2026-10-25T18:10:00.000Z",
    "ip": "198.51.100.31"
  },
  {
    "id": "seed-visit-086",
    "path": "/cakes",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "isBot": false,
    "createdAt": "2026-10-25T14:51:45.679Z",
    "ip": "198.51.100.31"
  },
  {
    "id": "seed-visit-087",
    "path": "/cakes/elysian-wedding-tier",
    "userAgent": "python-requests/2.31.0",
    "isBot": true,
    "createdAt": "2026-10-25T11:33:31.358Z",
    "botName": "python-requests",
    "ip": "198.51.100.89"
  },
  {
    "id": "seed-visit-088",
    "path": "/cakes/blush-seraphina-birthday",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "isBot": false,
    "createdAt": "2026-10-25T08:15:17.037Z",
    "ip": "198.51.100.31"
  },
  {
    "id": "seed-visit-089",
    "path": "/cakes/nocturne-anniversary-velvet",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "isBot": false,
    "createdAt": "2026-10-25T04:57:02.716Z",
    "ip": "198.51.100.31"
  },
  {
    "id": "seed-visit-090",
    "path": "/cakes/rosalia-intimate-romance",
    "userAgent": "python-requests/2.31.0",
    "isBot": true,
    "createdAt": "2026-10-25T01:38:48.395Z",
    "botName": "python-requests",
    "ip": "198.51.100.89"
  },
  {
    "id": "seed-visit-091",
    "path": "/cakes/solaris-gala-architectural",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "isBot": false,
    "createdAt": "2026-10-24T22:20:34.074Z",
    "ip": "198.51.100.31"
  },
  {
    "id": "seed-visit-092",
    "path": "/occasions/weddings",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "isBot": false,
    "createdAt": "2026-10-24T19:13:20.000Z",
    "ip": "198.51.100.31"
  },
  {
    "id": "seed-visit-093",
    "path": "/occasions/birthdays",
    "userAgent": "CCBot/2.0 (https://commoncrawl.org/faq/)",
    "isBot": true,
    "createdAt": "2026-10-24T15:55:05.679Z",
    "botName": "CCBot",
    "ip": "38.107.191.1"
  },
  {
    "id": "seed-visit-094",
    "path": "/occasions/galas",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.2739.67",
    "isBot": false,
    "createdAt": "2026-10-24T12:36:51.358Z",
    "ip": "198.51.100.35"
  },
  {
    "id": "seed-visit-095",
    "path": "/about",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.2739.67",
    "isBot": false,
    "createdAt": "2026-10-24T09:18:37.037Z",
    "ip": "198.51.100.35"
  },
  {
    "id": "seed-visit-096",
    "path": "/sitemap.xml",
    "userAgent": "Baiduspider/2.0; +http://www.baidu.com/search/spider.html",
    "isBot": true,
    "createdAt": "2026-10-24T06:00:22.716Z",
    "botName": "Baiduspider",
    "ip": "180.76.15.22"
  },
  {
    "id": "seed-visit-097",
    "path": "/",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.2739.67",
    "isBot": false,
    "createdAt": "2026-10-24T02:42:08.395Z",
    "ip": "198.51.100.35"
  },
  {
    "id": "seed-visit-098",
    "path": "/cakes",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.2739.67",
    "isBot": false,
    "createdAt": "2026-10-23T23:23:54.074Z",
    "ip": "198.51.100.35"
  },
  {
    "id": "seed-visit-099",
    "path": "/cakes/elysian-wedding-tier",
    "userAgent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.88 Mobile Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-23T20:16:40.000Z",
    "ip": "198.51.100.40"
  },
  {
    "id": "seed-visit-100",
    "path": "/cakes/blush-seraphina-birthday",
    "userAgent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.88 Mobile Safari/537.36",
    "isBot": false,
    "createdAt": "2026-10-23T16:58:25.679Z",
    "ip": "198.51.100.40"
  }
];

export interface SeedOrder {
  id: string;
  cakeId: string;
  cakeName: string;
  customerName: string;
  customerEmail: string;
  price: number;
  quantity: number;
  status: "ACTIVE" | "CANCELLED";
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const SEED_ORDERS: SeedOrder[] = [
  {
    id: "seed-order-001",
    cakeId: "elysian-wedding-tier",
    cakeName: "The Elysian Grand Tier",
    customerName: "Lady Genevieve Montague",
    customerEmail: "genevieve.montague@mayfair-holdings.co.uk",
    price: 680,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-11-28",
    notes: "Bespoke 24k gold leaf monograms for Montague reception.",
    createdAt: "2026-10-26T10:15:00.000Z",
    updatedAt: "2026-10-26T10:15:00.000Z",
  },
  {
    id: "seed-order-002",
    cakeId: "blush-seraphina-birthday",
    cakeName: "The Seraphina Blush",
    customerName: "Camilla Chesterfield",
    customerEmail: "camilla@chesterfield-design.com",
    price: 195,
    quantity: 2,
    status: "ACTIVE",
    deliveryDate: "2026-11-14",
    notes: "Complimentary chocolate plaque: Happy 30th Camilla",
    createdAt: "2026-10-27T14:30:00.000Z",
    updatedAt: "2026-10-27T14:30:00.000Z",
  },
  {
    id: "seed-order-003",
    cakeId: "nocturne-anniversary-velvet",
    cakeName: "The Nocturne Reserve",
    customerName: "Lord Julian Sterling",
    customerEmail: "julian@sterling-villas.com",
    price: 360,
    quantity: 1,
    status: "CANCELLED",
    deliveryDate: "2026-11-12",
    notes: "Client rescheduled anniversary dinner to next quarter.",
    createdAt: "2026-10-28T09:00:00.000Z",
    updatedAt: "2026-10-29T11:20:00.000Z",
  },
  {
    id: "seed-order-004",
    cakeId: "celeste-baby-shower",
    cakeName: "The Céleste Cloud",
    customerName: "Dr. Vivienne Vance",
    customerEmail: "vivienne.vance@central-hospital.org",
    price: 320,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-11-20",
    notes: "Sky Azure finish with white chocolate cluster spheres.",
    createdAt: "2026-10-29T16:45:00.000Z",
    updatedAt: "2026-10-29T16:45:00.000Z",
  },
  {
    id: "seed-order-005",
    cakeId: "solaris-gala-architectural",
    cakeName: "The Solaris Cube Gala",
    customerName: "Bartholomew Kensington",
    customerEmail: "bkensington@kensington-partners.ch",
    price: 850,
    quantity: 2,
    status: "ACTIVE",
    deliveryDate: "2026-12-05",
    notes: "White-glove banquet refrigerated installation at Guggenheim atrium.",
    createdAt: "2026-10-30T11:00:00.000Z",
    updatedAt: "2026-10-30T11:00:00.000Z",
  },
  {
    id: "seed-order-006",
    cakeId: "rosalia-intimate-romance",
    cakeName: "The Rosalia Mirror",
    customerName: "Sebastian Moreau",
    customerEmail: "sebastian.moreau@atelier-lux.fr",
    price: 165,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-11-10",
    notes: "Proposal dinner setup at Le Bernardin private alcove.",
    createdAt: "2026-10-31T18:20:00.000Z",
    updatedAt: "2026-10-31T18:20:00.000Z",
  },
  {
    id: "seed-order-007",
    cakeId: "elysian-wedding-tier",
    cakeName: "The Elysian Grand Tier",
    customerName: "Countess Jacqueline de Valois",
    customerEmail: "jacqueline@valois-estates.fr",
    price: 680,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-12-18",
    notes: "Direct courier delivery to Valois manor ballroom.",
    createdAt: "2026-11-01T08:30:00.000Z",
    updatedAt: "2026-11-01T08:30:00.000Z",
  },
  {
    id: "seed-order-008",
    cakeId: "blush-seraphina-birthday",
    cakeName: "The Seraphina Blush",
    customerName: "Hélène René-Dupont",
    customerEmail: "helene@dupont-luxury.com",
    price: 195,
    quantity: 1,
    status: "CANCELLED",
    deliveryDate: "2026-11-08",
    notes: "Guest of honor international travel postponed.",
    createdAt: "2026-11-01T12:00:00.000Z",
    updatedAt: "2026-11-02T15:45:00.000Z",
  },
  {
    id: "seed-order-009",
    cakeId: "nocturne-anniversary-velvet",
    cakeName: "The Nocturne Reserve",
    customerName: "Alexander Pemberton",
    customerEmail: "a.pemberton@pemberton-capital.com",
    price: 360,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-11-22",
    notes: "24k gold drape finish with Araguani dark chocolate.",
    createdAt: "2026-11-02T14:15:00.000Z",
    updatedAt: "2026-11-02T14:15:00.000Z",
  },
  {
    id: "seed-order-010",
    cakeId: "celeste-baby-shower",
    cakeName: "The Céleste Cloud",
    customerName: "Margot Saint-Clair",
    customerEmail: "margot@saintclair-interiors.com",
    price: 320,
    quantity: 2,
    status: "ACTIVE",
    deliveryDate: "2026-11-25",
    notes: "Twin celebration: one pastel sky blue, one blush rose velvet.",
    createdAt: "2026-11-03T09:40:00.000Z",
    updatedAt: "2026-11-03T09:40:00.000Z",
  },
  {
    id: "seed-order-011",
    cakeId: "solaris-gala-architectural",
    cakeName: "The Solaris Cube Gala",
    customerName: "Maximilian Rothschild",
    customerEmail: "m.rothschild@fin-geneve.ch",
    price: 850,
    quantity: 1,
    status: "CANCELLED",
    deliveryDate: "2026-11-30",
    notes: "Gala venue changed catering policy to in-house kitchen.",
    createdAt: "2026-11-03T17:10:00.000Z",
    updatedAt: "2026-11-04T10:05:00.000Z",
  },
  {
    id: "seed-order-012",
    cakeId: "rosalia-intimate-romance",
    cakeName: "The Rosalia Mirror",
    customerName: "Chloë Müller",
    customerEmail: "chloe.mueller@zurich-arts.ch",
    price: 165,
    quantity: 3,
    status: "ACTIVE",
    deliveryDate: "2026-11-15",
    notes: "Trio of individual mirror cakes for private salon vernissage.",
    createdAt: "2026-11-04T11:25:00.000Z",
    updatedAt: "2026-11-04T11:25:00.000Z",
  },
  {
    id: "seed-order-013",
    cakeId: "elysian-wedding-tier",
    cakeName: "The Elysian Grand Tier",
    customerName: "Dominic Thorne",
    customerEmail: "thorne@thorne-estates.com",
    price: 680,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-12-22",
    notes: "Tahitian Vanilla Bean & Rosé Champagne filling.",
    createdAt: "2026-11-05T13:50:00.000Z",
    updatedAt: "2026-11-05T13:50:00.000Z",
  },
  {
    id: "seed-order-014",
    cakeId: "blush-seraphina-birthday",
    cakeName: "The Seraphina Blush",
    customerName: "Seraphina Albright",
    customerEmail: "seraphina@albright-foundation.org",
    price: 195,
    quantity: 1,
    status: "ACTIVE",
    deliveryDate: "2026-11-18",
    notes: "Gold leaf dust inscription: 40 Years of Radiance",
    createdAt: "2026-11-05T16:30:00.000Z",
    updatedAt: "2026-11-05T16:30:00.000Z",
  },
];
