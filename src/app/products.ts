export type Product = {
  id: string;
  title: string;
  seller: string;
  category: string;
  price: string;
  location: string;
  rating: number;
  repliesIn: string;
  condition: string;
  description: string;
  imageClass: string;
  accent: string;
  stock: string;
  posted: string;
  specs: string[];
};

export type SellerProduct = {
  id: string;
  name: string;
  price: string;
  status: string;
  category: string;
};

export type SellerProfile = {
  name: string;
  legalName: string;
  location: string;
  memberSince: string;
  responseRate: string;
  completedSales: number;
  activeListings: number;
  verification: string;
  bio: string;
  products: SellerProduct[];
  billing?: {
    plan: string;
    status: string;
    price: string;
    renewal: string;
  };
};

export const products: Product[] = [
  {
    id: "studio-desk",
    title: "Oak Studio Desk",
    seller: "Northline Workshop",
    category: "Furniture",
    price: "$420",
    location: "Austin, TX",
    rating: 4.9,
    repliesIn: "2h",
    condition: "Like new",
    description:
      "Solid oak desk with cable routing, soft-close drawer, and a clean work surface for a home office or creative studio.",
    imageClass: "from-lime-200 via-lime-500 to-emerald-700",
    accent: "bg-lime-100 text-lime-900 dark:bg-lime-400 dark:text-slate-950",
    stock: "1 available",
    posted: "Today",
    specs: ["58 in wide", "Solid oak", "Local pickup"],
  },
  {
    id: "mirrorless-kit",
    title: "Mirrorless Camera Kit",
    seller: "Frame & Focus",
    category: "Electronics",
    price: "$1,180",
    location: "Denver, CO",
    rating: 4.8,
    repliesIn: "45m",
    condition: "Excellent",
    description:
      "Travel-ready camera body with two lenses, spare batteries, and a padded sling bag. Shutter count is under 6k.",
    imageClass: "from-white via-lime-400 to-slate-700",
    accent: "bg-lime-100 text-lime-900 dark:bg-lime-400 dark:text-slate-950",
    stock: "Kit bundle",
    posted: "2 days ago",
    specs: ["24MP sensor", "2 lenses", "Ships insured"],
  },
  {
    id: "espresso-machine",
    title: "Compact Espresso Bar",
    seller: "Casa Supply",
    category: "Home",
    price: "$690",
    location: "Miami, FL",
    rating: 4.7,
    repliesIn: "1h",
    condition: "Open box",
    description:
      "Countertop espresso machine with grinder, tamper, and milk pitcher. Good fit for small kitchens and offices.",
    imageClass: "from-lime-100 via-green-400 to-lime-700",
    accent: "bg-lime-100 text-lime-900 dark:bg-lime-400 dark:text-slate-950",
    stock: "Open box",
    posted: "Yesterday",
    specs: ["Built-in grinder", "9 bar pump", "Warranty card"],
  },
  {
    id: "city-bike",
    title: "Urban Commuter Bike",
    seller: "Loop Cycles",
    category: "Sport",
    price: "$540",
    location: "Portland, OR",
    rating: 5,
    repliesIn: "3h",
    condition: "Refurbished",
    description:
      "Lightweight commuter bike with hydraulic brakes, puncture-resistant tires, and rear rack already installed.",
    imageClass: "from-lime-300 via-emerald-500 to-slate-800",
    accent: "bg-lime-100 text-lime-900 dark:bg-lime-400 dark:text-slate-950",
    stock: "Ready now",
    posted: "Today",
    specs: ["Medium frame", "Hydraulic brakes", "Rear rack"],
  },
  {
    id: "linen-sofa",
    title: "Modular Linen Sofa",
    seller: "Marlow Living",
    category: "Furniture",
    price: "$980",
    location: "Chicago, IL",
    rating: 4.6,
    repliesIn: "4h",
    condition: "Good",
    description:
      "Three-piece modular sofa with washable linen covers and a chaise that can be moved to either side.",
    imageClass: "from-white via-lime-300 to-emerald-700",
    accent: "bg-lime-100 text-lime-900 dark:bg-lime-400 dark:text-slate-950",
    stock: "3 modules",
    posted: "4 days ago",
    specs: ["3 modules", "Washable covers", "Delivery available"],
  },
  {
    id: "watch-set",
    title: "Automatic Watch Set",
    seller: "Crown Market",
    category: "Accessories",
    price: "$360",
    location: "Seattle, WA",
    rating: 4.9,
    repliesIn: "20m",
    condition: "Excellent",
    description:
      "Automatic dress watch with leather and steel straps, travel case, and service receipt from last month.",
    imageClass: "from-lime-200 via-lime-500 to-slate-900",
    accent: "bg-lime-100 text-lime-900 dark:bg-lime-400 dark:text-slate-950",
    stock: "Two straps",
    posted: "Today",
    specs: ["40mm case", "Two straps", "Service receipt"],
  },
];

export const categories = ["All", "Furniture", "Electronics", "Home", "Sport"];

