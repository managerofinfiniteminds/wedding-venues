// Internal pages get their own layout — no public Nav, no Footer, no search bar
export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
