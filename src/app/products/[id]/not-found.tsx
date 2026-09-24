import { PackageX } from "lucide-react";
import Link from "next/link";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";

export default function ProductNotFound() {
  return (
    <StatusPage
      description="This product was removed or the link is wrong."
      icon={<PackageX size={22} />}
      title="Product not available"
    >
      <Link className={statusLinkStyles.primary} href="/">
        Back to marketplace
      </Link>
    </StatusPage>
  );
}
