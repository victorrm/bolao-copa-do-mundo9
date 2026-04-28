"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface NavLabels {
  matches: string;
  specials: string;
  ranking: string;
  leagues: string;
}

interface Props {
  userName: string;
  labels: NavLabels;
  logoutSlot: React.ReactNode;
}

export function AppNav({ userName, labels, logoutSlot }: Props) {
  const [open, setOpen] = useState(false);
  const LINKS = [
    { href: "/jogos", label: labels.matches },
    { href: "/palpites-especiais", label: labels.specials },
    { href: "/ranking", label: labels.ranking },
    { href: "/grupos", label: labels.leagues },
  ];

  return (
    <>
      <nav className="hidden md:flex items-center gap-4 text-sm">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-brand-primary">{l.label}</Link>
        ))}
        <Link href="/perfil" className="hover:text-brand-primary">{userName}</Link>
        <ThemeToggle />
        {logoutSlot}
      </nav>

      <div className="md:hidden flex items-center gap-1">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="p-2 rounded-lg hover:bg-brand-surface"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute top-0 right-0 bottom-0 w-72 bg-brand-card border-l border-brand-border p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-display font-bold">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="p-1 rounded-lg hover:bg-brand-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-3 text-base">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-2 hover:text-brand-primary"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/perfil"
                onClick={() => setOpen(false)}
                className="py-2 hover:text-brand-primary border-t border-brand-border pt-3 mt-2"
              >
                {userName}
              </Link>
              <div className="mt-4">{logoutSlot}</div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
