import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/greenbowtie.svg" alt="Green Bowtie" width={24} height={24} />
          <span className="playfair text-base font-semibold text-green-800">Green Bowtie</span>
        </Link>
        <p className="text-xs text-gray-400 text-center">
          © {year} Green Bowtie · <a href="https://greenbowtie.com" className="hover:text-green-700 transition-colors">greenbowtie.com</a> · All rights reserved
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/venues" className="hover:text-green-700 transition-colors">Browse Venues</Link>
          <span>·</span>
          <a href="mailto:hello@greenbowtie.com" className="hover:text-green-700 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
