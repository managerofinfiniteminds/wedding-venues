import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Green Bowtie — California Wedding Venues",
  description: "Find and book the perfect wedding venue in Livermore, Pleasanton, Dublin, San Ramon, and Danville.",
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
      <body className="antialiased bg-stone-50 text-gray-800">
        {children}
      </body>
    </html>
  );
}
