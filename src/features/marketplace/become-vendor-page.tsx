import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  Clock3,
  Mail,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Store,
} from "lucide-react";
import Link from "next/link";
import type { VendorApplication } from "@/data/vendor";

type BecomeVendorPageProps = {
  application: VendorApplication;
};

export function BecomeVendorPage({ application }: BecomeVendorPageProps) {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-stretch">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-emerald-700">
              <Store size={16} />
              Become a vendor
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              {application.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              {application.summary}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 text-sm font-medium text-white hover:bg-emerald-500"
                href="#vendor-form"
              >
                Start application
                <ArrowRight size={17} />
              </a>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 px-5 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                href="/pricing"
              >
                Compare plans
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {application.stats.map((stat) => (
                <div
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={stat.label}
                >
                  <p className="text-2xl font-semibold text-slate-950">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-emerald-700">
              <BadgeCheck size={24} />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-950">
              Vendor review preview
            </h2>
            <p className="mt-3 text-sm leading-6 text-emerald-900">
              Applications are reviewed for seller identity, catalog readiness,
              and clear fulfillment terms before products go live.
            </p>
            <div className="mt-6 space-y-3">
              {application.requirements.map((requirement) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm"
                  key={requirement.label}
                >
                  <span className="text-slate-500">{requirement.label}</span>
                  <span className="font-medium text-slate-950">
                    {requirement.value}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {application.benefits.map((benefit, index) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={benefit.title}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                {index === 0 ? <ShieldCheck size={20} /> : null}
                {index === 1 ? <PackageCheck size={20} /> : null}
                {index === 2 ? <Mail size={20} /> : null}
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                {benefit.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {benefit.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-semibold text-slate-950">
                How onboarding works
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {application.steps.map((step, index) => (
                <article
                  className="grid gap-4 p-5 sm:grid-cols-[48px_1fr_auto]"
                  key={step.title}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                  <span className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-50 px-3 text-sm font-medium text-slate-600">
                    <Clock3 size={15} />
                    {step.duration}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-emerald-700">
                Vendor story
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {application.story.seller}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {application.story.category}
              </p>
              <blockquote className="mt-4 text-sm leading-6 text-slate-600">
                “{application.story.quote}”
              </blockquote>
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-950">
                {application.story.metric}
              </p>
            </section>

            <section
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              id="vendor-form"
            >
              <h2 className="text-lg font-semibold text-slate-950">
                Application snapshot
              </h2>
              <div className="mt-4 space-y-3">
                <MockField
                  icon={Store}
                  label="Store name"
                  value="Northline Workshop"
                />
                <MockField
                  icon={Mail}
                  label="Business email"
                  value="hello@northline.example"
                />
                <MockField
                  icon={MapPin}
                  label="Market location"
                  value="Austin, TX"
                />
                <MockField icon={Camera} label="Listing photos" value="Ready" />
              </div>
              <button
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500"
                type="button"
              >
                Submit mocked application
                <Check size={17} />
              </button>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function MockField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Store;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
      <Icon className="text-emerald-700" size={17} />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-950">{value}</p>
      </div>
    </div>
  );
}
