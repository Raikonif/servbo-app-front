import { Compass } from "lucide-react";
import Link from "next/link";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";

export default function NotFound() {
  return (
    <StatusPage
      description="The link you opened does not exist or was moved."
      icon={<Compass size={22} />}
      title="Page not found"
    >
      <Link className={statusLinkStyles.primary} href="/">
        Browse the catalog
      </Link>
      <Link className={statusLinkStyles.secondary} href="/sellers">
        See sellers
      </Link>
    </StatusPage>
  );
}
