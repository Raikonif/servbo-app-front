import { useFormatter, useTranslations } from "next-intl";
import { ratingNumber } from "@/lib/reviews";
import { ReviewList } from "./review-list";
import { Stars } from "./stars";

// Rating summary + review list for a product or a seller. The summary comes
// from the (cached) payload and is in the server HTML; the list loads after.
export function ReviewsSection({
  kind,
  id,
  ratingAvg,
  ratingCount,
  title,
  compact = false,
}: {
  kind: "product" | "seller";
  id: string;
  ratingAvg: string | null;
  ratingCount: number;
  title?: string;
  compact?: boolean; // the narrow side panel
}) {
  const t = useTranslations("reviews");
  const format = useFormatter();
  const avg = ratingNumber(ratingAvg);
  const rated = ratingCount > 0 && avg !== null;
  const headingId = `${kind}-reviews-${id}`;

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <h2
          className={`font-semibold tracking-tight ${compact ? "text-base" : "text-xl"}`}
          id={headingId}
        >
          {title ?? t("title")}
        </h2>
        {rated ? (
          <p className="flex items-center gap-2 text-sm">
            <span
              className={`font-semibold tabular-nums ${compact ? "text-lg" : "text-2xl"}`}
            >
              {format.number(avg, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>
            <Stars size={compact ? 14 : 18} value={avg} />
            <span className="text-muted">
              {t("count", { count: ratingCount })}
            </span>
          </p>
        ) : (
          <p className="text-sm text-muted">{t("none")}</p>
        )}
      </div>
      {rated ? (
        <ReviewList id={id} kind={kind} />
      ) : (
        <p className="text-sm text-muted">
          {kind === "product" ? t("emptyProduct") : t("emptySeller")}
        </p>
      )}
    </section>
  );
}
