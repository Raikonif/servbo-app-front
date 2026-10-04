"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Escape closes the side panel — unless a modal dialog is open, which
// handles Escape itself.
export function PanelKeys({ closeHref }: { closeHref: string }) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || document.querySelector("dialog[open]"))
        return;
      router.push(closeHref, { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeHref, router]);
  return null;
}
