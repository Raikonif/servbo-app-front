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
        Go to the marketplace
      </Link>
      <Link className={statusLinkStyles.secondary} href="/products">
        Browse products
      </Link>
    </StatusPage>
  );
}
