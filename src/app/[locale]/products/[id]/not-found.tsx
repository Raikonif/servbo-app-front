import { PackageX } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { Link } from "@/i18n/navigation";

export default function ProductNotFound() {
  const t = useTranslations("status.productNotFound");
  return (
    <StatusPage
      description={t("description")}
      icon={<PackageX size={22} />}
      title={t("title")}
    >
      <Link className={statusLinkStyles.primary} href="/">
        {t("back")}
      </Link>
    </StatusPage>
  );
}
