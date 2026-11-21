import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AccountForm } from "@/components/account/account-form";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <AccountForm
      initialUsername={user.name}
      email={user.email}
      id={user.id}
    />
  );
}