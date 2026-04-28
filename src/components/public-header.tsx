import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";

export async function PublicHeader() {
  const session = await getCurrentSession();
  return (
    <header className="border-b border-brand-border bg-brand-card sticky top-0 z-30">
      <div className="container flex items-center justify-between h-14 gap-3">
        <Link href="/" className="font-display font-bold text-lg shrink-0">
          Bolão 2026
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5 text-sm">
          <Link href="/regras" className="hover:text-brand-primary">Como funciona</Link>
          <Link href="/sobre" className="hover:text-brand-primary hidden sm:inline">Sobre</Link>
          <Link href="/termos" className="hover:text-brand-primary hidden md:inline">Termos</Link>
          {session ? (
            <Link href="/home" className="font-medium text-brand-primary hover:underline">
              Voltar ao bolão
            </Link>
          ) : (
            <Link href="/login" className="font-medium text-brand-primary hover:underline">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
