export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <main className="main">{children}</main>
    </div>
  );
}