import { LoaderCircle } from "lucide-react";
import { Roboto } from "next/font/google";

// Google's own sign-in button look (Sign in with Google branding guidelines):
// white with a grey outline in light mode, near-black in dark mode, the full
// colour "G" and Roboto Medium. Comes first on the login and register pages.
const roboto = Roboto({ subsets: ["latin"], weight: "500", display: "swap" });

function GoogleLogo() {
  return (
    <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18">
      <path
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        fill="#EA4335"
      />
      <path
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        fill="#4285F4"
      />
      <path
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        fill="#FBBC05"
      />
      <path
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        fill="#34A853"
      />
    </svg>
  );
}

export function GoogleButton({
  label,
  pending,
  disabled,
  onClick,
}: {
  label: string;
  pending: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`${roboto.className} relative inline-flex min-h-11 w-full items-center justify-center gap-2.5 overflow-hidden rounded-md border border-[#747775] bg-white px-3 text-sm font-medium text-[#1f1f1f] outline-none transition before:absolute before:inset-0 before:bg-[#303030] before:opacity-0 before:transition-opacity hover:before:opacity-[0.08] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-60 disabled:before:opacity-0 dark:border-[#8e918f] dark:bg-[#131314] dark:text-[#e3e3e3] dark:before:bg-white`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {pending ? (
        <LoaderCircle className="animate-spin" size={18} />
      ) : (
        <GoogleLogo />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}
