import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link, router and redirect: "/products/1" becomes
// "/es/products/1" in the active language.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
