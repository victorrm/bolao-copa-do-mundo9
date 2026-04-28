"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLogin } from "./actions";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await adminLogin({ email, password });
          if (!res.ok) setError(res.error ?? "Falha no login");
        });
      }}
    >
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isPending || !email || !password}>
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
