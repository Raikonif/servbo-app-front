"use client";

import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  CircleCheck,
  Clock3,
  Gift,
  QrCode,
  Store,
  Ticket,
  TimerOff,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, type ReactNode, useState } from "react";
import {
  useCreditPacks,
  useRedeemPromotion,
  useSellerSubscription,
  useShowBillingState,
} from "@/hooks/use-billing";
import { useNow } from "@/hooks/use-now";
import { useFormat } from "@/i18n/format";
import { Link, useRouter } from "@/i18n/navigation";
import {
  type CreditPricing,
  cancelPayment,
  checkPromotion,
  isExpired,
  type PendingPayment,
  type PromotionCheck,
  startPackPayment,
} from "@/lib/billing";
import {
  BecomeSellerCard,
  card,
  coveredProducts,
  payHref,
  primaryButton,
  SellerCreditsCard,
  secondaryButton,
} from "./seller-credits";

const isBonus = (promo: PromotionCheck | null) =>
  promo?.kind === "bonus_credits";

export function BecomeVendorPage() {
  const t = useTranslations("becomeSeller");
  const tc = useTranslations("credits");
  const router = useRouter();
  const subscription = useSellerSubscription();
  const packs = useCreditPacks();
  const showState = useShowBillingState();
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  // A checked promotion code (openspec subscription-promotions): a bonus code
  // is claimed on its own; a discount rides along with the pack payment.
  const [promo, setPromo] = useState<PromotionCheck | null>(null);
  // Credits of the bonus code just claimed, for the confirmation line.
  const [claimed, setClaimed] = useState<number | null>(null);
  // Choosing a pack moves to the payment step; a 100% code adds the credits
  // at once and the step shows them.
  const pay = useMutation({
    mutationFn: (packId: string) =>
      startPackPayment({
        packId,
        promoCode: isBonus(promo) ? null : promo?.code,
      }),
    onSuccess: (next) => {
      showState(next);
      const id = next.pending_payment?.id ?? next.last_purchase?.id;
      if (id) router.push(payHref(id));
    },
  });
  const redeem = useRedeemPromotion();
  const cancel = useMutation({
    mutationFn: cancelPayment,
    onSuccess: showState,
  });

  const state = subscription.data;
  const pending = state?.pending_payment ?? null;
  const pricing = state?.pricing ?? null;

  const packId = selectedPackId ?? pending?.pack?.id ?? packs.data?.[0]?.id;
  const codeBox =
    promo && isBonus(promo) ? (
      <BonusCode
        busy={redeem.isPending}
        error={redeem.error?.message ?? null}
        onClaim={() =>
          redeem.mutate(promo.code, {
            onSuccess: () => {
              setClaimed(promo.bonus_credits ?? null);
              setPromo(null);
            },
          })
        }
        onDismiss={() => {
          redeem.reset();
          setPromo(null);
        }}
        promo={promo}
      />
    ) : (
      <PromoCodeField
        applied={promo}
        onApplied={(result) => {
          pay.reset();
          redeem.reset();
          setClaimed(null);
          setPromo(result);
        }}
      />
    );
  const buyPacks = (
    <PackPicker
      busy={pay.isPending || pay.isSuccess}
      discounts={promo?.packs ?? null}
      error={pay.error?.message ?? null}
      extra={codeBox}
      note={pending ? t("replaceNote") : null}
      onRetry={() => void packs.refetch()}
      onSelect={setSelectedPackId}
      onSubmit={() => {
        if (packId) pay.mutate(packId);
      }}
      packs={packs}
      pricing={pricing}
      selectedId={packId ?? null}
      title={state?.credits.total ? t("buyMore") : t("buyCredits")}
    />
  );

  let content: ReactNode;
  if (subscription.isPending) {
    content = <div className="h-64 animate-pulse rounded-lg bg-surface-2" />;
  } else if (subscription.isError || !state) {
    content = (
      <section className={card}>
        <p className="text-sm text-muted">{t("statusError")}</p>
        <button
          className={`mt-4 ${secondaryButton}`}
          onClick={() => void subscription.refetch()}
          type="button"
        >
          {tc("tryAgain")}
        </button>
      </section>
    );
  } else {
    content = (
      <>
        {pending ? (
          <ContinuePaymentCard
            busy={cancel.isPending}
            error={cancel.error?.message ?? null}
            onCancel={() => cancel.mutate()}
            payment={pending}
          />
        ) : null}
        {claimed ? (
          <p
            className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent-soft p-3 text-sm font-medium text-accent-text"
            role="status"
          >
            <CircleCheck size={16} />
            {t("claimed", { count: claimed, paid: state.credits.paid })}
          </p>
        ) : null}
        {state.is_seller ? (
          <SellerCreditsCard state={state} />
        ) : (
          <BecomeSellerCard state={state} />
        )}
        {buyPacks}
      </>
    );
  }

  const steps = pricing
    ? [
        t("steps.free", {
          count: pricing.free_credits,
          days: pricing.period_days,
        }),
        t("steps.costs", {
          publish: pricing.publish_cost,
          edit: pricing.edit_cost,
        }),
        t("steps.more"),
      ]
    : [t("steps.freeDefault"), t("steps.costsDefault"), t("steps.more")];

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-accent-text">
            <Store size={16} />
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-fg sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
            {pricing
              ? t.rich("intro", {
                  count: pricing.free_credits,
                  days: pricing.period_days,
                  b: (chunks) => (
                    <span className="font-medium text-fg">{chunks}</span>
                  ),
                })
              : t("introDefault")}
          </p>
          <ol className="mt-8 space-y-3 text-sm text-muted">
            {steps.map((step, index) => (
              <li className="flex items-center gap-3" key={step}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fg text-xs font-semibold text-bg">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-6 text-xs text-muted">{t("footnote")}</p>
          <Link
            className="mt-4 inline-flex text-sm font-medium text-accent-text hover:text-accent-text"
            href="/billing"
          >
            {t("billingLink")}
          </Link>
        </div>
        <div className="space-y-6">{content}</div>
      </section>
    </main>
  );
}

type PacksQuery = ReturnType<typeof useCreditPacks>;

function PackPicker({
  packs,
  pricing,
  discounts,
  extra,
  note,
  selectedId,
  onSelect,
  onSubmit,
  onRetry,
  busy,
  error,
  title,
}: {
  packs: PacksQuery;
  pricing: CreditPricing | null;
  // From a checked discount code: each pack's price with it (null = not covered).
  discounts: PromotionCheck["packs"] | null;
  extra: ReactNode;
  note: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
  busy: boolean;
  error: string | null;
  title: string;
}) {
  const t = useTranslations("becomeSeller");
  const tc = useTranslations("credits");
  const format = useFormat();
  if (packs.isPending) {
    return (
      <section className={card}>
        <div className="h-48 animate-pulse rounded-lg bg-surface-2" />
      </section>
    );
  }
  if (packs.isError) {
    return (
      <section className={card}>
        <p className="text-sm text-muted">{tc("packs.loadError")}</p>
        <button
          className={`mt-4 ${secondaryButton}`}
          onClick={onRetry}
          type="button"
        >
          {tc("tryAgain")}
        </button>
      </section>
    );
  }
  if (!packs.data.length) {
    return (
      <section className={card}>
        <h2 className="text-2xl font-semibold text-fg">
          {tc("packs.emptyTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {tc("packs.emptyText")}
        </p>
      </section>
    );
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className={card} id="packs">
      <form onSubmit={submit}>
        <fieldset>
          <legend className="text-xl font-semibold text-fg">{title}</legend>
          <div className="mt-4 space-y-3">
            {packs.data.map((pack) => {
              const discounted = discounts?.find(
                (entry) => entry.id === pack.id,
              )?.discounted_amount;
              const covered = coveredProducts(pack.credits, pricing);
              return (
                <label
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-4 hover:border-accent has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:ring-2 has-focus-visible:ring-accent"
                  key={pack.id}
                >
                  <input
                    checked={pack.id === selectedId}
                    className="mt-1 size-4 shrink-0 accent-accent"
                    name="credit-pack"
                    onChange={() => onSelect(pack.id)}
                    type="radio"
                    value={pack.id}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-fg">
                      {pack.name}
                    </span>
                    <span className="block text-sm font-medium text-accent-text">
                      {tc("count", { count: pack.credits })}
                    </span>
                    {covered ? (
                      <span className="mt-0.5 block text-xs text-muted">
                        {tc("packCoverage", { count: covered })}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-right font-semibold text-fg">
                    {discounted != null ? (
                      <>
                        <s className="mr-1.5 text-sm font-medium text-muted">
                          {format.money(pack.price_amount, pack.currency)}
                        </s>
                        {format.money(discounted, pack.currency)}
                      </>
                    ) : (
                      format.money(pack.price_amount, pack.currency)
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        {extra}
        {note ? <p className="mt-3 text-xs text-muted">{note}</p> : null}
        {error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <button
          className={`mt-5 w-full ${primaryButton}`}
          disabled={busy || !selectedId}
          type="submit"
        >
          <QrCode size={17} />
          {busy ? t("preparing") : t("continue")}
        </button>
      </form>
    </section>
  );
}

// A pack payment is open: back to its QR, or cancel it.
function ContinuePaymentCard({
  payment,
  busy,
  error,
  onCancel,
}: {
  payment: PendingPayment;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
}) {
  const t = useTranslations("becomeSeller");
  const tc = useTranslations("credits");
  const format = useFormat();
  const now = useNow(30_000);
  const expired = now !== null && isExpired(payment.expires_at, now);
  return (
    <section className={card}>
      {expired ? (
        <p className="inline-flex items-center gap-2 rounded-md bg-danger-soft px-2 py-1 text-xs font-semibold uppercase text-danger">
          <TimerOff size={14} />
          {t("qrExpired")}
        </p>
      ) : (
        <p className="inline-flex items-center gap-2 rounded-md bg-warning-soft px-2 py-1 text-xs font-semibold uppercase text-warning">
          <Clock3 size={14} />
          {t("pending")}
        </p>
      )}
      <h2 className="mt-3 text-xl font-semibold text-fg">
        {payment.pack
          ? tc("packName", { name: payment.pack.name })
          : t("yourPayment")}
        {payment.credits ? (
          <span className="text-muted">
            {" "}
            · {tc("count", { count: payment.credits })}
          </span>
        ) : null}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {t.rich(expired ? "summaryExpired" : "summary", {
          amount: format.money(payment.amount_due, payment.currency),
          reference: payment.reference,
          mono: (chunks) => (
            <span className="font-mono font-medium text-fg">{chunks}</span>
          ),
        })}
      </p>
      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link className={primaryButton} href={payHref(payment.id)}>
          {t("continue")}
          <ArrowRight size={17} />
        </Link>
        <button
          className={secondaryButton}
          disabled={busy}
          onClick={onCancel}
          type="button"
        >
          <X size={16} />
          {busy ? t("cancelling") : t("cancel")}
        </button>
      </div>
    </section>
  );
}

// "Have a code?" (openspec subscription-promotions): checks the code without
// using it; a discount then shows on the packs, a bonus code offers a claim.
function PromoCodeField({
  applied,
  onApplied,
}: {
  applied: PromotionCheck | null;
  onApplied: (promo: PromotionCheck | null) => void;
}) {
  const t = useTranslations("becomeSeller.promo");
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const check = useMutation({
    mutationFn: checkPromotion,
    onSuccess: (result) => {
      if (result) onApplied(result);
    },
  });

  if (applied) {
    return (
      <p className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-accent/40 bg-accent-soft p-3 text-sm text-accent-text">
        <span className="inline-flex items-center gap-2 font-medium">
          <Ticket size={16} />
          {t("applied", { code: applied.code })}
        </span>
        <button
          aria-label={t("remove", { code: applied.code })}
          className="rounded-md p-1 hover:bg-surface"
          onClick={() => {
            onApplied(null);
            setCode("");
          }}
          type="button"
        >
          <X size={16} />
        </button>
      </p>
    );
  }
  if (!open) {
    return (
      <button
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-text hover:underline"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Ticket size={16} />
        {t("haveCode")}
      </button>
    );
  }
  const apply = () => {
    if (code.trim()) check.mutate(code);
  };
  return (
    <div className="mt-4">
      <label className="text-sm font-medium text-fg" htmlFor="promo-code">
        {t("label")}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          autoCapitalize="characters"
          // biome-ignore lint/a11y/noAutofocus: opened on purpose by the user
          autoFocus
          className="min-h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 font-mono uppercase text-fg outline-none focus:border-accent"
          id="promo-code"
          maxLength={32}
          onChange={(event) => {
            setCode(event.target.value);
            check.reset();
          }}
          onKeyDown={(event) => {
            // Inside the pack form: Enter checks the code instead of paying.
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
          value={code}
        />
        <button
          className={secondaryButton}
          disabled={check.isPending || !code.trim()}
          onClick={apply}
          type="button"
        >
          {check.isPending ? t("checking") : t("apply")}
        </button>
      </div>
      {check.error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {check.error.message}
        </p>
      ) : null}
    </div>
  );
}

// A checked bonus-credits code: "+30 credits" and a claim button. The
// credits go to the paid balance at once, with no pack or QR.
function BonusCode({
  promo,
  busy,
  error,
  onClaim,
  onDismiss,
}: {
  promo: PromotionCheck;
  busy: boolean;
  error: string | null;
  onClaim: () => void;
  onDismiss: () => void;
}) {
  const t = useTranslations("becomeSeller");
  const credits = promo.bonus_credits ?? 0;
  return (
    <div className="mt-4 rounded-lg border border-accent/40 bg-accent-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-lg font-semibold text-accent-text">
          <Gift size={18} />
          {t("bonus.plus", { count: credits })}
        </p>
        <button
          aria-label={t("promo.remove", { code: promo.code })}
          className="rounded-md p-1 text-accent-text hover:bg-surface"
          disabled={busy}
          onClick={onDismiss}
          type="button"
        >
          <X size={16} />
        </button>
      </div>
      <p className="mt-1 text-sm leading-6 text-muted">
        {t.rich("bonus.text", {
          code: promo.code,
          count: credits,
          mono: (chunks) => (
            <span className="font-mono font-medium text-fg">{chunks}</span>
          ),
        })}
      </p>
      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className={`mt-3 w-full ${primaryButton}`}
        disabled={busy}
        onClick={onClaim}
        type="button"
      >
        <Ticket size={17} />
        {busy ? t("bonus.claiming") : t("bonus.claim")}
      </button>
    </div>
  );
}
