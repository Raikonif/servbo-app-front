import type { Metadata } from "next";
import { RequireSession } from "@/features/auth/require-session";
import { SellerProfilePage } from "@/features/marketplace/seller-profile-page";

export const metadata: Metadata = {
  title: "Seller",
};

type SellerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerPage({ params }: SellerPageProps) {
  const { id } = await params;
  return (
    <RequireSession>
      <SellerProfilePage sellerId={id} />
    </RequireSession>
  );
}
