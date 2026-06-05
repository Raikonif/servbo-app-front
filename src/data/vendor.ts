export type VendorBenefit = {
  title: string;
  description: string;
};

export type VendorStep = {
  title: string;
  description: string;
  duration: string;
};

export type VendorRequirement = {
  label: string;
  value: string;
};

export type VendorStory = {
  seller: string;
  category: string;
  quote: string;
  metric: string;
};

export type VendorApplication = {
  headline: string;
  summary: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
  benefits: VendorBenefit[];
  steps: VendorStep[];
  requirements: VendorRequirement[];
  story: VendorStory;
};

export const vendorApplication: VendorApplication = {
  headline: "Sell trusted products to buyers already browsing Servbo.",
  summary:
    "Create a verified vendor profile, publish your first listings, and manage buyer conversations from one marketplace workspace.",
  stats: [
    { label: "Avg. seller rating", value: "4.8/5" },
    { label: "Reply target", value: "24h" },
    { label: "Active categories", value: "12" },
  ],
  benefits: [
    {
      title: "Verified storefront",
      description:
        "Show buyers a clear business profile with identity, location, and listing history.",
    },
    {
      title: "Catalog tools",
      description:
        "Organize product details, stock notes, pricing, and category placement before publishing.",
    },
    {
      title: "Buyer messaging",
      description:
        "Keep inquiries, pickup questions, and follow-up messages in a marketplace-safe workflow.",
    },
  ],
  steps: [
    {
      title: "Submit business details",
      description:
        "Add your seller name, contact email, market location, and tax or identity information.",
      duration: "5 min",
    },
    {
      title: "Prepare first listings",
      description:
        "Upload product information, availability, prices, and fulfillment preferences.",
      duration: "15 min",
    },
    {
      title: "Complete review",
      description:
        "Servbo reviews the profile and enables publishing once the vendor checks pass.",
      duration: "1-2 days",
    },
  ],
  requirements: [
    { label: "Business email", value: "Required" },
    { label: "Product photos", value: "3+ per listing" },
    { label: "Fulfillment terms", value: "Pickup or shipping" },
    { label: "Review status", value: "Manual approval" },
  ],
  story: {
    seller: "Frame & Focus",
    category: "Electronics",
    quote:
      "Servbo gave our resale catalog a cleaner buyer flow and helped us respond to high-intent inquiries faster.",
    metric: "342 completed sales",
  },
};
