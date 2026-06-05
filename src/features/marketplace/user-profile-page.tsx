import {
  BadgeCheck,
  Bell,
  CalendarDays,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { UserProfile } from "@/data/profile";

type UserProfilePageProps = {
  profile: UserProfile;
};

export function UserProfilePage({ profile }: UserProfilePageProps) {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="h-36 bg-gradient-to-r from-emerald-700 via-lime-500 to-lime-200" />
            <div className="px-5 pb-6 sm:px-6">
              <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-4 border-white bg-slate-950 text-white shadow-sm">
                    <UserRound size={38} />
                  </div>
                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-semibold text-slate-950">
                        {profile.name}
                      </h1>
                      {profile.verified ? (
                        <BadgeCheck className="text-emerald-600" size={22} />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {profile.username} · {profile.role}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                    type="button"
                  >
                    <Bell size={16} />
                    Alerts
                  </button>
                  <button
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500"
                    type="button"
                  >
                    <MessageCircle size={16} />
                    Message
                  </button>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">
                {profile.bio}
              </p>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ProfileFact
                  icon={MapPin}
                  label="Location"
                  value={profile.location}
                />
                <ProfileFact
                  icon={CalendarDays}
                  label="Member since"
                  value={profile.joinedAt}
                />
                <ProfileFact
                  icon={ShieldCheck}
                  label="Response goal"
                  value={profile.responseGoal}
                />
                <ProfileFact
                  icon={BadgeCheck}
                  label="Verification"
                  value={profile.verified ? "Verified" : "Pending"}
                />
              </dl>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Contact</h2>
              <div className="mt-4 space-y-3 text-sm">
                <ContactRow icon={Mail} label="Email" value={profile.email} />
                <ContactRow icon={Phone} label="Phone" value={profile.phone} />
                <ContactRow
                  icon={MapPin}
                  label="Market"
                  value={profile.location}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Plan</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Marketplace workspace access
                  </p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase text-emerald-700">
                  {profile.plan.status}
                </span>
              </div>
              <div className="mt-5 rounded-lg bg-slate-50 p-4">
                <p className="text-2xl font-semibold text-slate-950">
                  {profile.plan.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Renews {profile.plan.renewal}
                </p>
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {profile.stats.map((stat) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={stat.label}
            >
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{stat.helper}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Recent activity
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {profile.activity.map((activity) => (
                <article className="p-5" key={activity.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-slate-950">
                        {activity.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {activity.description}
                      </p>
                    </div>
                    <time className="shrink-0 text-right text-xs text-slate-500">
                      {activity.timestamp}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Saved products
              </h2>
            </div>
            <div className="space-y-3 p-5">
              {profile.savedProducts.map((product) => (
                <Link
                  className="block rounded-lg border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40"
                  href={`/products/${product.id}`}
                  key={product.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-slate-950">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {product.seller}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-950">
                      {product.price}
                    </p>
                  </div>
                  <p className="mt-3 text-xs font-medium uppercase text-emerald-700">
                    {product.status}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
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

function ProfileFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <dt className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={16} />
        {label}
      </dt>
      <dd className="mt-2 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
