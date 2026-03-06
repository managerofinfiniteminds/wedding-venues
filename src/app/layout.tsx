import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";


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
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Plausible Analytics — privacy-first, no cookies, no GDPR banner needed */}
        {/* TODO: Replace 'greenbowtie.com' with your actual domain if different */}
        <script
          defer
          data-domain="greenbowtie.com"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="antialiased bg-stone-50 text-gray-800 flex flex-col min-h-screen">

        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
