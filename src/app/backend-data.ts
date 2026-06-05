import {
  categories as fallbackCategories,
  products as fallbackProducts,
  sellerProfiles as fallbackSellerProfiles,
  type Product,
  type SellerProfile,
} from "./products";

const API_BASE_URL =
  process.env.BACKEND_URL ??
  process.env.SERVBO_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

const API_TOKEN = process.env.SERVBO_API_TOKEN;

type PaginatedResponse<T> = {
  results?: T[];
};

type ApiCategory = {
  id: number;
  name: string;
};

type ApiUser = {
  id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_seller: boolean;
  is_client: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
};

type ApiProductCategory = ApiCategory | number | string;

type ApiProduct = {
  id: string;
  name: string;
  brand: string;
  currency: "BOB" | "EUR" | "USD" | string;
  categories?: ApiProductCategory[];
  categories_detail?: ApiCategory[];
  description: string;
  price: string;
  stock: number;
  seller: string;
};

type ApiEnvelope<T> = {
  data?: T;
};

type ApiBillingSubscription = {
  id: string;
  user: string;
  name: string;
  description: string;
  status:
    | "incomplete"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "trialing"
    | string;
  interval: "month" | "year" | string;
  currency: string;
  price_amount: number;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

type ApiBillingRecord = {
  id: string;
  user: string;
  subscription: string | null;
  subscription_detail?: ApiBillingSubscription;
  amount_due: number;
  amount_paid: number;
  currency: string;
  payment_method: string;
  status:
    | "pending"
    | "requires_action"
    | "paid"
    | "failed"
    | "canceled"
    | "refunded"
    | string;
  invoice_number: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingPlan = {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export type BillingSubscription = {
  id: string;
  name: string;
  description: string;
  status: string;
  price: string;
  interval: string;
  renewal: string;
  cancelAtPeriodEnd: boolean;
};

export type BillingRecord = {
  id: string;
  invoice: string;
  status: string;
  amountDue: string;
  amountPaid: string;
  paymentMethod: string;
  paidAt: string;
};

export type BillingData = {
  plans: BillingPlan[];
  subscriptions: BillingSubscription[];
  records: BillingRecord[];
  billingError?: string;
};

export type MarketplaceData = {
  categories: string[];
  products: Product[];
  sellerProfiles: Record<string, SellerProfile>;
  backendError?: string;
};

export const billingPlans: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    interval: "month",
    description: "For new sellers testing the marketplace.",
    features: ["10 active products", "Basic profile", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 99,
    interval: "month",
    description: "For active sellers growing their catalog.",
    features: ["50 active products", "Featured listings", "Priority support"],
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: 199,
    interval: "month",
    description: "For established stores with larger operations.",
    features: ["Unlimited products", "Advanced analytics", "Dedicated support"],
  },
];

const defaultProfileBilling = {
  plan: "No active plan",
  status: "not subscribed",
  price: "Bs. 0",
  renewal: "Choose a plan",
};

async function apiGet<T>(path: string): Promise<T> {
  if (!API_TOKEN) {
    throw new Error("SERVBO_API_TOKEN is not configured");
  }

  const response = await fetch(new URL(path, API_BASE_URL), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function readList<T>(
  payload: T[] | PaginatedResponse<T> | ApiEnvelope<T[]>,
): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if ("results" in payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  if ("data" in payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function getUserDisplayName(user?: ApiUser): string {
  if (!user) {
    return "Unknown seller";
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return fullName || user.username || user.email;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatFullDate(value: string | null): string {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatPrice(value: string, currency: string): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `${value} ${currency}`;
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatMinorUnitPrice(value: number, currency: string): string {
  if (currency.toUpperCase() !== "BOB") {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).format(value / 100);
  }

  return `Bs. ${(value / 100).toLocaleString("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
}

function categoryName(category: ApiProductCategory): string {
  if (typeof category === "object" && category !== null && "name" in category) {
    return category.name;
  }

  return String(category);
}

function productCategories(product: ApiProduct): string[] {
  if (
    Array.isArray(product.categories_detail) &&
    product.categories_detail.length
  ) {
    return product.categories_detail.map((category) => category.name);
  }

  if (Array.isArray(product.categories) && product.categories.length) {
    return product.categories.map(categoryName);
  }

  return ["Uncategorized"];
}

function buildSellerProfiles(
  users: ApiUser[],
  products: ApiProduct[],
  subscriptions: ApiBillingSubscription[] = [],
) {
  const productsBySeller = new Map<string, ApiProduct[]>();

  for (const product of products) {
    productsBySeller.set(product.seller, [
      ...(productsBySeller.get(product.seller) ?? []),
      product,
    ]);
  }

  const subscriptionsByUser = new Map<string, ApiBillingSubscription[]>();

  for (const subscription of subscriptions) {
    subscriptionsByUser.set(subscription.user, [
      ...(subscriptionsByUser.get(subscription.user) ?? []),
      subscription,
    ]);
  }

  return users.reduce<Record<string, SellerProfile>>((profiles, user) => {
    const name = getUserDisplayName(user);
    const sellerProducts = productsBySeller.get(user.id) ?? [];
    const subscription = subscriptionsByUser.get(user.id)?.[0];

    profiles[name] = {
      name,
      legalName: user.email,
      location: user.is_staff ? "Staff profile" : "ServBo user",
      memberSince: formatDate(user.created_at),
      responseRate: user.is_active ? "Active" : "Inactive",
      completedSales: 0,
      activeListings: sellerProducts.length,
      verification: user.is_email_verified
        ? "Email verified"
        : "Email verification pending",
      bio: [
        user.is_seller ? "Seller" : null,
        user.is_client ? "Client" : null,
        user.is_staff ? "Staff" : null,
      ]
        .filter(Boolean)
        .join(" / "),
      products: sellerProducts.map((product) => ({
        id: product.id,
        name: product.name,
        price: formatPrice(product.price, product.currency),
        status: `${product.stock} in stock`,
        category: productCategories(product).join(", "),
      })),
      billing: subscription
        ? {
            plan: subscription.name,
            status: subscription.status,
            price: formatMinorUnitPrice(
              subscription.price_amount,
              subscription.currency,
            ),
            renewal: formatFullDate(subscription.current_period_end),
          }
        : defaultProfileBilling,
    };

    return profiles;
  }, {});
}

function withDefaultBilling(
  profiles: Record<string, SellerProfile>,
): Record<string, SellerProfile> {
  return Object.fromEntries(
    Object.entries(profiles).map(([key, profile]) => [
      key,
      {
        ...profile,
        billing: profile.billing ?? defaultProfileBilling,
      },
    ]),
  );
}

function mapSubscriptions(
  subscriptions: ApiBillingSubscription[],
): BillingSubscription[] {
  return subscriptions.map((subscription) => ({
    id: subscription.id,
    name: subscription.name,
    description: subscription.description,
    status: subscription.status,
    price: formatMinorUnitPrice(
      subscription.price_amount,
      subscription.currency,
    ),
    interval: subscription.interval,
    renewal: formatFullDate(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  }));
}

function mapBillingRecords(records: ApiBillingRecord[]): BillingRecord[] {
  return records.map((record) => ({
    id: record.id,
    invoice: record.invoice_number || record.id,
    status: record.status,
    amountDue: formatMinorUnitPrice(record.amount_due, record.currency),
    amountPaid: formatMinorUnitPrice(record.amount_paid, record.currency),
    paymentMethod: record.payment_method,
    paidAt: formatFullDate(record.paid_at),
  }));
}

export async function getBillingData(): Promise<BillingData> {
  try {
    const [subscriptionsPayload, recordsPayload] = await Promise.all([
      apiGet<
        PaginatedResponse<ApiBillingSubscription> | ApiBillingSubscription[]
      >("/api/billing/subscriptions/"),
      apiGet<PaginatedResponse<ApiBillingRecord> | ApiBillingRecord[]>(
        "/api/billing/records/",
      ),
    ]);

    return {
      plans: billingPlans,
      subscriptions: mapSubscriptions(readList(subscriptionsPayload)),
      records: mapBillingRecords(readList(recordsPayload)),
    };
  } catch (error) {
    return {
      plans: billingPlans,
      subscriptions: [],
      records: [],
      billingError:
        error instanceof Error ? error.message : "Unable to load billing data",
    };
  }
}

function productImageClass(index: number): string {
  const classes = [
    "from-lime-200 via-lime-500 to-emerald-700",
    "from-white via-lime-400 to-slate-700",
    "from-lime-100 via-green-400 to-lime-700",
    "from-lime-300 via-emerald-500 to-slate-800",
  ];

  return classes[index % classes.length];
}

function mapProducts(products: ApiProduct[], users: ApiUser[]): Product[] {
  const usersById = new Map(users.map((user) => [user.id, user]));

  return products.map((product, index) => {
    const categories = productCategories(product);
    const seller = getUserDisplayName(usersById.get(product.seller));

    return {
      id: product.id,
      title: product.name,
      seller,
      category: categories[0] ?? "Uncategorized",
      price: formatPrice(product.price, product.currency),
      location: usersById.get(product.seller)?.email ?? product.seller,
      rating: 5,
      repliesIn: "Profile",
      condition: product.brand,
      description: product.description,
      imageClass: productImageClass(index),
      accent: "bg-lime-100 text-lime-900 dark:bg-lime-400 dark:text-slate-950",
      stock: `${product.stock} in stock`,
      posted: product.currency,
      specs: [
        `Brand: ${product.brand}`,
        `Currency: ${product.currency}`,
        `Stock: ${product.stock}`,
        `Categories: ${categories.join(", ")}`,
      ],
    };
  });
}

export async function getMarketplaceData(): Promise<MarketplaceData> {
  try {
    const [
      productsPayload,
      categoriesPayload,
      usersPayload,
      mePayload,
      subscriptionsPayload,
    ] = await Promise.all([
      apiGet<ApiProduct[] | PaginatedResponse<ApiProduct>>("/api/products/"),
      apiGet<PaginatedResponse<ApiCategory>>("/api/categories/"),
      apiGet<ApiEnvelope<ApiUser[]> | ApiUser[]>("/api/users/"),
      apiGet<ApiEnvelope<ApiUser>>("/api/users/me/"),
      apiGet<PaginatedResponse<ApiBillingSubscription>>(
        "/api/billing/subscriptions/",
      ),
    ]);

    const apiProducts = readList(productsPayload);
    const apiCategories = readList(categoriesPayload);
    const users = readList(usersPayload);
    const subscriptions = readList(subscriptionsPayload);

    if (
      mePayload.data &&
      !users.some((user) => user.id === mePayload.data?.id)
    ) {
      users.push(mePayload.data);
    }

    const products = mapProducts(apiProducts, users);
    const categoryNames = apiCategories.map((category) => category.name);
    const productCategoryNames = products.map((product) => product.category);

    return {
      categories: [
        "All",
        ...new Set([...categoryNames, ...productCategoryNames]),
      ],
      products,
      sellerProfiles: buildSellerProfiles(users, apiProducts, subscriptions),
    };
  } catch (error) {
    return {
      categories: fallbackCategories,
      products: fallbackProducts,
      sellerProfiles: withDefaultBilling(fallbackSellerProfiles),
      backendError:
        error instanceof Error
          ? error.message
          : "Unable to load backend marketplace data",
    };
  }
}
