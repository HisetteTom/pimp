import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "student") {
    redirect("/dashboard/student");
  }

  if (session.user.role === "professor") {
    // redirect("/dashboard/professor");
    redirect("/dashboard/student"); // Fallback for now
  }
  
  return null;
}
