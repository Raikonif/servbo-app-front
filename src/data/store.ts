import type { Client, Product, Seller, StoreStats } from "@/domain/store";

export const sellers: Seller[] = [
  {
    id: "seller-northline",
    name: "Northline Workshop",
    email: "hello@northline.example",
    location: "Austin, TX",
    rating: 4.9,
    responseTime: "2h",
    verified: true,
  },
  {
    id: "seller-frame-focus",
    name: "Frame & Focus",
    email: "team@framefocus.example",
    location: "Denver, CO",
    rating: 4.8,
    responseTime: "45m",
    verified: true,
  },
  {
    id: "seller-casa",
    name: "Casa Supply",
    email: "orders@casa.example",
    location: "Miami, FL",
    rating: 4.7,
    responseTime: "1h",
    verified: false,
  },
];

export const products: Product[] = [
  {
    id: "prod-oak-desk",
    name: "Oak Studio Desk",
    slug: "oak-studio-desk",
    category: "Furniture",
    price: 420,
    inventory: 1,
    status: "active",
    sellerId: "seller-northline",
    description:
      "Solid oak desk with cable routing and soft-close storage for a home office.",
    tags: ["office", "local pickup", "wood"],
  },
  {
    id: "prod-camera-kit",
    name: "Mirrorless Camera Kit",
    slug: "mirrorless-camera-kit",
    category: "Electronics",
    price: 1180,
    inventory: 2,
    status: "active",
    sellerId: "seller-frame-focus",
    description:
      "Camera body with two lenses, spare batteries, and a padded sling bag.",
    tags: ["photo", "bundle", "insured shipping"],
  },
  {
    id: "prod-espresso",
    name: "Compact Espresso Bar",
    slug: "compact-espresso-bar",
    category: "Home",
    price: 690,
    inventory: 4,
    status: "draft",
    sellerId: "seller-casa",
    description:
      "Countertop espresso setup with grinder, tamper, and milk pitcher.",
    tags: ["kitchen", "open box", "warranty"],
  },
];

export const clients: Client[] = [
  {
    id: "client-maya",
    name: "Maya Chen",
    email: "maya.chen@example.com",
    segment: "vip",
    location: "Seattle, WA",
    orders: 12,
    lifetimeValue: 3840,
  },
  {
    id: "client-diego",
    name: "Diego Rivera",
    email: "diego.rivera@example.com",
    segment: "returning",
    location: "Chicago, IL",
    orders: 5,
    lifetimeValue: 1285,
  },
  {
    id: "client-nora",
    name: "Nora Patel",
    email: "nora.patel@example.com",
    segment: "new",
    location: "Portland, OR",
    orders: 1,
    lifetimeValue: 420,
  },
];

export function getStoreStats(): StoreStats {
  return {
    activeProducts: products.filter((product) => product.status === "active")
      .length,
    clients: clients.length,
    sellers: sellers.length,
    inventoryUnits: products.reduce(
      (sum, product) => sum + product.inventory,
      0,
    ),
    estimatedRevenue: clients.reduce(
      (sum, client) => sum + client.lifetimeValue,
      0,
    ),
  };
}

export function getSellerName(sellerId: string): string {
  return sellers.find((seller) => seller.id === sellerId)?.name ?? "Unassigned";
}
