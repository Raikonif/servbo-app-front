export type PricingPlan = {
  id: string;
  name: string;
  audience: string;
  description: string;
  price: number;
  interval: "month" | "year";
  highlighted?: boolean;
  features: string[];
  limits: Array<{
    label: string;
    value: string;
  }>;
};

export type BillingMetric = {
  label: string;
  value: string;
  helper: string;
};

export type PaymentMethod = {
  brand: string;
  last4: string;
  expires: string;
  holder: string;
};

export type BillingInvoice = {
  id: string;
  number: string;
  status: "paid" | "open" | "draft";
  date: string;
  amount: string;
  method: string;
};

export type BillingUsageItem = {
  label: string;
  used: number;
  limit: number;
  unit: string;
};

export type BillingAccount = {
  company: string;
  owner: string;
  email: string;
  taxId: string;
  currentPlanId: string;
  subscription: {
    status: string;
    renewalDate: string;
    seats: number;
    billingCycle: string;
  };
  metrics: BillingMetric[];
  paymentMethod: PaymentMethod;
  invoices: BillingInvoice[];
  usage: BillingUsageItem[];
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    audience: "New sellers",
    description: "Launch a compact catalog and start handling buyer inquiries.",
    price: 49,
    interval: "month",
    features: [
      "10 active products",
      "Basic seller profile",
      "Buyer message inbox",
      "Email support",
    ],
    limits: [
      { label: "Products", value: "10" },
      { label: "Seats", value: "1" },
      { label: "Support", value: "Email" },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    audience: "Active stores",
    description:
      "Grow a trusted storefront with priority listings and team access.",
    price: 99,
    interval: "month",
    highlighted: true,
    features: [
      "50 active products",
      "Featured marketplace placements",
      "Shared team workspace",
      "Priority support",
    ],
    limits: [
      { label: "Products", value: "50" },
      { label: "Seats", value: "3" },
      { label: "Support", value: "Priority" },
    ],
  },
  {
    id: "scale",
    name: "Scale",
    audience: "Marketplace operators",
    description: "Run high-volume seller operations with advanced controls.",
    price: 199,
    interval: "month",
    features: [
      "Unlimited products",
      "Advanced catalog analytics",
      "Seller quality workflows",
      "Dedicated success support",
    ],
    limits: [
      { label: "Products", value: "Unlimited" },
      { label: "Seats", value: "10" },
      { label: "Support", value: "Dedicated" },
    ],
  },
];

export const billingAccount: BillingAccount = {
  company: "Northline Workshop LLC",
  owner: "Alex Morgan",
  email: "billing@northline.example",
  taxId: "US-3847-2219",
  currentPlanId: "growth",
  subscription: {
    status: "active",
    renewalDate: "Jul 1, 2026",
    seats: 3,
    billingCycle: "Monthly",
  },
  metrics: [
    {
      label: "Current balance",
      value: "Bs. 0",
      helper: "No outstanding payments",
    },
    {
      label: "Next invoice",
      value: "Bs. 99",
      helper: "Due Jul 1, 2026",
    },
    {
      label: "Plan usage",
      value: "68%",
      helper: "34 of 50 products active",
    },
  ],
  paymentMethod: {
    brand: "Visa",
    last4: "4242",
    expires: "09/28",
    holder: "Alex Morgan",
  },
  invoices: [
    {
      id: "inv-2026-006",
      number: "SVB-2026-006",
      status: "paid",
      date: "Jun 1, 2026",
      amount: "Bs. 99",
      method: "Visa ending 4242",
    },
    {
      id: "inv-2026-005",
      number: "SVB-2026-005",
      status: "paid",
      date: "May 1, 2026",
      amount: "Bs. 99",
      method: "Visa ending 4242",
    },
    {
      id: "inv-2026-004",
      number: "SVB-2026-004",
      status: "paid",
      date: "Apr 1, 2026",
      amount: "Bs. 99",
      method: "Visa ending 4242",
    },
  ],
  usage: [
    {
      label: "Active products",
      used: 34,
      limit: 50,
      unit: "products",
    },
    {
      label: "Team seats",
      used: 3,
      limit: 3,
      unit: "seats",
    },
    {
      label: "Featured listings",
      used: 8,
      limit: 15,
      unit: "placements",
    },
  ],
};
