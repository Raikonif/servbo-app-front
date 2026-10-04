"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { type ReactNode, ViewTransition } from "react";
import { productHref, productTransitionName } from "@/lib/catalog";

// Card → panel → full-window modal morph (openspec D17). Two mounted
// <ViewTransition>s may not share a name, so exactly one element owns each
// name at a time and the name *moves* as the URL changes — React animates a
// moved name as one shared element:
//   modal  owns it whenever it is mounted (plain <ViewTransition>, elsewhere)
//   panel  owns it while the URL selects its product (?product=<id>)
//   card   owns it while the URL neither selects it nor shows its modal
// Ownership is derived from the URL alone: on Back the hooks update before
// the server-rendered panel unmounts, so a panel that still showed itself
// as owner would briefly duplicate the card's name.
export function Morph({
  id,
  part,
  owner,
  children,
}: {
  id: string;
  part: "surface" | "image";
  owner: "card" | "panel";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modalOpen = pathname === productHref(id);
  const selected = searchParams.get("product") === id;
  const owns = owner === "panel" ? selected : !modalOpen && !selected;

  if (!owns) return children;
  return (
    <ViewTransition
      default="none"
      name={productTransitionName(part, id)}
      share="morph"
    >
      {children}
    </ViewTransition>
  );
}
