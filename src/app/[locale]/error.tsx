"use client"; // Error boundaries must be Client Components

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { Link } from "@/i18n/navigation";

// Catches render/data errors of any page below the root layout, so the header
// and navigation stay usable.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("status");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      description={t("error.description")}
      icon={<AlertTriangle size={22} />}
      title={t("error.title")}
    >
      <button
        className={statusLinkStyles.primary}
        onClick={() => retry()}
        type="button"
      >
        <RotateCcw size={16} />
        {t("tryAgain")}
      </button>
      <Link className={statusLinkStyles.secondary} href="/">
        {t("error.home")}
      </Link>
    </StatusPage>
  );
}
