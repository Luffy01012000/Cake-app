export interface CakeProduct {
  id: string;
  name: string;
  tagline: string;
  occasion: "Weddings" | "Birthdays" | "Anniversaries" | "Baby Showers" | "Galas";
  price: number;
  image: string;
  finishColor: string;
  swatchName: string;
  servings: string;
  tiers: number;
  isNew?: boolean;
  flavors: string[];
  description: string;
  tastingNotes: string[];
  dimensions: string;
  leadTime: string;
}

export const CAKE_CATALOG: CakeProduct[] = [
  {
    id: "elysian-wedding-tier",
    name: "The Elysian Grand Tier",
    tagline: "Architectural purity crafted for eternal vows.",
    occasion: "Weddings",
    price: 680,
    image: "/images/wedding_cake.jpg",
    finishColor: "#f0e4d3",
    swatchName: "Starlight Ivory",
    servings: "65–80 guests",
    tiers: 3,
    isNew: true,
    flavors: ["Tahitian Vanilla Bean", "Champagne Strawberry Ganache", "French Buttercream"],
    description: "An awe-inspiring 3-tier centerpiece cloaked in immaculate ivory fondant, hand-applied 24k gold leaf flecks, and delicate sculpted wafer-paper ranunculus blooms.",
    tastingNotes: ["Floral Madagascar vanilla", "Sparkling rosé champagne notes", "Velvety whipped ganache"],
    dimensions: "10\" base, 8\" middle, 6\" crown — 24\" height",
    leadTime: "7 days minimum"
  },
  {
    id: "blush-seraphina-birthday",
    name: "The Seraphina Blush",
    tagline: "A celebration of another magnificent year around the sun.",
    occasion: "Birthdays",
    price: 195,
    image: "/images/birthday_cake.jpg",
    finishColor: "#e8d0d0",
    swatchName: "Blush Rose",
    servings: "14–18 guests",
    tiers: 1,
    isNew: true,
    flavors: ["Valrhona White Chocolate", "Wild Mountain Raspberry", "Lychee Blossom"],
    description: "Modern minimalist single-tier masterpiece finished in soft pink velvet cocoa butter spray, fluid architectural piping, wild organic strawberries, and gold leaf dust.",
    tastingNotes: ["Tart alpine raspberries", "Subtle lychee perfume", "Melt-in-mouth cocoa butter velvet"],
    dimensions: "8\" diameter — 7\" height",
    leadTime: "48 hours"
  },
  {
    id: "nocturne-anniversary-velvet",
    name: "The Nocturne Reserve",
    tagline: "Deep, sensual, and unforgettable tribute to timeless love.",
    occasion: "Anniversaries",
    price: 360,
    image: "/images/anniversary_cake.jpg",
    finishColor: "#2e3642",
    swatchName: "Midnight Truffle",
    servings: "28–35 guests",
    tiers: 2,
    flavors: ["72% Araguani Dark Chocolate", "Smoked Fleur de Sel Caramel", "Espresso Crème"],
    description: "Architectural two-tier cylinder adorned with matte chocolate velvet and a dramatic hand-sculpted edible 24k gold drape, punctuated by a pristine white sugar blossom.",
    tastingNotes: ["Smoky single-origin cocoa", "Warm bourbon vanilla caramel", "Deep roasted espresso warmth"],
    dimensions: "8\" base, 6\" tier — 16\" height",
    leadTime: "3 days"
  },
  {
    id: "celeste-baby-shower",
    name: "The Céleste Cloud",
    tagline: "Welcoming new miracles with ethereal softness and light.",
    occasion: "Baby Showers",
    price: 320,
    image: "/images/baby_shower_cake.jpg",
    finishColor: "#c8d8e0",
    swatchName: "Sky Azure",
    servings: "24–30 guests",
    tiers: 2,
    flavors: ["Earl Grey Bergamot", "Blueberry Lavender Compote", "Cloud Mascarpone"],
    description: "Harmonious two-tier composition with pastel sky-blue velvet and soft ivory cream, adorned with modern cluster spheres and hand-piped micro sugar blossoms.",
    tastingNotes: ["Fragrant bergamot citrus", "Wild berry coulis", "Featherlight sweet mascarpone"],
    dimensions: "8\" base, 6\" tier — 15\" height",
    leadTime: "72 hours"
  },
  {
    id: "solaris-gala-architectural",
    name: "The Solaris Cube Gala",
    tagline: "Avant-garde geometry for brand galas and grand banquets.",
    occasion: "Galas",
    price: 850,
    image: "/images/gala_pistachio_cake.jpg",
    finishColor: "#dddc8c",
    swatchName: "Citrus Pistachio",
    servings: "90–110 guests",
    tiers: 4,
    flavors: ["Bronte Pistachio Praliné", "Yuzu Meyer Lemon Gelée", "Matcha Joconde"],
    description: "Four geometric square tiers with stepped cantilever planes, crisp linear grooves, hand-gilded bevels, and modern white chocolate origami crown.",
    tastingNotes: ["Toasted Italian pistachio", "Vibrant Japanese yuzu acidity", "Earthy matcha tea depth"],
    dimensions: "12\" stepped cube — 26\" total height",
    leadTime: "10 days"
  },
  {
    id: "rosalia-intimate-romance",
    name: "The Rosalia Mirror",
    tagline: "High-gloss mirror glaze for proposals and intimate dinners.",
    occasion: "Anniversaries",
    price: 165,
    image: "/images/romance_blush_cake.jpg",
    finishColor: "#e8d0d0",
    swatchName: "Blush Glaze",
    servings: "8–12 guests",
    tiers: 1,
    flavors: ["Ispahan Rosewater", "Fresh Raspberry Compote", "Almond Genoise"],
    description: "Immaculate reflective blush mirror glaze crowned with organic dark chocolate lotus petals, whole ruby raspberries, and 24k gold leaf foil.",
    tastingNotes: ["Delicate French rose essence", "Crisp almond biscuit crunch", "Tangy raspberry coulis"],
    dimensions: "7\" diameter — 5\" height",
    leadTime: "24 hours"
  }
];

