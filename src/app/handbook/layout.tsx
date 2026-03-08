import { InternalNav } from "@/components/InternalNav";

export default function HandbookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InternalNav />
      {children}
    </>
  );
}