export const sellerProfiles: Record<string, SellerProfile> = {
  "Northline Workshop": {
    name: "Northline Workshop",
    legalName: "Northline Workshop LLC",
    location: "Austin, TX",
    memberSince: "2021",
    responseRate: "98%",
    completedSales: 214,
    activeListings: 8,
    verification: "Business identity verified",
    bio: "Small-batch furniture seller focused on hardwood desks, shelves, and studio storage pieces.",
    products: [
      {
        id: "studio-desk",
        name: "Oak Studio Desk",
        price: "$420",
        status: "Available",
        category: "Furniture",
      },
      {
        id: "walnut-shelf",
        name: "Walnut Wall Shelf",
        price: "$180",
        status: "Available",
        category: "Furniture",
      },
      {
        id: "maple-drawer",
        name: "Maple Drawer Unit",
        price: "$260",
        status: "Reserved",
        category: "Furniture",
      },
    ],
  },
  "Frame & Focus": {
    name: "Frame & Focus",
    legalName: "Frame & Focus Camera Exchange",
    location: "Denver, CO",
    memberSince: "2020",
    responseRate: "96%",
    completedSales: 342,
    activeListings: 12,
    verification: "Storefront and tax profile verified",
    bio: "Camera resale studio listing tested bodies, lenses, cases, and travel-ready creator kits.",
    products: [
      {
        id: "mirrorless-kit",
        name: "Mirrorless Camera Kit",
        price: "$1,180",
        status: "Available",
        category: "Electronics",
      },
      {
        id: "prime-lens",
        name: "35mm Prime Lens",
        price: "$390",
        status: "Available",
        category: "Electronics",
      },
      {
        id: "field-tripod",
        name: "Carbon Field Tripod",
        price: "$210",
        status: "Low stock",
        category: "Electronics",
      },
    ],
  },
  "Casa Supply": {
    name: "Casa Supply",
    legalName: "Casa Supply Co.",
    location: "Miami, FL",
    memberSince: "2022",
    responseRate: "94%",
    completedSales: 158,
    activeListings: 6,
    verification: "Inventory and seller identity verified",
    bio: "Home goods reseller with kitchen, coffee, and compact appliance listings for local pickup.",
    products: [
      {
        id: "espresso-machine",
        name: "Compact Espresso Bar",
        price: "$690",
        status: "Available",
        category: "Home",
      },
      {
        id: "ceramic-set",
        name: "Ceramic Dinner Set",
        price: "$140",
        status: "Available",
        category: "Home",
      },
      {
        id: "steel-kettle",
        name: "Brushed Steel Kettle",
        price: "$75",
        status: "Reserved",
        category: "Home",
      },
    ],
  },
  "Loop Cycles": {
    name: "Loop Cycles",
    legalName: "Loop Cycles Repair LLC",
    location: "Portland, OR",
    memberSince: "2019",
    responseRate: "99%",
    completedSales: 489,
    activeListings: 15,
    verification: "Workshop and seller profile verified",
    bio: "Refurbished bicycle shop selling tuned commuters, parts, locks, bags, and service-ready accessories.",
    products: [
      {
        id: "city-bike",
        name: "Urban Commuter Bike",
        price: "$540",
        status: "Available",
        category: "Sport",
      },
      {
        id: "pannier-pair",
        name: "Waterproof Pannier Pair",
        price: "$95",
        status: "Available",
        category: "Sport",
      },
      {
        id: "u-lock",
        name: "Hardened U-Lock",
        price: "$48",
        status: "Low stock",
        category: "Sport",
      },
    ],
  },
  "Marlow Living": {
    name: "Marlow Living",
    legalName: "Marlow Living Resale",
    location: "Chicago, IL",
    memberSince: "2021",
    responseRate: "92%",
    completedSales: 121,
    activeListings: 5,
    verification: "Seller identity verified",
    bio: "Apartment-friendly furniture seller specializing in modular sofas, tables, and delivery-ready pieces.",
    products: [
      {
        id: "linen-sofa",
        name: "Modular Linen Sofa",
        price: "$980",
        status: "Available",
        category: "Furniture",
      },
      {
        id: "nesting-table",
        name: "Oak Nesting Tables",
        price: "$220",
        status: "Available",
        category: "Furniture",
      },
      {
        id: "media-console",
        name: "Low Media Console",
        price: "$360",
        status: "Reserved",
        category: "Furniture",
      },
    ],
  },
  "Crown Market": {
    name: "Crown Market",
    legalName: "Crown Market Collectibles",
    location: "Seattle, WA",
    memberSince: "2018",
    responseRate: "97%",
    completedSales: 566,
    activeListings: 19,
    verification: "Collector profile verified",
    bio: "Accessories seller with inspected watches, straps, cases, service records, and collectible small goods.",
    products: [
      {
        id: "watch-set",
        name: "Automatic Watch Set",
        price: "$360",
        status: "Available",
        category: "Accessories",
      },
      {
        id: "leather-roll",
        name: "Leather Watch Roll",
        price: "$82",
        status: "Available",
        category: "Accessories",
      },
      {
        id: "bracelet-tool",
        name: "Bracelet Sizing Tool",
        price: "$24",
        status: "Available",
        category: "Accessories",
      },
    ],
  },
};
