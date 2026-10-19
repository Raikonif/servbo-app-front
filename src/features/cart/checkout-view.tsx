"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  LoaderCircle,
  QrCode,
  Store,
  Truck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useFormat } from "@/i18n/format";
import { Link, useRouter } from "@/i18n/navigation";
import { type CartGroup, cartHref, cartKeys } from "@/lib/cart";
import {
  CheckoutError,
  type CheckoutGroup,
  type DeliveryDetails,
  type DeliveryMethod,
  getLastDelivery,
  orderKeys,
  type PaymentMethod,
  placeOrders,
} from "@/lib/orders";

type Choice = {
  payment: PaymentMethod;
  delivery: DeliveryMethod;
  note: string;
};

const EMPTY_DELIVERY: DeliveryDetails = {
  recipient_name: "",
  phone: "",
  address: "",
  reference: "",
};

const input =
  "min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-fg outline-none transition placeholder:text-subtle focus:border-accent focus:ring-4 focus:ring-accent-soft";

// One section per seller: how to pay and how to receive (openspec
// cart-and-checkout, checkout-and-orders spec). Placing creates one order per
// seller; the API rejects everything if stock or prices changed.
export function CheckoutView() {
  const t = useTranslations("checkout");
  const format = useFormat();
  const router = useRouter();
  const queryClient = useQueryClient();
  const onlySeller = useSearchParams().get("seller");
  const { cart, isPending } = useCart();
  const lastDelivery = useQuery({
    queryKey: orderKeys.lastDelivery,
    queryFn: getLastDelivery,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const groups = cart.groups.filter(
    (group) =>
      group.can_checkout && (!onlySeller || group.seller.id === onlySeller),
  );

  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [delivery, setDelivery] = useState<DeliveryDetails>(EMPTY_DELIVERY);
  const [prefilled, setPrefilled] = useState(false);

  // Prefill the address from the last order, once.
  useEffect(() => {
    if (prefilled || !lastDelivery.isSuccess) return;
    if (lastDelivery.data) setDelivery(lastDelivery.data);
    setPrefilled(true);
  }, [lastDelivery.isSuccess, lastDelivery.data, prefilled]);

  const choiceFor = (group: CartGroup): Choice =>
    choices[group.seller.id] ?? {
      payment: group.accepts_qr ? "qr" : "cash",
      delivery: "delivery",
      note: "",
    };
  const setChoice = (
    sellerId: string,
    change: Partial<Choice>,
    group: CartGroup,
  ) =>
    setChoices((current) => ({
      ...current,
      [sellerId]: { ...choiceFor(group), ...current[sellerId], ...change },
    }));

  const needsDelivery = groups.some(
    (g) => choiceFor(g).delivery === "delivery",
  );

  const place = useMutation({
    mutationFn: (payload: CheckoutGroup[]) => placeOrders(payload),
    onSuccess: async (orders) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cartKeys.cart }),
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
      ]);
      router.push(`/orders?placed=${orders.map((o) => o.code).join(",")}`);
    },
    onError: (error) => {
      // Stock or price moved: show the new numbers so the buyer can retry.
      if (error instanceof CheckoutError && error.problems.length) {
        void queryClient.invalidateQueries({ queryKey: cartKeys.cart });
      }
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    place.mutate(
      groups.map((group) => {
        const choice = choiceFor(group);
        return {
          seller: group.seller.id,
          payment_method: choice.payment,
          delivery_method: choice.delivery,
          note: choice.note,
          ...(choice.delivery === "delivery" ? delivery : EMPTY_DELIVERY),
          items: group.items.map((item) => ({
            product: item.product,
            unit_price: item.unit_price,
          })),
        };
      }),
    );
  };

  const checkoutError =
    place.error instanceof CheckoutError ? place.error : null;
  const fieldErrors = checkoutError?.fieldErrors ?? {};
  const deliveryError = (field: keyof DeliveryDetails) =>
    Object.values(fieldErrors).find((errors) => errors[field])?.[field]?.[0];

  if (isPending) {
    return (
      <Shell>
        <div className="mt-8 h-64 animate-pulse rounded-3xl bg-surface-2" />
      </Shell>
    );
  }

  if (!groups.length) {
    return (
      <Shell>
        <p className="mt-6 text-muted">
          {t.rich("nothingReady", {
            link: (chunks) => (
              <Link
                className="font-medium text-fg underline underline-offset-4"
                href={cartHref}
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <form className="mt-8 flex flex-col gap-6" onSubmit={submit}>
        {groups.map((group) => {
          const choice = choiceFor(group);
          const errors = fieldErrors[group.seller.id] ?? {};
          return (
            <section
              aria-labelledby={`checkout-${group.seller.id}`}
              className="rounded-3xl border border-line bg-surface p-5"
              key={group.seller.id}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  className="font-semibold"
                  id={`checkout-${group.seller.id}`}
                >
                  {group.seller.name}
                </h2>
                <p className="text-sm tabular-nums">
                  {t("items", { count: units(group) })}
                  {" · "}
                  <span className="font-semibold">
                    {group.subtotals
                      .map((s) => format.price(s.amount, s.currency))
                      .join(" + ")}
                  </span>
                </p>
              </div>
              <ul className="mt-2 text-sm text-muted">
                {group.items.map((item) => (
                  <li key={item.product}>
                    {t("line", { quantity: item.quantity, name: item.name })}
                  </li>
                ))}
              </ul>

              <fieldset className="mt-5">
                <legend className="text-sm font-medium">{t("payment")}</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <Option
                    checked={choice.payment === "qr"}
                    description={
                      group.accepts_qr ? t("qrHint") : t("qrUnavailable")
                    }
                    disabled={!group.accepts_qr}
                    icon={<QrCode size={18} />}
                    label={t("method.qr")}
                    name={`payment-${group.seller.id}`}
                    onChange={() =>
                      setChoice(group.seller.id, { payment: "qr" }, group)
                    }
                  />
                  <Option
                    checked={choice.payment === "cash"}
                    description={t("cashHint")}
                    icon={<Banknote size={18} />}
                    label={t("method.cash")}
                    name={`payment-${group.seller.id}`}
                    onChange={() =>
                      setChoice(group.seller.id, { payment: "cash" }, group)
                    }
                  />
                </div>
                <FieldError message={errors.payment_method?.[0]} />
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-sm font-medium">{t("delivery")}</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <Option
                    checked={choice.delivery === "delivery"}
                    description={t("deliveryHint")}
                    icon={<Truck size={18} />}
                    label={t("method.delivery")}
                    name={`delivery-${group.seller.id}`}
                    onChange={() =>
                      setChoice(
                        group.seller.id,
                        { delivery: "delivery" },
                        group,
                      )
                    }
                  />
                  <Option
                    checked={choice.delivery === "pickup"}
                    description={
                      group.pickup
                        ? `${group.pickup.address}${group.pickup.notes ? ` · ${group.pickup.notes}` : ""}`
                        : t("pickupUnavailable")
                    }
                    disabled={!group.pickup}
                    icon={<Store size={18} />}
                    label={t("method.pickup")}
                    name={`delivery-${group.seller.id}`}
                    onChange={() =>
                      setChoice(group.seller.id, { delivery: "pickup" }, group)
                    }
                  />
                </div>
                <FieldError message={errors.delivery_method?.[0]} />
              </fieldset>

              <label className="mt-5 block">
                <span className="text-sm font-medium">{t("note")}</span>
                <textarea
                  className={`${input} mt-1.5 min-h-20 py-2`}
                  maxLength={500}
                  onChange={(event) =>
                    setChoice(
                      group.seller.id,
                      { note: event.target.value },
                      group,
                    )
                  }
                  value={choice.note}
                />
              </label>
            </section>
          );
        })}

        {needsDelivery ? (
          <section className="rounded-3xl border border-line bg-surface p-5">
            <h2 className="font-semibold">{t("details.title")}</h2>
            <p className="mt-1 text-sm text-muted">{t("details.hint")}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField
                autoComplete="name"
                error={deliveryError("recipient_name")}
                label={t("details.recipient")}
                onChange={(v) =>
                  setDelivery((d) => ({ ...d, recipient_name: v }))
                }
                required
                value={delivery.recipient_name}
              />
              <TextField
                autoComplete="tel"
                error={deliveryError("phone")}
                label={t("details.phone")}
                onChange={(v) => setDelivery((d) => ({ ...d, phone: v }))}
                required
                type="tel"
                value={delivery.phone}
              />
              <TextField
                autoComplete="street-address"
                className="sm:col-span-2"
                error={deliveryError("address")}
                label={t("details.address")}
                onChange={(v) => setDelivery((d) => ({ ...d, address: v }))}
                required
                value={delivery.address}
              />
              <TextField
                className="sm:col-span-2"
                label={t("details.reference")}
                onChange={(v) => setDelivery((d) => ({ ...d, reference: v }))}
                placeholder={t("details.referencePlaceholder")}
                value={delivery.reference}
              />
            </div>
          </section>
        ) : null}

        {place.error ? (
          <div
            className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger"
            role="alert"
          >
            <p className="flex items-center gap-2 font-medium">
              <AlertTriangle size={16} />
              {checkoutError?.kind === "changed"
                ? t("errors.changed")
                : checkoutError?.kind === "fields"
                  ? t("errors.fields")
                  : place.error.message}
            </p>
            {checkoutError?.problems.length ? (
              <ul className="mt-2 list-disc pl-6">
                {checkoutError.problems.map((problem) => (
                  <li key={problem.product}>
                    {problem.name}: {problem.message}
                  </li>
                ))}
              </ul>
            ) : null}
            {checkoutError?.problems.length ? (
              <p className="mt-2">
                {t.rich("cartUpdated", {
                  link: (chunks) => (
                    <Link className="font-medium underline" href={cartHref}>
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            className="text-center text-sm font-medium text-muted hover:text-fg"
            href={cartHref}
          >
            {t("backToCart")}
          </Link>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-60"
            disabled={place.isPending}
            type="submit"
          >
            {place.isPending ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : null}
            {t("place", { count: groups.length })}
          </button>
        </div>
      </form>
    </Shell>
  );
}

const units = (group: CartGroup) =>
  group.items.reduce((n, item) => n + item.quantity, 0);

function Shell({ children }: { children: ReactNode }) {
  const t = useTranslations("checkout");
  return (
    <main className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      {children}
    </main>
  );
}

function Option({
  name,
  label,
  description,
  icon,
  checked,
  disabled,
  onChange,
}: {
  name: string;
  label: string;
  description: string;
  icon: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex gap-3 rounded-2xl border p-3 transition ${
        disabled
          ? "cursor-not-allowed border-line opacity-60"
          : checked
            ? "cursor-pointer border-accent bg-accent-soft/50 ring-2 ring-accent/20"
            : "cursor-pointer border-line hover:border-line-strong"
      }`}
    >
      <input
        checked={checked}
        className="sr-only"
        disabled={disabled}
        name={name}
        onChange={onChange}
        type="radio"
      />
      <span className="mt-0.5 text-muted">{icon}</span>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted">{description}</span>
      </span>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  className = "",
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      <input
        aria-invalid={Boolean(error)}
        className={`${input} mt-1.5`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
        {...props}
      />
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1.5 text-sm text-danger">{message}</p>
  ) : null;
}
