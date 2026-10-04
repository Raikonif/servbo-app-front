import type { Metadata } from "next";
import { StoreHeader } from "@/features/marketplace/store-header";
import { siteUrl } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  // Resolves relative canonical/Open Graph URLs to absolute ones.
  metadataBase: siteUrl,
  title: {
    default: "Servbo Store",
    template: "%s | Servbo Store",
  },
  description: "Browse products and sellers on Servbo.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  // @modal slot: the product detail intercepted over the current page.
  modal: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the theme script sets data-theme before React
    // hydrates, which is intentional and limited to this element.
    <html
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, first-party script; must run before paint to avoid a theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg font-sans text-fg antialiased">
        <Providers>
          {/* Inside Providers: the header reads the session. */}
          <StoreHeader />
          {children}
          {modal}
        </Providers>
      </body>
    </html>
  );
}
