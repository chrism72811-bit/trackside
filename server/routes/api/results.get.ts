import { defineHandler } from "nitro";

type ResultCard = { race: string | null; date: string | null; winner: string | null; champion: string | null; leader: string | null; source: string };
type SeriesKey = "cup" | "oReilly" | "trucks" | "f1";
const year = new Date().getUTCFullYear();
const series: Record<SeriesKey, { results: string; standings: string }> = {
  cup: {
    results: `https://www.nascar.com/results/racecenter/${year}/nascar-cup-series/`,
    standings: "https://www.nascar.com/standings/",
  },
  oReilly: {
    results: `https://www.nascar.com/results/racecenter/${year}/nascar-xfinity-series/`,
    standings: "https://www.nascar.com/standings/",
  },
  trucks: {
    results: `https://www.nascar.com/results/racecenter/${year}/nascar-craftsman-truck-series/`,
    standings: "https://www.nascar.com/standings/",
  },
  f1: {
    results: `https://www.formula1.com/en/results/${year}/races`,
    standings: `https://www.formula1.com/en/results/${year - 1}/drivers`,
  },
};

async function getPage(url: string) {
  try {
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 Trackside racing results", Accept: "text/html" } });
    if (!response.ok) return "";
    return await response.text();
  } catch {
    return "";
  }
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
    return { race: row?.[1] ?? null, date: row?.[0] ?? null, winner: row?.[2] ?? null };
  }
  const row = rows.find((cells) => /^(1|1st|P1)$/i.test(cells[0]) && cells.length >= 2 && /[A-Za-z]/.test(cells.at(-1) ?? ""));
  const name = row?.slice(1).reverse().find((cell) => /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(cell));
  const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s*\|\s*NASCAR.*$/i, "").trim();
  return { race: title || null, date: null, winner: name ?? null };
}

function firstStanding(html: string) {
  const rows = rowsFrom(html);
  const row = rows.find((cells) => /^(1|1st|P1)$/i.test(cells[0]) && cells.length > 1);
  return row?.slice(1).reverse().find((cell) => /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(cell)) ?? null;
}

export default defineHandler(async () => {
  const entries = await Promise.all(Object.entries(series).map(async ([key, urls]) => {
    const [resultsHtml, standingsHtml] = await Promise.all([getPage(urls.results), getPage(urls.standings)]);
    const parsed = raceResult(resultsHtml, key as SeriesKey);
    return [key, { ...parsed, champion: firstStanding(standingsHtml), leader: null, source: urls.results }] as const;
  }));
  return Object.fromEntries(entries) as Record<SeriesKey, ResultCard>;
});
