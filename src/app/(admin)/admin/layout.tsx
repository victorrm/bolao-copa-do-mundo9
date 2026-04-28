import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  if (!session) redirect("/admin/login");
  if (session.user.role !== "superadmin") redirect("/jogos");

  if (session.user.passwordMustChange) {
    redirect("/admin/change-password");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <header className="md:hidden border-b border-brand-border bg-brand-card sticky top-0 z-30">
        <div className="flex items-center justify-between p-4">
          <span className="font-display font-bold">Admin</span>
          <LogoutButton />
        </div>
        <nav className="flex gap-3 overflow-x-auto px-4 pb-3 text-sm whitespace-nowrap">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/configuracoes">Configurações</Link>
          <Link href="/admin/dominios">Domínios</Link>
          <Link href="/admin/jogos">Jogos</Link>
          <Link href="/admin/regras">Regras</Link>
          <Link href="/admin/resultados-especiais">Especiais</Link>
          <Link href="/admin/premios">Prêmios</Link>
          <Link href="/admin/broadcast">Broadcast</Link>
          <Link href="/admin/usuarios">Usuários</Link>
          <Link href="/admin/auditoria">Auditoria</Link>
          <Link href="/admin/observabilidade">Observ.</Link>
          <Link href="/perfil">Meu perfil</Link>
        </nav>
      </header>
      <aside className="w-56 border-r border-brand-border bg-brand-card p-4 hidden md:block">
        <div className="font-display font-bold mb-6">Admin</div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/configuracoes">Configurações</Link>
          <Link href="/admin/dominios">Domínios</Link>
          <Link href="/admin/jogos">Jogos</Link>
          <Link href="/admin/regras">Regras & pontuação</Link>
          <Link href="/admin/resultados-especiais">Resultados especiais</Link>
          <Link href="/admin/premios">Prêmios</Link>
          <Link href="/admin/broadcast">Broadcast</Link>
          <Link href="/admin/usuarios">Usuários</Link>
          <Link href="/admin/auditoria">Auditoria</Link>
          <Link href="/admin/observabilidade">Observabilidade</Link>
        </nav>
        <div className="my-4 border-t border-brand-border" />
        <nav className="flex flex-col gap-2 text-sm">
          <Link
            href="/perfil"
            className="rounded-lg px-2 py-1.5 font-medium text-brand-primary hover:bg-brand-surface"
          >
            👤 Meu perfil
          </Link>
        </nav>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  );
}
