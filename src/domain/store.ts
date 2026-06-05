export type ProductStatus = "active" | "draft" | "archived";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  inventory: number;
  status: ProductStatus;
  sellerId: string;
  description: string;
  tags: string[];
};

export type Client = {
  id: string;
  name: string;
  email: string;
  segment: "new" | "returning" | "vip";
  location: string;
  orders: number;
  lifetimeValue: number;
};

export type Seller = {
  id: string;
  name: string;
  email: string;
  location: string;
  rating: number;
  responseTime: string;
  verified: boolean;
};

export type StoreStats = {
  activeProducts: number;
  clients: number;
  sellers: number;
  inventoryUnits: number;
  estimatedRevenue: number;
};
