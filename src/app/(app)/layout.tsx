import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { LogoutButton } from "@/components/logout-button";
import { InstallPwaBanner } from "@/components/install-pwa-banner";
import { AppNav } from "@/components/app-nav";
import { getMessages } from "@/lib/i18n";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const m = await getMessages();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-brand-border bg-brand-card sticky top-0 z-30">
        <div className="container flex items-center justify-between h-14 gap-3">
          <Link href="/home" className="font-display font-bold text-lg shrink-0">
            Bolão 2026
          </Link>
          <AppNav
            userName={session.user.name ?? m.nav.profile}
            labels={{
              matches: m.nav.matches,
              specials: m.nav.specials,
              ranking: m.nav.ranking,
              leagues: m.nav.leagues,
            }}
            logoutSlot={<LogoutButton />}
          />
        </div>
      </header>
      <main className="flex-1 container py-6">{children}</main>
      <InstallPwaBanner />
    </div>
  );
}
