import { Star } from "lucide-react";
import { useId } from "react";

const SCALE = [1, 2, 3, 4, 5] as const;

// Read-only stars, rounded to the nearest half. One image for assistive tech
// ("4.5 out of 5"); the icons themselves are decorative. No hooks, so it
// renders in server components (cards, panel) with no layout shift.
export function Stars({
  value,
  size = 16,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const shown = Math.round(Math.min(5, Math.max(0, value)) * 2) / 2;
  return (
    <span
      aria-label={`${shown} out of 5`}
      className={`inline-flex shrink-0 items-center gap-px ${className}`}
      role="img"
    >
      {SCALE.map((n) => {
        const fill = shown >= n ? 1 : shown >= n - 0.5 ? 0.5 : 0;
        return (
          <span
            aria-hidden
            className="relative inline-flex"
            key={n}
            style={{ width: size, height: size }}
          >
            <Star className="text-line-strong" size={size} strokeWidth={1.5} />
            {fill ? (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: fill === 1 ? size : size / 2 }}
              >
                <Star
                  className="fill-star text-star"
                  size={size}
                  strokeWidth={1.5}
                />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

// 1–5 rating input: a native radio group, so arrow keys, focus and form
// semantics come from the browser. Each star is the label of its radio.
export function StarsInput({
  value,
  onChange,
  label,
  disabled = false,
  size = 28,
}: {
  value: number; // 0 = nothing chosen yet
  onChange: (rating: number) => void;
  label: string; // the group's accessible name, e.g. "Your rating for Honey"
  disabled?: boolean;
  size?: number;
}) {
  const name = useId();
  return (
    <fieldset className="flex items-center gap-0.5" disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      {SCALE.map((n) => {
        const id = `${name}-${n}`;
        return (
          <span className="relative" key={n}>
            <input
              checked={value === n}
              className="peer sr-only"
              id={id}
              name={name}
              onChange={() => onChange(n)}
              type="radio"
              value={n}
            />
            <label
              className="inline-flex cursor-pointer rounded-md p-0.5 transition peer-focus-visible:outline-2 peer-focus-visible:outline-accent peer-disabled:cursor-default peer-disabled:opacity-60"
              htmlFor={id}
            >
              <span className="sr-only">
                {n} {n === 1 ? "star" : "stars"}
              </span>
              <Star
                aria-hidden
                className={
                  n <= value ? "fill-star text-star" : "text-line-strong"
                }
                size={size}
                strokeWidth={1.5}
              />
            </label>
          </span>
        );
      })}
    </fieldset>
  );
}

// Compact "★ 4.5 (12)" used on cards, panel and profile headers.
export function RatingSummary({
  avg,
  count,
  size = 14,
  className = "",
  emptyLabel = "No reviews yet",
}: {
  avg: number | null;
  count: number;
  size?: number;
  className?: string;
  emptyLabel?: string | null; // null renders nothing when there are none
}) {
  if (!count || avg === null) {
    return emptyLabel ? (
      <span className={`text-muted ${className}`}>{emptyLabel}</span>
    ) : null;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Stars size={size} value={avg} />
      <span className="font-medium tabular-nums">{avg.toFixed(1)}</span>
      <span className="text-muted tabular-nums">
        ({count}
        <span className="sr-only"> {count === 1 ? "review" : "reviews"}</span>)
      </span>
    </span>
  );
}
