import Sidebar from "@/components/ui/sidebar";
import { getSessionUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <>
      <Sidebar user={user ? { name: user.name, email: user.email, id: user.id } : null} />
      <main className="app-content">{children}</main>
    </>
  );
}
