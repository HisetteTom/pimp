import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil",
  description: "Plateforme de gestion et suivi des projets étudiants de l'ISEN.",
};

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
    redirect("/dashboard/professor");
  }
  
  return null;
}
