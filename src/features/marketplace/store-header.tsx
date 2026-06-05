"use client";

import { PackageSearch, Store, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/products", label: "Products" },
  { href: "/clients", label: "Clients" },
  { href: "/sellers", label: "Sellers" },
  { href: "/billing", label: "Billing" },
  { href: "/pricing", label: "Pricing" },
  { href: "/become-a-vendor", label: "Become a vendor" },
  { href: "/profile", label: "Profile" },
];

export function StoreHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Store size={20} />
          </span>
          <span>
            <span className="block text-lg font-semibold leading-5">
              Servbo Store
            </span>
            <span className="text-sm text-slate-500">
              Products, clients, and sellers
            </span>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                pathname === item.href
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 text-sm text-slate-500 xl:flex">
          <span className="inline-flex items-center gap-1.5">
            <PackageSearch size={16} />
            Catalog first
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UsersRound size={16} />
            CRM ready
          </span>
        </div>
      </div>
    </header>
  );
}
