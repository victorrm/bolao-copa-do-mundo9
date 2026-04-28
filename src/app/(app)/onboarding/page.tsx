import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.user.consentLgpd && session.user.name) redirect("/jogos");

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao Bolão</CardTitle>
          <CardDescription>
            Antes de começar, complete seu perfil e aceite nossos termos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm defaultName={session.user.name ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
