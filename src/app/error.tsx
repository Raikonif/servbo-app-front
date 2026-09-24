"use client"; // Error boundaries must be Client Components

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";

// Catches render/data errors of any page below the root layout, so the header
// and navigation stay usable.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      description="This page could not load, usually because the server is briefly unavailable. Try again, or keep browsing."
      icon={<AlertTriangle size={22} />}
      title="Something went wrong"
    >
      <button
        className={statusLinkStyles.primary}
        onClick={() => retry()}
        type="button"
      >
        <RotateCcw size={16} />
        Try again
      </button>
      <Link className={statusLinkStyles.secondary} href="/">
        Go to the marketplace
      </Link>
    </StatusPage>
  );
}
