/**
 * Pricing Constants and Universal Tier Specifications
 * NOTE: This file does NOT contain "use server" or "use client", so it can be safely
 * imported in server actions, server components, and client components without Next.js errors.
 */

export const CORE_CATEGORY_PRESETS = [
  "1 BHK Complete Furnishing Package",
  "2 BHK Complete Furnishing Package",
  "3 BHK Complete Furnishing Package",
  "Independent Villa / Penthouse Project",
  "Other (Enter Custom New Option...)",
];

/**
 * Universal 3-tier specifications designed to be unique, comprehensive,
 * and suitable for ALL apartment, bungalow, villa, or custom home categories.
 */
export const TIER_SPECIFICATIONS = {
  budget: {
    id: "budget",
    name: "Budget Friendly",
    badge: "Smart Value",
    subtitle: "Essential Cost-Effective Turnkey Woodworking",
    timber: "Commercial MR Grade Plywood & Termite-Resistant Hardwood Core",
    timberShort: "Commercial MR Ply + Hardwood Core",
    finish: "1.0mm Anti-Scratch Premium Matte Laminate",
    finishShort: "1mm Scratch-Resistant Laminate",
    hardware: "Heavy-Duty Smooth Soft-Close Hinges & Telescopic Drawer Sliders",
    hardwareShort: "Soft-Close Hinges & Sliders",
    warranty: "5-Year Craftsmanship & Material Warranty",
    warrantyShort: "5 Years Anti-Termite & Structural",
    inclusions: [
      "Custom storage bed(s) with ample under-bed storage boxes",
      "Living room sofa arrangement with 32D orthopaedic foam",
      "Full-height modular wardrobes with hanging & locker partitions",
      "Solid core center/coffee table with protective edge-banding",
      "Tailored layout planning customized to your floorplan",
      "100% Free Doorstep Delivery & White-Glove Installation in Solapur",
    ],
  },
  simple: {
    id: "simple",
    name: "Simple (Standard)",
    badge: "Most Popular",
    subtitle: "BWP Marine Grade Plywood with Premium Teak Veneer / Acrylic",
    timber: "100% BWP (Boiling Water Proof) Marine Grade 710 Plywood",
    timberShort: "100% BWP Grade 710 Marine Plywood",
    finish: "High-Gloss Acrylic / Natural Teak Veneer with Satin PU Polish",
    finishShort: "High-Gloss Acrylic / PU Teak Veneer",
    hardware: "Branded Ebco / Hettich Soft-Close Hinges & Heavy Channels",
    hardwareShort: "Branded Ebco / Hettich Soft-Close",
    warranty: "10-Year Comprehensive Anti-Borer & Structural Warranty",
    warrantyShort: "10 Years Comprehensive Anti-Borer",
    inclusions: [
      "Ergonomic bed(s) with smooth hydraulic lift storage & cushioned headboard",
      "Premium 5-to-7-seater living sofa suite with 40D high-resilience foam",
      "Complete solid-wood dining suite with cushioned chairs",
      "Multi-door wardrobes with integrated full dressing mirror & safe locker",
      "Designer solid teak center table & matching TV entertainment console",
      "Free 3D layout visualization, free delivery & turnkey setup",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium (Royal Teak)",
    badge: "100% Sagwan Teak",
    subtitle: "100% Solid Pure CP Sagwan Teakwood Heirloom Craftsmanship",
    timber: "100% Certified Grade-A CP (Central Province) Sagwan Teak Wood",
    timberShort: "100% Certified CP Sagwan Teak Wood",
    finish: "Hand-Rubbed 7-Layer Italian PU / Melamine Grain Polish",
    finishShort: "7-Layer Italian PU Grain Polish",
    hardware: "Blum / Hafele Concealed German Soft-Close Systems & Brass Accents",
    hardwareShort: "Blum / Hafele Concealed German Systems",
    warranty: "Lifetime Wood Purity Guarantee + 15-Year Service Support",
    warrantyShort: "Lifetime Purity + 15-Yr Service",
    inclusions: [
      "Solid Sagwan Teak bed(s) with heavy-duty hydraulic lift mechanisms",
      "Royal hand-carved Teakwood living sofa suite with luxury fabric selection",
      "Heavy solid Teak dining suite with hand-chiseled accents",
      "Full-height solid Teak wardrobes with biometric/combination locker",
      "Hand-carved Teak coffee table, nesting stools & temple/credenza",
      "Dedicated Master Carpenter, lifetime anti-termite guarantee & VIP setup",
    ],
  },
};

export const DEFAULT_PACKAGE_CATEGORIES = [
  {
    id: "1bhk",
    name: "1 BHK Complete Furnishing Package",
    slug: "1-bhk-complete-furnishing-package",
    tag: "Compact Smart Living",
    roomSummary: "1 Bedroom + Living Room + Dining",
    pdfUrl: "/uploads/catalogs/1_BHK_Complete_Furnishing_Rate_Card.pdf",
    pdfName: "1_BHK_Complete_Furnishing_Rate_Card.pdf",
    fileSize: "2.1 MB",
    description: "Complete turnkey furniture package engineered for 1 BHK residences, including living room, master bedroom & compact dining essentials.",
    models: {
      budget: {
        ...TIER_SPECIFICATIONS.budget,
        price: "₹1,15,000",
        numericPrice: 115000,
      },
      simple: {
        ...TIER_SPECIFICATIONS.simple,
        price: "₹1,45,000",
        numericPrice: 145000,
      },
      premium: {
        ...TIER_SPECIFICATIONS.premium,
        price: "₹1,95,000",
        numericPrice: 195000,
      },
    },
  },
  {
    id: "2bhk",
    name: "2 BHK Complete Furnishing Package",
    slug: "2-bhk-complete-furnishing-package",
    tag: "Most Popular Choice",
    roomSummary: "Master & Guest Bedrooms + Living + Dining",
    pdfUrl: "/uploads/catalogs/2_BHK_Complete_Furnishing_Rate_Card.pdf",
    pdfName: "2_BHK_Complete_Furnishing_Rate_Card.pdf",
    fileSize: "2.8 MB",
    description: "Complete 2-bedroom turnkey furnishing with master and guest room suites, living room arrangement, dining, and storage units.",
    models: {
      budget: {
        ...TIER_SPECIFICATIONS.budget,
        price: "₹1,85,000",
        numericPrice: 185000,
      },
      simple: {
        ...TIER_SPECIFICATIONS.simple,
        price: "₹2,45,000",
        numericPrice: 245000,
      },
      premium: {
        ...TIER_SPECIFICATIONS.premium,
        price: "₹3,25,000",
        numericPrice: 325000,
      },
    },
  },
  {
    id: "3bhk",
    name: "3 BHK Complete Furnishing Package",
    slug: "3-bhk-complete-furnishing-package",
    tag: "Spacious Family Home",
    roomSummary: "3 Full Bedrooms + Formal Living + 6-Seater Dining",
    pdfUrl: "/uploads/catalogs/3_BHK_Complete_Furnishing_Rate_Card.pdf",
    pdfName: "3_BHK_Complete_Furnishing_Rate_Card.pdf",
    fileSize: "3.2 MB",
    description: "Palatial 3-bedroom turnkey furnishing for apartments and row houses, covering 3 complete bedrooms, grand living, and 6-seater dining.",
    models: {
      budget: {
        ...TIER_SPECIFICATIONS.budget,
        price: "₹2,85,000",
        numericPrice: 285000,
      },
      simple: {
        ...TIER_SPECIFICATIONS.simple,
        price: "₹3,60,000",
        numericPrice: 360000,
      },
      premium: {
        ...TIER_SPECIFICATIONS.premium,
        price: "₹5,20,000",
        numericPrice: 520000,
      },
    },
  },
  {
    id: "villa",
    name: "Independent Villa / Penthouse Project",
    slug: "independent-villa-penthouse-project",
    tag: "Luxury Bungalow & Penthouse",
    roomSummary: "4+ Bedrooms + Duplex Living + Bespoke Joinery",
    pdfUrl: "/uploads/catalogs/Villa_Penthouse_Bespoke_Catalog.pdf",
    pdfName: "Villa_Penthouse_Bespoke_Catalog.pdf",
    fileSize: "4.1 MB",
    description: "Architectural-scale bespoke turnkey furnishing for bungalows, duplexes, independent villas, and luxury penthouses.",
    models: {
      budget: {
        ...TIER_SPECIFICATIONS.budget,
        price: "₹4,60,000",
        numericPrice: 460000,
      },
      simple: {
        ...TIER_SPECIFICATIONS.simple,
        price: "₹5,80,000",
        numericPrice: 580000,
      },
      premium: {
        ...TIER_SPECIFICATIONS.premium,
        price: "₹8,50,000",
        numericPrice: 850000,
      },
    },
  },
];

export const DEFAULT_CALCULATOR_SETTINGS = {
  packageCategories: DEFAULT_PACKAGE_CATEGORIES,
};
