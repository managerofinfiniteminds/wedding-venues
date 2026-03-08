import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://greenbowtie.com"),
};

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tenor+Sans&family=Nunito+Sans:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-stone-50 text-gray-800">
        {children}
      </body>
    </html>
  );
}
