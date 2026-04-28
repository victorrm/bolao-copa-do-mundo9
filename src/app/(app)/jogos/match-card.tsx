"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { savePrediction } from "./actions";
import type { Match, Team, Prediction } from "@/lib/db/schema";

interface Props {
  match: Match;
  home: Team | null;
  away: Team | null;
  prediction: Prediction | null;
}

const DEADLINE_OFFSET_SECONDS = 15 * 60;

export function MatchCard({ match, home, away, prediction }: Props) {
  const [homeScore, setHomeScore] = useState<string>(prediction ? String(prediction.homeScore) : "");
  const [awayScore, setAwayScore] = useState<string>(prediction ? String(prediction.awayScore) : "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const now = Math.floor(Date.now() / 1000);
  const isLocked = now > match.scheduledAt - DEADLINE_OFFSET_SECONDS || match.status !== "scheduled";

  useEffect(() => {
    if (homeScore === "" || awayScore === "") return;
    if (isLocked) return;

    const h = Number(homeScore);
    const a = Number(awayScore);
    if (!Number.isInteger(h) || !Number.isInteger(a) || h < 0 || a < 0 || h > 20 || a > 20) return;

    if (prediction && prediction.homeScore === h && prediction.awayScore === a) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStatus("saving");
      startTransition(async () => {
        const res = await savePrediction({ matchId: match.id, homeScore: h, awayScore: a });
        setStatus(res.ok ? "saved" : "error");
        if (res.ok) setTimeout(() => setStatus("idle"), 1500);
      });
    }, 800);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [homeScore, awayScore, isLocked, match.id, prediction]);

  const dateFmt = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
  });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3 text-xs text-brand-text-muted">
        <span>
          {match.stage === "group" ? `Grupo ${match.groupCode} · Rod. ${match.round}` : match.stage.toUpperCase()}
        </span>
        <span>{dateFmt.format(new Date(match.scheduledAt * 1000))}</span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {home?.flagUrl && (
            <Image src={home.flagUrl} alt="" width={28} height={20} className="rounded-sm shrink-0" />
          )}
          <span className="font-medium truncate text-sm sm:text-base">{home?.namePt ?? "—"}</span>
        </div>

        <div className="flex items-center gap-1">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={homeScore}
            disabled={isLocked}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-11 sm:w-12 h-10 text-center font-mono text-base px-0"
            placeholder="-"
            aria-label={`Placar ${home?.namePt ?? "casa"}`}
          />
          <span className="text-brand-text-muted">×</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={awayScore}
            disabled={isLocked}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-11 sm:w-12 h-10 text-center font-mono text-base px-0"
            placeholder="-"
            aria-label={`Placar ${away?.namePt ?? "fora"}`}
          />
        </div>

        <div className="flex items-center gap-2 justify-end min-w-0">
          <span className="font-medium truncate text-right text-sm sm:text-base">{away?.namePt ?? "—"}</span>
          {away?.flagUrl && (
            <Image src={away.flagUrl} alt="" width={28} height={20} className="rounded-sm shrink-0" />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs h-4">
        <a href={`/jogos/${match.id}`} className="text-brand-text-muted hover:text-brand-primary">
          detalhes & comentários →
        </a>
        <span>
          {isLocked && <span className="text-brand-text-muted">Trancado</span>}
          {!isLocked && status === "saving" && <span className="text-brand-text-muted">Salvando…</span>}
          {!isLocked && status === "saved" && <span className="text-brand-primary">✓ Salvo</span>}
          {!isLocked && status === "error" && <span className="text-red-500">Erro ao salvar</span>}
          {!isLocked && status === "idle" && prediction && (
            <span className="text-brand-text-muted">Palpite registrado</span>
          )}
        </span>
      </div>
    </Card>
  );
}
