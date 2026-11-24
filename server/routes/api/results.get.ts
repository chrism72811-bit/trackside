import { defineHandler } from "nitro";

type Competitor = { winner?: boolean; athlete?: { displayName?: string }; team?: { displayName?: string }; displayName?: string; order?: number; rank?: number };
type Event = { name?: string; date?: string; status?: { type?: { completed?: boolean } }; competitions?: { competitors?: Competitor[] }[] };
type Scoreboard = { events?: Event[] };
type StandingEntry = { athlete?: { displayName?: string }; team?: { displayName?: string }; stats?: { name?: string; value?: number; displayValue?: string }[] };
type Standings = { standings?: { entries?: StandingEntry[] }[]; children?: { standings?: { entries?: StandingEntry[] } }[] };
const leagues = { cup: "nascar-cup", oReilly: "nascar-xfinity", trucks: "nascar-truck", f1: "f1" };
const base = "https://site.api.espn.com/apis/site/v2/sports/racing";

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

function firstStanding(data: Standings | null) {
  const entries = data?.standings?.entries ?? data?.children?.flatMap((child) => child.standings?.entries ?? []) ?? [];
  const first = entries[0];
  return first?.athlete?.displayName ?? first?.team?.displayName ?? null;
}

export default defineHandler(async () => {
  const year = new Date().getUTCFullYear();
  const entries = await Promise.all(Object.entries(leagues).map(async ([key, league]) => {
    const [board, standings, previousStandings] = await Promise.all([
      getJson<Scoreboard>(`${base}/${league}/scoreboard?limit=100`),
      getJson<Standings>(`${base}/${league}/standings?season=${year}`),
      getJson<Standings>(`${base}/${league}/standings?season=${year - 1}&seasontype=3`),
    ]);
    const finished = (board?.events ?? []).filter((event) => event.status?.type?.completed && event.competitions?.[0]?.competitors?.length);
    finished.sort((a, b) => Date.parse(b.date ?? "") - Date.parse(a.date ?? ""));
    const latest = finished[0];
    const competitors = latest?.competitions?.[0]?.competitors ?? [];
    const winner = competitors.find((competitor) => competitor.winner)?.athlete?.displayName
      ?? competitors.find((competitor) => competitor.winner)?.team?.displayName
      ?? competitors.find((competitor) => competitor.order === 1 || competitor.rank === 1)?.athlete?.displayName
      ?? competitors.find((competitor) => competitor.order === 1 || competitor.rank === 1)?.team?.displayName
      ?? null;
    return [key, {
      race: latest?.name ?? null,
      date: latest?.date ?? null,
      winner,
      leader: firstStanding(standings),
      champion: firstStanding(previousStandings),
    }] as const;
  }));
  return Object.fromEntries(entries);
});
