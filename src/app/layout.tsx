import type { Metadata } from "next";
import { StoreHeader } from "@/features/marketplace/store-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Servbo Store",
    template: "%s | Servbo Store",
  },
  description: "Storefront operations for products, clients, and sellers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="scroll-smooth" data-scroll-behavior="smooth" lang="en">
      <body className="bg-slate-50 font-sans text-slate-950 antialiased">
        <StoreHeader />
        {children}
      </body>
    </html>
  );
}
