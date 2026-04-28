"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "./actions";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (next !== confirm) { setError("Senhas não conferem"); return; }
        if (next.length < 12) { setError("Mínimo 12 caracteres"); return; }
        start(async () => {
          const res = await changePassword({ current, next });
          if (!res.ok) setError(res.error ?? "Erro");
        });
      }}
    >
      <Input type="password" placeholder="Senha atual" value={current} onChange={(e) => setCurrent(e.target.value)} required />
      <Input type="password" placeholder="Nova senha (mín 12)" value={next} onChange={(e) => setNext(e.target.value)} required minLength={12} />
      <Input type="password" placeholder="Confirme" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={12} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isPending}>{isPending ? "Trocando…" : "Trocar senha"}</Button>
    </form>
  );
}
