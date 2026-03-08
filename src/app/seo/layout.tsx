import { InternalNav } from "@/components/InternalNav";
export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return <><InternalNav />{children}</>;
}
