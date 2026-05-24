import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SessionProvider } from "@/components/layout/SessionProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SessionProvider>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
