"use client";

import { Button, Card, Chip } from "@heroui/react";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Grid2X2,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product, SellerProfile } from "./products";

type MarketplaceProps = {
  backendError?: string;
  categories: string[];
  products: Product[];
  sellerProfiles: Record<string, SellerProfile>;
};

const cardSurface = "border-slate-200 bg-white shadow-sm";
const softSurface = "border-slate-200 bg-slate-50 text-slate-600";
const mutedText = "text-slate-600";
const primaryButton = "bg-emerald-600 text-white hover:bg-emerald-700";

export function Marketplace({
  backendError,
  categories,
  products,
  sellerProfiles,
}: MarketplaceProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(
    products[0]?.id ?? null,
  );

  const visibleProducts = useMemo(
    () =>
      activeCategory === "All"
        ? products
        : products.filter((product) => product.category === activeCategory),
    [activeCategory, products],
  );

  const selectedProduct =
    products.find((product) => product.id === selectedId) ?? null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:mr-[420px] lg:px-8 xl:mr-[448px]">
        <div className="space-y-6">
          <HeaderSummary products={products} />

          {backendError ? (
            <Card className="border-amber-200 bg-amber-50 text-amber-900 shadow-sm">
              <Card.Content className="p-4 text-sm">
                Backend data is unavailable, showing local sample data.{" "}
                <span className="font-medium">{backendError}</span>
              </Card.Content>
            </Card>
          ) : null}

          <Card className={cardSurface} variant="default">
            <Card.Content className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
              <label
                className={`flex min-h-11 flex-1 items-center gap-3 rounded-lg border px-3 text-sm ${softSurface}`}
              >
                <Search size={18} />
                <input
                  className="w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-500"
                  placeholder="Search products, sellers, or locations"
                  type="search"
                />
              </label>
              <Button
                className="border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                size="md"
                variant="outline"
              >
                <SlidersHorizontal size={17} />
                Filters
              </Button>
            </Card.Content>
          </Card>

          <CategoryNav
            activeCategory={activeCategory}
            categories={categories}
            onChange={setActiveCategory}
          />

          <section id="products" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Product list</h2>
                <p className={`text-sm ${mutedText}`}>
                  Select a product to open details and seller contact.
                </p>
              </div>
              <Chip color="accent" size="sm" variant="soft">
                <Chip.Label>{visibleProducts.length} shown</Chip.Label>
              </Chip>
            </div>
            <div className="grid gap-4">
              {visibleProducts.length ? (
                visibleProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    isSelected={product.id === selectedProduct?.id}
                    onSelect={() => setSelectedId(product.id)}
                  />
                ))
              ) : (
                <Card className={cardSurface} variant="default">
                  <Card.Content className="p-6 text-sm text-slate-600">
                    No products match this category.
                  </Card.Content>
                </Card>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:fixed lg:bottom-0 lg:right-0 lg:top-[81px] lg:z-20 lg:w-[420px] lg:overflow-y-auto lg:border-l lg:border-slate-200 lg:bg-white lg:px-5 lg:pb-6 lg:pt-5 lg:shadow-xl xl:w-[448px]">
          {selectedProduct ? (
            <div
              key={selectedProduct.id}
              className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300 ease-out motion-reduce:animate-none"
            >
              <ProductDetail product={selectedProduct} />
              <SellerPanel
                product={selectedProduct}
                seller={sellerProfiles[selectedProduct.seller]}
              />
            </div>
          ) : (
            <EmptySelection />
          )}
        </aside>
      </section>
    </main>
  );
}

