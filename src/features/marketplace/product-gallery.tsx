"use client";

import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState, ViewTransition } from "react";
import { type ProductImage, productTransitionName } from "@/lib/catalog";

// Scroll-snap does the swiping natively; script only drives the buttons,
// arrow keys and thumbnails, and tracks which slide is current.
export function ProductGallery({
  productId,
  name,
  images,
}: {
  productId: string;
  name: string;
  images: ProductImage[];
}) {
  // Main image first, the rest in upload order.
  const slides = [...images].sort(
    (a, b) => Number(b.is_main) - Number(a.is_main) || a.position - b.position,
  );
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  const many = slides.length > 1;

  const go = (index: number) => {
    const element = track.current;
    if (!element) return;
    const next = Math.max(0, Math.min(slides.length - 1, index));
    element.scrollTo({ left: next * element.clientWidth });
  };

  const hero = (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-surface-2">
      {slides.length ? null : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-subtle">
          <ImageIcon size={40} />
          <span className="text-sm">No photos yet</span>
        </div>
      )}
      {slides.length ? (
        <section
          aria-label={`${name} photos`}
          aria-roledescription="carousel"
          className="size-full"
        >
          <ul
            className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") go(current + 1);
              if (event.key === "ArrowLeft") go(current - 1);
            }}
            onScroll={(event) => {
              const element = event.currentTarget;
              setCurrent(Math.round(element.scrollLeft / element.clientWidth));
            }}
            ref={track}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: the track scrolls, so it must be focusable for arrow keys
            tabIndex={0}
          >
            {slides.map((image, index) => (
              <li
                className="relative size-full shrink-0 snap-center"
                key={image.id}
              >
                <Image
                  alt={`${name} — photo ${index + 1} of ${slides.length}`}
                  className="object-contain"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={image.url}
                  unoptimized
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {many ? (
        <>
          <GalleryButton
            disabled={current === 0}
            label="Previous photo"
            onClick={() => go(current - 1)}
            side="left"
          />
          <GalleryButton
            disabled={current === slides.length - 1}
            label="Next photo"
            onClick={() => go(current + 1)}
            side="right"
          />
        </>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Same name as the card image: the browser morphs one into the other. */}
      <ViewTransition
        default="none"
        name={productTransitionName("image", productId)}
        share="morph"
      >
        {hero}
      </ViewTransition>

      {many ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {slides.map((image, index) => (
            <li className="shrink-0" key={image.id}>
              <button
                aria-current={index === current}
                aria-label={`Show photo ${index + 1}`}
                className={`relative block size-16 overflow-hidden rounded-xl border-2 bg-surface-2 transition ${
                  index === current
                    ? "border-accent"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                onClick={() => go(index)}
                type="button"
              >
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  loading="lazy"
                  sizes="64px"
                  src={image.url}
                  unoptimized
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GalleryButton({
  side,
  label,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      aria-label={label}
      className={`absolute top-1/2 ${side === "left" ? "left-2" : "right-2"} inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-fg shadow ring-1 ring-line transition hover:bg-surface disabled:pointer-events-none disabled:opacity-0`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon size={20} />
    </button>
  );
}
