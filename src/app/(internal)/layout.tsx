import { InternalNav } from "@/components/InternalNav";

/**
 * Shared layout for all internal pages.
 * Wraps every internal route with the confidential nav header.
 */
export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InternalNav />
      <div style={{ minHeight: "calc(100vh - 60px)" }}>
        {children}
      </div>
    </>
  );
}
