import Link from "next/link";
import { EmailCapture } from "@/components/EmailCapture";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      {/* Email capture band */}
      <div className="bg-[#f0f4f0] border-b border-[#d4e4d8]">
        <div className="max-w-screen-xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="playfair text-xl font-bold text-gray-800">Find your perfect venue</h3>
            <p className="text-sm text-gray-500 mt-1">Join couples discovering beautiful wedding venues across the US.</p>
          </div>
          <div className="w-full md:w-auto md:min-w-[380px]">
            <EmailCapture
              headline=""
              subtext=""
              placeholder="Enter your email"
              buttonLabel="Get Early Access"
              variant="inline"
            />
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/greenbowtie-logo.svg" alt="Green Bowtie" style={{ height: 36, width: "auto" }} />
          <span className="playfair text-base font-semibold" style={{ color: "#3b6341" }}>Green Bowtie</span>
        </Link>
        <p className="text-xs text-gray-400 text-center">
          © {year} Green Bowtie · <a href="https://greenbowtie.com" className="hover:text-green-700 transition-colors">greenbowtie.com</a> · All rights reserved
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/venues" className="hover:text-green-700 transition-colors">Browse Venues</Link>
          <span>·</span>
          <a href="mailto:hello@greenbowtie.com" className="hover:text-green-700 transition-colors">Contact</a>
          <span>·</span>
          <Link href="/privacy" className="hover:text-green-700 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-green-700 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
