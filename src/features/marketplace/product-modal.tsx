"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, ViewTransition } from "react";
import { productHref, productTransitionName } from "@/lib/catalog";

// Full-window product detail on a native <dialog> (openspec D7, D16): top
// layer, ::backdrop, focus moved inside and trapped, background inert,
// Escape handled. Closing always goes through router.back(), so the URL and
// history stay the source of truth and the catalog keeps its selection,
// filters, page and scroll.
export function ProductModal({
  productId,
  title,
  labelledBy,
  children,
}: {
  productId: string;
  title: string;
  labelledBy: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    router.back();
  };

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    // On close, focus returns to what opened us: the "See more" control if
    // it is still on screen, otherwise the product's card. Looked up rather
    // than remembered: the router has moved focus by the time we mount.
    return () => {
      requestAnimationFrame(() => {
        const trigger =
          document.querySelector<HTMLElement>(
            `main [data-see-more="${productId}"]`,
          ) ??
          document.querySelector<HTMLElement>(
            `main a[href*="product=${productId}"], main a[href="${productHref(productId)}"]`,
          );
        trigger?.focus({ preventScroll: true });
      });
    };
  }, [productId]);

  return (
    <dialog
      aria-labelledby={labelledBy}
      className="product-modal"
      // Escape: keep the dialog up and let the route change unmount it.
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      // Closed by the browser anyway (e.g. a second Escape): sync the URL.
      onClose={close}
      ref={dialog}
    >
      <ViewTransition
        default="none"
        name={productTransitionName("surface", productId)}
        share="morph"
      >
        <div className="product-modal-panel">
          <header className="flex items-center gap-3 border-b border-line bg-surface/80 px-4 py-3 backdrop-blur-xl sm:px-6">
            <p
              aria-hidden
              className="min-w-0 flex-1 truncate text-sm font-medium text-muted"
            >
              {title}
            </p>
            <button
              aria-label="Close"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-medium text-muted transition hover:border-line-strong hover:text-fg"
              onClick={close}
              type="button"
            >
              <X aria-hidden size={16} />
              <span className="hidden sm:inline">Close</span>
              <kbd className="hidden rounded border border-line px-1 text-[10px] text-subtle md:inline">
                Esc
              </kbd>
            </button>
          </header>
          <div className="overflow-y-auto overscroll-contain">
            <div className="mx-auto max-w-7xl p-4 sm:p-8">{children}</div>
          </div>
        </div>
      </ViewTransition>
    </dialog>
  );
}
