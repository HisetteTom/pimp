import { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace PIMP pour gérer vos projets.",
};

export default function LoginPage() {
  return <LoginForm />;
}
