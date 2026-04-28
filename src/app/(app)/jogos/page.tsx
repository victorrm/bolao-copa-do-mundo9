import { db, schema } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { MatchCard } from "./match-card";

export const dynamic = "force-dynamic";

export default async function JogosPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const home = alias(schema.teams, "home");
  const away = alias(schema.teams, "away");

  const rows = await db
    .select({
      match: schema.matches,
      home,
      away,
    })
    .from(schema.matches)
    .leftJoin(home, eq(schema.matches.homeTeamId, home.id))
    .leftJoin(away, eq(schema.matches.awayTeamId, away.id))
    .orderBy(asc(schema.matches.scheduledAt));

  const userPredictions = await db
    .select()
    .from(schema.predictions)
    .where(eq(schema.predictions.userId, session.user.id));
  const predByMatch = new Map(userPredictions.map((p) => [p.matchId, p]));

  const groupedByDay = new Map<string, typeof rows>();
  for (const r of rows) {
    const date = new Date(r.match.scheduledAt * 1000);
    const key = date.toISOString().slice(0, 10);
    if (!groupedByDay.has(key)) groupedByDay.set(key, []);
    groupedByDay.get(key)!.push(r);
  }

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", timeZone: "America/Sao_Paulo",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Palpites</h1>
        <p className="text-brand-text-muted mt-1">
          Auto-salva conforme você digita. Trava 15 min antes do início.
        </p>
      </div>

      {Array.from(groupedByDay.entries()).map(([day, dayMatches]) => (
        <section key={day} className="space-y-3">
          <h2 className="font-display text-xl font-semibold capitalize">
            {formatter.format(new Date(day + "T12:00:00Z"))}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {dayMatches.map((r) => (
              <MatchCard
                key={r.match.id}
                match={r.match}
                home={r.home}
                away={r.away}
                prediction={predByMatch.get(r.match.id) ?? null}
              />
            ))}
          </div>
        </section>
      ))}

      {rows.length === 0 && (
        <p className="text-brand-text-muted">
          Nenhum jogo cadastrado ainda. Rode <code>pnpm fd:sync</code> pra puxar da Football-Data.
        </p>
      )}
    </div>
  );
}