export interface FlavorOption {
  id: string;
  name: string;
  color: string;
  notes: string;
  complementary: string;
}

export const FLAVOR_PALETTES: FlavorOption[] = [
  {
    id: "vanilla-champagne",
    name: "Tahitian Vanilla & Rosé Champagne",
    color: "#f0e4d3",
    notes: "Aged bourbon vanilla beans folded into light champagne mousse.",
    complementary: "Best paired with Wedding and Milestone celebrations."
  },
  {
    id: "valrhona-midnight",
    name: "Valrhona 72% Dark Truffle & Sea Salt",
    color: "#2e3642",
    notes: "Rich grand cru chocolate ganache with salted caramel crunch.",
    complementary: "Decadent choice for Anniversaries and Evening Galas."
  },
  {
    id: "pistachio-yuzu",
    name: "Sicilian Pistachio & Yuzu Citrus",
    color: "#dddc8c",
    notes: "Creamy nutty pistachio praliné with brisk Japanese yuzu gelée.",
    complementary: "Vibrant and refreshing for Galas and Receptions."
  },
  {
    id: "raspberry-rose",
    name: "Ispahan Rose Lychee & Raspberry",
    color: "#e8d0d0",
    notes: "Floral Damask rosewater with fresh mountain raspberries.",
    complementary: "Exquisite for Birthdays, Romance, and Showers."
  },
  {
    id: "earl-grey-cloud",
    name: "Earl Grey Bergamot & Blueberry",
    color: "#c8d8e0",
    notes: "Infused black tea biscuit with light mascarpone cloud cream.",
    complementary: "Gentle and poetic for Baby Showers and Tea Parties."
  }
];

export interface CartItem {
  id: string;
  cake: CakeProduct;
  customInscription?: string;
  flavorChoice: string;
  deliveryDate?: string;
  quantity: number;
}