function HeaderSummary({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Chip color="success" size="sm" variant="soft">
            <Chip.Label>SSR-ready marketplace</Chip.Label>
          </Chip>
          <span className={`text-sm ${mutedText}`}>
            {products.length} products from verified sellers
          </span>
        </div>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
          Browse vivid product listings before contacting a seller.
        </h1>
      </div>
      <Card className={`self-end ${cardSurface}`} variant="default">
        <Card.Content className="grid grid-cols-3 gap-4 p-4 text-center">
          <div>
            <p className="text-2xl font-semibold">4.8</p>
            <p className={`text-xs ${mutedText}`}>avg rating</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">24h</p>
            <p className={`text-xs ${mutedText}`}>reply goal</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">US</p>
            <p className={`text-xs ${mutedText}`}>market</p>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

function CategoryNav({
  activeCategory,
  categories,
  onChange,
}: {
  activeCategory: string;
  categories: string[];
  onChange: (category: string) => void;
}) {
  return (
    <section
      aria-labelledby="category-heading"
      className="flex gap-2 overflow-x-auto pb-1"
    >
      <h2 className="sr-only" id="category-heading">
        Product categories
      </h2>
      {categories.map((category) => (
        <Button
          key={category}
          className={
            activeCategory === category
              ? primaryButton
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
          }
          size="sm"
          variant={activeCategory === category ? "primary" : "outline"}
          onPress={() => onChange(category)}
        >
          {category === "All" ? <Grid2X2 size={16} /> : null}
          {category}
        </Button>
      ))}
    </section>
  );
}

function ProductRow({
  product,
  isSelected,
  onSelect,
}: {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={`border bg-white shadow-sm transition ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-200"
          : "border-slate-200 hover:border-emerald-300"
      }`}
      variant="default"
    >
      <Card.Content className="p-0">
        <button
          className="grid w-full gap-0 text-left sm:grid-cols-[184px_1fr]"
          type="button"
          onClick={onSelect}
        >
          <div
            className={`relative min-h-[180px] overflow-hidden rounded-t-lg bg-gradient-to-br sm:rounded-l-lg sm:rounded-tr-none ${product.imageClass}`}
          >
            <div className="absolute inset-x-4 bottom-4 rounded-lg bg-white/90 p-3 text-slate-950 shadow-sm backdrop-blur">
              <p className="text-xs font-medium opacity-75">
                {product.category}
              </p>
              <p className="text-2xl font-semibold">{product.price}</p>
            </div>
          </div>
          <div className="grid min-h-[180px] gap-4 p-4 md:grid-cols-[1fr_auto]">
            <div className="flex flex-col justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Chip color="default" size="sm" variant="soft">
                    <Chip.Label>{product.condition}</Chip.Label>
                  </Chip>
                  <Chip color="warning" size="sm" variant="soft">
                    <Chip.Label>{product.posted}</Chip.Label>
                  </Chip>
                  <span className={`text-xs ${mutedText}`}>
                    {product.stock}
                  </span>
                </div>
                <h3 className="text-xl font-semibold leading-6">
                  {product.title}
                </h3>
                <p className={`mt-2 max-w-2xl text-sm leading-6 ${mutedText}`}>
                  {product.description}
                </p>
              </div>
              <div
                className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm ${mutedText}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Store size={15} />
                  {product.seller}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} />
                  {product.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="fill-amber-400 text-amber-400" size={15} />
                  {product.rating}
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-3 md:flex-col md:items-end">
              <Heart className={mutedText} size={18} />
              <span
                className={`inline-flex min-h-8 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${
                  isSelected ? primaryButton : "text-slate-600"
                }`}
              >
                {isSelected ? "Selected" : "View details"}
                <ArrowRight size={16} />
              </span>
            </div>
          </div>
        </button>
      </Card.Content>
    </Card>
  );
}

function ProductDetail({ product }: { product: Product }) {
  return (
    <Card id="details" className={cardSurface} variant="default">
      <Card.Header className="items-start justify-between gap-3 p-4">
        <div>
          <p className={`text-sm font-medium ${mutedText}`}>Product detail</p>
          <Card.Title className="mt-1 text-2xl">{product.title}</Card.Title>
        </div>
        <Chip color="success" size="sm" variant="soft">
          <Chip.Label>{product.condition}</Chip.Label>
        </Chip>
      </Card.Header>
      <Card.Content className="space-y-4 p-4 pt-0">
        <div
          className={`h-44 rounded-lg bg-gradient-to-br ${product.imageClass}`}
        />
        <p className={`text-sm leading-6 ${mutedText}`}>
          {product.description}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {product.specs.map((spec) => (
            <div
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
              key={spec}
            >
              {spec}
            </div>
          ))}
        </div>
      </Card.Content>
      <Card.Footer className="flex items-center justify-between border-t border-slate-200 p-4">
        <div>
          <p className={`text-xs ${mutedText}`}>Listed price</p>
          <p className="text-2xl font-semibold">{product.price}</p>
        </div>
        <Button className={primaryButton} size="md" variant="primary">
          <Link
            className="inline-flex items-center gap-2"
            href={`/products/${product.id}`}
          >
            Full detail
            <ArrowRight size={17} />
          </Link>
        </Button>
        <Button
          className="border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
          size="md"
          variant="outline"
        >
          Seller panel
          <ArrowRight size={17} />
        </Button>
      </Card.Footer>
    </Card>
  );
}

function SellerPanel({
  product,
  seller,
}: {
  product: Product;
  seller?: SellerProfile;
}) {
  const profile =
    seller ??
    ({
      name: product.seller,
      legalName: product.seller,
      location: product.location,
      memberSince: "2024",
      responseRate: "95%",
      completedSales: 0,
      activeListings: 1,
      verification: "Identity reviewed",
      bio: "Seller profile details are being prepared.",
      billing: {
        plan: "No active plan",
        status: "not subscribed",
        price: "Bs. 0",
        renewal: "Choose a plan",
      },
      products: [
        {
          id: product.id,
          name: product.title,
          price: product.price,
          status: product.stock,
          category: product.category,
        },
      ],
    } satisfies SellerProfile);

  return (
    <Card id="seller" className={cardSurface} variant="default">
      <Card.Header className="gap-3 p-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${product.accent}`}
        >
          <Store size={20} />
        </div>
        <div>
          <p className="font-semibold">{profile.name}</p>
          <p className={`text-sm ${mutedText}`}>{profile.legalName}</p>
        </div>
      </Card.Header>
      <Card.Content className="space-y-4 p-4 pt-0">
        <p className={`text-sm leading-6 ${mutedText}`}>{profile.bio}</p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className={mutedText}>Rating</p>
            <p className="mt-1 font-semibold">{product.rating}/5</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className={mutedText}>Replies in</p>
            <p className="mt-1 font-semibold">{product.repliesIn}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className={mutedText}>Sales</p>
            <p className="mt-1 font-semibold">{profile.completedSales}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className={mutedText}>Response rate</p>
            <p className="mt-1 font-semibold">{profile.responseRate}</p>
          </div>
        </div>

        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <span className={`inline-flex items-center gap-2 ${mutedText}`}>
              <MapPin size={16} />
              Location
            </span>
            <span className="font-medium">{profile.location}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <span className={`inline-flex items-center gap-2 ${mutedText}`}>
              <Clock3 size={16} />
              Member since
            </span>
            <span className="font-medium">{profile.memberSince}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
            <span className={`inline-flex items-center gap-2 ${mutedText}`}>
              <Package size={16} />
              Active listings
            </span>
            <span className="font-medium">{profile.activeListings}</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <BadgeCheck className="text-emerald-600" size={16} />
            {profile.verification}
          </p>
        </div>

        {profile.billing ? (
          <div className="rounded-lg border border-slate-200 p-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">Billing plan</p>
                <p className={`mt-1 ${mutedText}`}>{profile.billing.plan}</p>
              </div>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase text-emerald-700">
                {profile.billing.status}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <p className={mutedText}>Price</p>
                <p className="font-semibold">{profile.billing.price}</p>
              </div>
              <div>
                <p className={mutedText}>Renewal</p>
                <p className="font-semibold">{profile.billing.renewal}</p>
              </div>
            </div>
          </div>
        ) : null}

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">Seller products</h3>
            <Chip color="accent" size="sm" variant="soft">
              <Chip.Label>{profile.products.length} shown</Chip.Label>
            </Chip>
          </div>
          <div className="space-y-2">
            {profile.products.map((sellerProduct) => (
              <div
                className={`rounded-lg border p-3 ${
                  sellerProduct.id === product.id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200"
                }`}
                key={sellerProduct.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium leading-5">
                      {sellerProduct.name}
                    </p>
                    <p className={`mt-1 text-xs ${mutedText}`}>
                      {sellerProduct.category}
                    </p>
                  </div>
                  <p className="font-semibold">{sellerProduct.price}</p>
                </div>
                <p className={`mt-2 text-xs ${mutedText}`}>
                  {sellerProduct.status}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Card.Content>
      <Card.Footer className="grid grid-cols-2 gap-2 border-t border-slate-200 p-4">
        <Button
          className="border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
          fullWidth
          size="md"
          variant="outline"
        >
          <Mail size={17} />
          Email
        </Button>
        <Button className={primaryButton} fullWidth size="md" variant="primary">
          <MessageCircle size={17} />
          Message
        </Button>
      </Card.Footer>
    </Card>
  );
}

function EmptySelection() {
  return (
    <Card className={cardSurface} variant="default">
      <Card.Content className="space-y-4 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Select a product</h2>
          <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
            Product details and seller contact options appear here only after a
            listing is selected.
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}
