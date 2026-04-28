"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeOnboarding } from "./actions";

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName);
  const [consent, setConsent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await completeOnboarding({ name, consent });
          if (!res.ok) setError(res.error ?? "Erro");
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Como devemos te chamar?</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: João S."
          required
          minLength={2}
          maxLength={50}
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-brand-text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
          required
        />
        <span>
          Concordo com o tratamento dos meus dados conforme a{" "}
          <a href="/privacidade" target="_blank" className="underline">política de privacidade</a>{" "}
          e com os{" "}
          <a href="/termos" target="_blank" className="underline">termos de uso</a>.
        </span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={isPending || !consent || name.trim().length < 2}>
        {isPending ? "Salvando…" : "Começar a palpitar"}
      </Button>
    </form>
  );
}
