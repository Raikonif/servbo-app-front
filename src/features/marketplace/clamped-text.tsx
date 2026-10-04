"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Text is cut by CSS only (the full text stays in the HTML for crawlers);
// when something was actually cut, "See more" opens the full-window detail.
export function ClampedText({
  text,
  lines,
  href,
  productId,
  className = "",
}: {
  text: string;
  lines: 2 | 3 | 4;
  href: string;
  productId: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () =>
      setClamped(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const clamp = { 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4" }[
    lines
  ];
  return (
    <div>
      <p className={`${clamp} ${className}`} ref={ref}>
        {text}
      </p>
      {clamped ? (
        <Link
          className="relative z-10 mt-1 inline-flex items-center gap-1 text-sm font-semibold text-accent-text hover:underline"
          data-see-more={productId}
          href={href}
          scroll={false}
        >
          See more
          <ArrowUpRight aria-hidden size={14} />
        </Link>
      ) : null}
    </div>
  );
}
