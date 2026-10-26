"use client";

import { Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { UserMenu } from "@/features/auth/user-menu";
import { CartLink } from "@/features/cart/cart-link";
import { LanguageSwitcher } from "@/features/i18n/language-switcher";
import { NotificationBell } from "@/features/notifications/notification-bell";
import { useSession } from "@/hooks/use-session";
import { Link, usePathname } from "@/i18n/navigation";
import { CREATOR_URL } from "@/lib/billing";
import { ThemeToggle } from "./theme-toggle";

type NavItem = { href: string; label: string; external?: boolean };

export function StoreHeader() {
  const t = useTranslations("header");
  // Locale-aware: unprefixed ("/", "/products/…"), so matching stays simple.
  const pathname = usePathname();
  const user = useSession().data?.user;

  const navItems: NavItem[] = [
    { href: "/", label: t("catalog") },
    { href: "/sellers", label: t("sellers") },
    ...(user
      ? [
          { href: "/orders", label: t("orders") },
          { href: "/profile", label: t("profile") },
          { href: "/billing", label: t("billing") },
          user.is_seller
            ? { href: CREATOR_URL, label: t("creator"), external: true }
            : { href: "/become-a-vendor", label: t("becomeSeller") },
        ]
      : []),
  ];

  // Phones: logo and actions on the first row, the nav as a scrolling second
  // row; squeezed between them it shrank to a few pixels. Signed in, the nav
  // has six links and the user menu is wide, so they share one row only from
  // xl (at md the nav was 8 px wide; even at 1280 "App Creator" was cut off).
  const layout = user
    ? {
        row: "xl:h-16 xl:flex-nowrap",
        logo: "xl:h-auto",
        nav: "max-xl:[mask-image:linear-gradient(to_right,black_85%,transparent)] xl:order-none xl:flex-1 xl:basis-auto xl:pb-0",
        actions: "xl:ml-0",
      }
    : {
        row: "md:h-16 md:flex-nowrap",
        logo: "md:h-auto",
        nav: "max-md:[mask-image:linear-gradient(to_right,black_85%,transparent)] md:order-none md:flex-1 md:basis-auto md:pb-0",
        actions: "md:ml-0",
      };

  const isActive = (item: NavItem) =>
    !item.external &&
    (item.href === "/"
      ? pathname === "/" || pathname.startsWith("/products")
      : pathname.startsWith(item.href));

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/70">
      <div
        className={`mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 px-4 sm:px-6 lg:px-8 ${layout.row}`}
      >
        <Link
          className={`flex h-14 shrink-0 items-center gap-2.5 rounded-lg ${layout.logo}`}
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
          aria-label={t("nav")}
          className={`-mx-1 order-last flex min-w-0 basis-full gap-1 overflow-x-auto px-1 pb-2 [scrollbar-width:none] ${layout.nav}`}
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
        <div
          className={`ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 ${layout.actions}`}
        >
          {/* Two letters only on phones, so the header fits at 375 px. */}
          <span className="flex sm:hidden">
            <LanguageSwitcher compact />
          </span>
          <span className="hidden sm:flex">
            <LanguageSwitcher />
          </span>
          <ThemeToggle />
          <NotificationBell />
          <CartLink />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
