
import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { BetaBanner } from "@/components/BetaBanner";

export const metadata: Metadata = {
  title: { template: '%s | Green Bowtie', default: 'Green Bowtie — California Wedding Venues' },
  description: 'Find the perfect California wedding venue. Browse 2,700+ vineyards, estates, barns, and ballrooms with real photos, reviews, and pricing.',
  keywords: ['wedding venues', 'California wedding venues', 'wedding venue directory'],
  openGraph: {
    siteName: 'Green Bowtie',
    type: 'website',
    locale: 'en_US',
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
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-stone-50 text-gray-800 flex flex-col min-h-screen">
        <BetaBanner />
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
