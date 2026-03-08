import { InternalNav } from "@/components/InternalNav";

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InternalNav />
      {children}
    </>
  );
}
