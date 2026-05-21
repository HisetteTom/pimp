import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  // Role based redirection
 
  if (user.role !== "student" && user.role !== "professor" && user.role !== "jury") {
    redirect("/login");
  }

  return <>{children}</>;
}
