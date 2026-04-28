const BASE = "https://api.football-data.org/v4";

export interface FdMatch {
  id: number;
  utcDate: string;
  status: "TIMED" | "SCHEDULED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "POSTPONED" | "CANCELLED" | "SUSPENDED";
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string | null };
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string | null };
  score: {
    winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    duration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT";
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
    extraTime?: { home: number | null; away: number | null };
    penalties?: { home: number | null; away: number | null };
  };
  lastUpdated: string;
}

export interface FdMatchesResponse {
  filters: { season: number };
  resultSet: { count: number; first: string; last: string; played: number };
  matches: FdMatch[];
}

export class FootballDataClient {
  constructor(private apiKey: string) {}

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "X-Auth-Token": this.apiKey },
    });
    if (!res.ok) {
      throw new Error(`Football-Data API ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  async getWorldCupMatches(season = 2026): Promise<FdMatchesResponse> {
    return this.get<FdMatchesResponse>(`/competitions/WC/matches?season=${season}`);
  }
}

export function mapStage(fdStage: string): string {
  const map: Record<string, string> = {
    GROUP_STAGE: "group",
    LAST_16: "r16",
    ROUND_OF_32: "r32",
    QUARTER_FINALS: "qf",
    SEMI_FINALS: "sf",
    THIRD_PLACE: "3rd",
    FINAL: "final",
  };
  return map[fdStage] ?? fdStage.toLowerCase();
}

export function mapStatus(fdStatus: FdMatch["status"]): string {
  const map: Record<FdMatch["status"], string> = {
    TIMED: "scheduled",
    SCHEDULED: "scheduled",
    IN_PLAY: "live",
    PAUSED: "live",
    FINISHED: "finished",
    POSTPONED: "postponed",
    CANCELLED: "cancelled",
    SUSPENDED: "postponed",
  };
  return map[fdStatus];
}

export function groupCode(fdGroup: string | null): string | null {
  if (!fdGroup) return null;
  const m = fdGroup.match(/GROUP_([A-L])/);
  return m ? m[1] : null;
}
