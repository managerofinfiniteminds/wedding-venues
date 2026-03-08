import { InternalNav } from "@/components/InternalNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InternalNav />
      {children}
    </>
  );
}
