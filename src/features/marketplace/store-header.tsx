"use client";

import { Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/features/auth/user-menu";
import { useSession } from "@/hooks/use-session";
import { CREATOR_URL } from "@/lib/billing";
import { ThemeToggle } from "./theme-toggle";

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
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          className="flex shrink-0 items-center gap-2.5 rounded-lg"
          href="/"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-fg">
            <Store size={17} strokeWidth={2.25} />
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight sm:block">
            Servbo
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 [scrollbar-width:none]"
        >
          {navItems.map((item) => {
            const active = isActive(item);
            const className = `relative shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-surface-2 text-fg"
                : "text-muted hover:bg-surface-2 hover:text-fg"
            }`;
            return item.external ? (
              <a className={className} href={item.href} key={item.href}>
                {item.label}
              </a>
            ) : (
              <Link
                aria-current={active ? "page" : undefined}
                className={className}
                href={item.href}
                key={item.href}
              >
                {item.label}
                {active ? (
                  <span className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent" />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
