"use client";

import { Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/features/auth/user-menu";
import { useSession } from "@/hooks/use-session";
import { CREATOR_URL } from "@/lib/billing";

type NavItem = { href: string; label: string; external?: boolean };

export function StoreHeader() {
  const pathname = usePathname();
  const user = useSession().data?.user;

  const navItems: NavItem[] = [
    { href: "/", label: "Catalog" },
    { href: "/sellers", label: "Sellers" },
    ...(user
      ? [
          { href: "/profile", label: "Profile" },
          { href: "/billing", label: "Billing" },
          user.is_seller
            ? { href: CREATOR_URL, label: "Creator app", external: true }
            : { href: "/become-a-vendor", label: "Become a seller" },
        ]
      : []),
  ];

  const isActive = (item: NavItem) =>
    !item.external &&
    (item.href === "/"
      ? pathname === "/" || pathname.startsWith("/products")
      : pathname.startsWith(item.href));

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Store size={20} />
          </span>
          <span className="block text-lg font-semibold leading-5">
            Servbo Store
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const className = `rounded-md border px-3 py-2 text-sm font-medium transition ${
              isActive(item)
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
            }`;
            return item.external ? (
              <a className={className} href={item.href} key={item.href}>
                {item.label}
              </a>
            ) : (
              <Link className={className} href={item.href} key={item.href}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <UserMenu />
      </div>
    </header>
  );
}
