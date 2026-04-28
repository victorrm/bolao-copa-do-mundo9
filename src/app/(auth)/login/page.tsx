import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { getMessages } from "@/lib/i18n";

export default async function LoginPage() {
  const m = await getMessages();
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{m.login.title}</CardTitle>
          <CardDescription>{m.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            placeholder={m.login.emailPlaceholder}
            submit={m.login.submit}
            submitting={m.login.submitting}
          />
        </CardContent>
      </Card>
    </main>
  );
}
