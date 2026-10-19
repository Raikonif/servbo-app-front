import { Compass } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("status.notFound");
  return (
    <StatusPage
      description={t("description")}
      icon={<Compass size={22} />}
      title={t("title")}
    >
      <Link className={statusLinkStyles.primary} href="/">
        {t("browseCatalog")}
      </Link>
      <Link className={statusLinkStyles.secondary} href="/sellers">
        {t("seeSellers")}
      </Link>
    </StatusPage>
  );
}
