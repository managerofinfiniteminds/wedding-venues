import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { headers } from "next/headers";


export const metadata: Metadata = {
  title: { template: "%s | Green Bowtie", default: "Green Bowtie — Wedding Venues Across the US" },
  description: "Find the perfect wedding venue across the United States. Browse vineyards, estates, barns, ballrooms, and more on Green Bowtie.",
  keywords: ["wedding venues", "California wedding venues", "wedding venue directory", "US wedding venues"],
  metadataBase: new URL("https://greenbowtie.com"),
  openGraph: {
    siteName: "Green Bowtie",
    type: "website",
    locale: "en_US",
    url: "https://greenbowtie.com",
  },
  twitter: {
    card: "summary_large_image",
    site: "@greenbowtie",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const isInternal = host.startsWith("internal.");
  const pathname = headersList.get("x-pathname") ?? "";
  const isStandalone = pathname.startsWith("/privacy") || pathname.startsWith("/terms") || pathname.startsWith("/contact");

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tenor+Sans&family=Nunito+Sans:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          defer
          data-domain="greenbowtie.com"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="antialiased bg-stone-50 text-gray-800 flex flex-col min-h-screen">
        {!isInternal && !isStandalone && <Nav />}
        <div className="flex-1">{children}</div>
        {!isInternal && !isStandalone && <Footer />}
      </body>
    </html>
  );
}
