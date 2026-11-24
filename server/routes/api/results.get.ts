import { defineHandler } from "nitro";

type ResultCard = { race: string | null; date: string | null; winner: string | null; champion: string | null; leader: string | null; source: string };
type SeriesKey = "cup" | "oReilly" | "trucks" | "f1";
type Competitor = { winner?: boolean; athlete?: { displayName?: string }; team?: { displayName?: string }; displayName?: string; order?: number; rank?: number };
type Event = { name?: string; date?: string; status?: { type?: { completed?: boolean } }; competitions?: { competitors?: Competitor[] }[] };
type Scoreboard = { events?: Event[] };
type StandingEntry = { athlete?: { displayName?: string }; team?: { displayName?: string } };
type Standings = { standings?: { entries?: StandingEntry[] }[]; children?: { standings?: { entries?: StandingEntry[] } }[] };
const year = new Date().getUTCFullYear();
const series: Record<SeriesKey, { results: string; standings: string; espn: string }> = {
  cup: { results: `https://www.nascar.com/results/racecenter/${year}/nascar-cup-series/`, standings: "https://www.nascar.com/standings/", espn: "nascar-cup" },
  oReilly: { results: `https://www.nascar.com/results/racecenter/${year}/nascar-xfinity-series/`, standings: "https://www.nascar.com/standings/", espn: "nascar-xfinity" },
  trucks: { results: `https://www.nascar.com/results/racecenter/${year}/nascar-craftsman-truck-series/`, standings: "https://www.nascar.com/standings/", espn: "nascar-truck" },
  f1: { results: `https://www.formula1.com/en/results/${year}/races`, standings: `https://www.formula1.com/en/results/${year - 1}/drivers`, espn: "f1" },
};
const espnBase = "https://site.api.espn.com/apis/site/v2/sports/racing";

async function getPage(url: string) {
  try {
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 Trackside racing results", Accept: "text/html" } });
    return response.ok ? await response.text() : "";
  } catch { return ""; }
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    return response.ok ? await response.json() as T : null;
  } catch { return null; }
}

function cleanText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&#x27;|&#39;|&apos;/gi, "'").replace(/&quot;/gi, '"').replace(/\s+/g, " ").trim();
}

function rowsFrom(html: string) {
  return [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => [...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => cleanText(cell[1])).filter(Boolean)).filter((row) => row.length > 1);
}

function raceResult(html: string, key: SeriesKey) {
  const rows = rowsFrom(html);
  if (key === "f1") {
    const row = rows.find((cells) => cells.length >= 3 && /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(cells[2]));
    const winner = row?.[2]?.replace(/\s+[A-Z]{3}$/, "") ?? null;
    return { race: row?.[1] ?? null, date: row?.[0] ?? null, winner };
  }
  const row = rows.find((cells) => /^(1|1st|P1)$/i.test(cells[0]) && cells.length >= 2);
  const winner = row?.slice(1).reverse().find((cell) => /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(cell)) ?? null;
  const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s*\|\s*NASCAR.*$/i, "").trim();
  return { race: title || null, date: null, winner };
}

function firstStanding(html: string) {
  const row = rowsFrom(html).find((cells) => /^(1|1st|P1)$/i.test(cells[0]) && cells.length > 1);
  return row?.slice(1).reverse().find((cell) => /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(cell)) ?? null;
}

function latestEspn(board: Scoreboard | null) {
  const events = (board?.events ?? []).filter((event) => event.competitions?.[0]?.competitors?.length && event.status?.type?.completed);
  events.sort((a, b) => Date.parse(b.date ?? "") - Date.parse(a.date ?? ""));
  const event = events[0];
  const competitors = event?.competitions?.[0]?.competitors ?? [];
  const winner = competitors.find((item) => item.winner) ?? competitors.find((item) => item.order === 1 || item.rank === 1);
  return { race: event?.name ?? null, date: event?.date ?? null, winner: winner?.athlete?.displayName ?? winner?.team?.displayName ?? winner?.displayName ?? null };
}

function firstEspnStanding(data: Standings | null) {
  const entries = data?.standings?.entries ?? data?.children?.flatMap((child) => child.standings?.entries ?? []) ?? [];
  return entries[0]?.athlete?.displayName ?? entries[0]?.team?.displayName ?? null;
}

export default defineHandler(async () => {
  const entries = await Promise.all(Object.entries(series).map(async ([key, urls]) => {
    const [officialResults, officialStandings, board, currentStandings, previousStandings] = await Promise.all([
      getPage(urls.results),
      getPage(urls.standings),
      getJson<Scoreboard>(`${espnBase}/${urls.espn}/scoreboard?limit=100`),
      getJson<Standings>(`${espnBase}/${urls.espn}/standings?season=${year}`),
      getJson<Standings>(`${espnBase}/${urls.espn}/standings?season=${year - 1}`),
    ]);
    const official = raceResult(officialResults, key as SeriesKey);
    const fallback = latestEspn(board);
    return [key, {
      race: official.race ?? fallback.race,
      date: official.date ?? fallback.date,
      winner: official.winner ?? fallback.winner,
      champion: firstStanding(officialStandings) ?? firstEspnStanding(previousStandings),
      leader: firstEspnStanding(currentStandings),
      source: urls.results,
    }] as const;
  }));
  return Object.fromEntries(entries) as Record<SeriesKey, ResultCard>;
});
