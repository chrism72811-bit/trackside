import { useEffect, useState } from "react";
import { Flag, Gauge, Trophy, MessageCircle, Play, ChevronRight, Sparkles, Check, LockKeyhole, Send, Menu, LayoutGrid, CarFront, ScanLine } from "lucide-react";
import "../App.css";

type Series = "NASCAR" | "F1";
type Driver = { name: string; clue: string; series: Series };
const drivers: Driver[] = [
  { name: "Dale Earnhardt", clue: "Seven-time Cup Series champion known as The Intimidator.", series: "NASCAR" },
  { name: "Jeff Gordon", clue: "Four-time champion who made the No. 24 famous.", series: "NASCAR" },
  { name: "Jimmie Johnson", clue: "Seven-time champion who won five titles in a row.", series: "NASCAR" },
  { name: "Richard Petty", clue: "The King: 200 career Cup wins and seven championships.", series: "NASCAR" },
  { name: "Tony Stewart", clue: "Three-time Cup champion, also a standout open-wheel racer.", series: "NASCAR" },
  { name: "Danica Patrick", clue: "A trailblazing driver who won an IndyCar race and raced in NASCAR.", series: "NASCAR" },
  { name: "Kyle Busch", clue: "A two-time Cup champion nicknamed Rowdy.", series: "NASCAR" },
  { name: "Bubba Wallace", clue: "A modern Cup driver who races the No. 23 Toyota.", series: "NASCAR" },
  { name: "Chase Elliott", clue: "The 2020 Cup champion, known to fans as 'NAPA' Chase.", series: "NASCAR" },
  { name: "Joey Logano", clue: "Three-time Cup champion known as Sliced Bread early in his career.", series: "NASCAR" },
  { name: "Martin Truex Jr.", clue: "2017 Cup champion and a strong performer on road courses.", series: "NASCAR" },
  { name: "Kevin Harvick", clue: "2014 Cup champion who took over the No. 3 after Dale Earnhardt.", series: "NASCAR" },
  { name: "Denny Hamlin", clue: "A multiple-time Daytona 500 winner and long-time No. 11 driver.", series: "NASCAR" },
  { name: "Ryan Blaney", clue: "2023 Cup champion and driver of the No. 12.", series: "NASCAR" },
  { name: "William Byron", clue: "2024 Cup champion who drives the No. 24 for Hendrick Motorsports.", series: "NASCAR" },
  { name: "Kyle Larson", clue: "A versatile champion known for success on dirt and pavement.", series: "NASCAR" },
  { name: "Brad Keselowski", clue: "2012 Cup champion and co-owner of RFK Racing.", series: "NASCAR" },
  { name: "Rusty Wallace", clue: "1989 Cup champion and one of the sport's most memorable voices.", series: "NASCAR" },
  { name: "Bobby Allison", clue: "Three-time champion and member of the Alabama Gang.", series: "NASCAR" },
  { name: "Cale Yarborough", clue: "The first driver to win three consecutive Cup championships.", series: "NASCAR" },
  { name: "Darrell Waltrip", clue: "Three-time champion famous for his colorful commentary.", series: "NASCAR" },
  { name: "David Pearson", clue: "A three-time champion with one of the best win percentages ever.", series: "NASCAR" },
  { name: "Bill Elliott", clue: "1988 champion once known as Million Dollar Bill.", series: "NASCAR" },
  { name: "Mark Martin", clue: "A legendary, five-time runner-up in the Cup championship standings.", series: "NASCAR" },
  { name: "Ayrton Senna", clue: "Three-time Brazilian world champion celebrated for wet-weather skill.", series: "F1" },
  { name: "Lewis Hamilton", clue: "Seven-time world champion and record-setting British driver.", series: "F1" },
  { name: "Michael Schumacher", clue: "German seven-time champion who dominated with Ferrari.", series: "F1" },
  { name: "Max Verstappen", clue: "Dutch world champion known for aggressive precision.", series: "F1" },
  { name: "Fernando Alonso", clue: "Two-time Spanish world champion with remarkable longevity.", series: "F1" },
  { name: "Sebastian Vettel", clue: "German four-time champion who won titles with Red Bull.", series: "F1" },
  { name: "Charles Leclerc", clue: "Monégasque Ferrari driver who grew up racing at home in Monaco.", series: "F1" },
  { name: "Lando Norris", clue: "British McLaren driver known for speed and a playful personality.", series: "F1" },
  { name: "Jackie Stewart", clue: "Three-time Scottish champion and influential safety advocate.", series: "F1" },
  { name: "Alain Prost", clue: "Four-time French champion nicknamed The Professor.", series: "F1" },
];
const navItems = [
  { name: "Overview", icon: LayoutGrid }, { name: "Ask Trackside", icon: Sparkles },
  { name: "Driver garage", icon: CarFront }, { name: "Photo challenge", icon: ScanLine }, { name: "Race hub", icon: Play },
];
const pickDriver = (series: Series, previous?: string) => {
  const options = drivers.filter((driver) => driver.series === series && driver.name !== previous);
  return options[Math.floor(Math.random() * options.length)];
};
const respondTo = (text: string, series: Series) => {
  const message = text.toLowerCase().trim();
  if (/^(hi|hey|hello|hiya|yo|sup)\b/.test(message)) return "Hey! Great to have you trackside. Are you following NASCAR or F1 today?";
  if (/\b(idk|i don't know|i dont know|not sure|no idea)\b/.test(message)) return "No worries — let's start easy. What do you enjoy most: close finishes, pit-stop strategy, or learning about legendary drivers?";
  if (/\b(thanks|thank you|thx)\b/.test(message)) return "Anytime! That's what a racing co-pilot is for. Got another racing question?";
  if (/\b(who|driver|favorite|best)\b/.test(message)) return series === "NASCAR" ? "NASCAR has a deep bench of stars. For all-time legends, Dale Earnhardt, Richard Petty, and Jeff Gordon are great names to explore. Want a quick intro to one?" : "F1 has an incredible mix of eras. Ayrton Senna, Michael Schumacher, Lewis Hamilton, and today's stars all have fascinating stories. Who should we talk about?";
  if (/\b(pit|stop|tires|strategy)\b/.test(message)) return series === "NASCAR" ? "In NASCAR, a pit stop usually means four fresh tires, fuel, and small adjustments. A fast, clean stop can gain several positions — but timing it around cautions is the strategic part." : "In F1, pit crews change all four tires in seconds. Teams choose when to stop based on tire wear, traffic, and whether a safety car creates a cheaper pit window.";
  if (/\b(what|how|why|when|where|explain|tell)\b/.test(message)) return `Good question! In ${series}, the details depend on the race and rules. I can help with drivers, teams, race strategy, tracks, and history — which part would you like to dig into?`;
  return "I'm with you! Tell me a little more and I'll help figure it out. We can talk drivers, race rules, rivalries, tracks, or strategy.";
};

const Index = () => {
  const [series, setSeries] = useState<Series>("NASCAR");
  const [driver, setDriver] = useState<Driver>(() => pickDriver("NASCAR"));
  const [photo, setPhoto] = useState("");
  const [guess, setGuess] = useState("");
  const [collected, setCollected] = useState<string[]>(() => JSON.parse(localStorage.getItem("trackside-garage") || "[]"));
  const [answer, setAnswer] = useState("");
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<{ question: string; answer: string }[]>([]);
  const [active, setActive] = useState("Overview");

  useEffect(() => {
    let cancelled = false;
    setPhoto("");
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(driver.name)}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { thumbnail?: { source?: string } }) => { if (!cancelled) setPhoto(data.thumbnail?.source || ""); })
      .catch(() => { if (!cancelled) setPhoto(""); });
    return () => { cancelled = true; };
  }, [driver]);

  const changeSeries = (next: Series) => {
    setSeries(next);
    setDriver(pickDriver(next));
    setAnswer("");
  };
  const submitGuess = (event: React.FormEvent) => {
    event.preventDefault();
    if (guess.trim().toLowerCase() === driver.name.toLowerCase()) {
      const updated = [...new Set([...collected, driver.name])];
      setCollected(updated);
      localStorage.setItem("trackside-garage", JSON.stringify(updated));
      setAnswer(`That's right — ${driver.name} is now in your garage!`);
    } else setAnswer("Not quite — take another look at the photo and clue. Try typing the full name!");
    setGuess("");
  };
  const ask = (event: React.FormEvent) => {
    event.preventDefault();
    const question = chat.trim();
    if (!question) return;
    setMessages((previous) => [...previous, { question, answer: respondTo(question, series) }]);
    setChat("");
  };

  return <div className="apex-app">
    <aside className="sidebar">
      <a className="brand" href="#home"><span className="brand-mark"><Flag size={23}/></span><span>TRACK<span className="brand-light">SIDE</span><small>THE RACING CLUBHOUSE</small></span></a>
      <div className="side-label">YOUR PADDOCK</div>
      {navItems.map(({ name, icon: Icon }) => <button key={name} className={`nav-item ${active === name ? "selected" : ""}`} onClick={() => setActive(name)}><Icon size={19}/>{name}{name === "Driver garage" && <span className="nav-count">{collected.length}</span>}</button>)}
      <div className="sidebar-bottom"><div className="member-card"><div className="member-icon"><Sparkles size={19}/></div><b>Your racing co-pilot.</b><span>Every driver. Every story. Ask away.</span><div className="mini-progress"><i style={{ width: `${Math.min(100, collected.length * 5)}%` }}/></div></div><div className="profile"><div className="profile-avatar">R</div><div><b>Racing fan</b><span>{collected.length} drivers collected</span></div><ChevronRight size={16}/></div></div>
    </aside>
    <main className="main-area" id="home">
      <header className="topbar"><button className="mobile-menu" aria-label="Open menu"><Menu/></button><div className="top-intro">Your all-access pass to motorsport</div><div className="series-toggle"><button className={series === "NASCAR" ? "active nascar" : ""} onClick={() => changeSeries("NASCAR")}>▰ &nbsp; NASCAR</button><button className={series === "F1" ? "active f1" : ""} onClick={() => changeSeries("F1")}>F1 &nbsp; FORMULA 1</button></div></header>
      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow"><span/> {series} PADDOCK</div><h1>Welcome to the fast lane.</h1><p>Fuel your curiosity. Know your drivers. Never miss a lap.</p></div></section>
        <div className="dashboard-grid">
          <section className="quiz-card"><div className="quiz-top"><div><div className="eyebrow"><Sparkles size={14}/> PHOTO CHALLENGE · {series}</div><h2>Know this <em>driver?</em></h2></div><button className="text-link" onClick={() => { setDriver(pickDriver(series, driver.name)); setAnswer(""); }}>NEXT DRIVER <ChevronRight size={15}/></button></div><div className={`driver-photo ${photo ? "has-photo" : ""}`} style={photo ? { backgroundImage: `linear-gradient(0deg,rgba(18,20,23,.82),transparent 65%),url("${photo}")` } : undefined}>{photo ? <span className="photo-credit">REAL DRIVER PHOTO · WIKIPEDIA</span> : <div className="photo-loading"><Flag size={35}/><span>Loading a real {series} driver photo…</span><small>If images are blocked, try the next driver.</small></div>}<div className="photo-clue"><span>HINT</span><p>{driver.clue}</p></div><span className="photo-question">?</span></div><form className="guess-form" onSubmit={submitGuess}><input value={guess} onChange={(event) => setGuess(event.target.value)} placeholder="Type the driver's full name..." aria-label="Type the driver's full name"/><button type="submit">SUBMIT GUESS <ChevronRight size={16}/></button></form>{answer && <div className={`answer-note ${answer.startsWith("That's") ? "correct" : ""}`}>{answer.startsWith("That's") && <Check size={15}/>} {answer}</div>}<div className="quiz-foot"><span><Sparkles size={14}/> Guess correctly to collect this driver</span><span>+250 PTS</span></div></section>
          <div className="right-column"><section className="garage-card"><div className="section-head"><div><div className="eyebrow">YOUR COLLECTION</div><h3>Driver garage <span className="garage-total">{collected.length}</span></h3></div><button className="text-link" onClick={() => setActive("Driver garage")}>VIEW ALL <ChevronRight size={15}/></button></div><div className="garage-shelf">{Array.from({ length: 4 }, (_, index) => { const name = collected[index]; return <div className={`driver-slot ${name ? "unlocked" : ""}`} key={index}>{name ? <><div className="driver-initial">{name.split(" ").map((part) => part[0]).join("")}</div><b>{name.split(" ").at(-1)}</b><span>COLLECTED</span></> : <><LockKeyhole size={18}/><span>LOCKED</span></>}</div>; })}</div><div className="garage-footer"><span>Collect drivers from both series</span><span>{collected.length}/{drivers.length} shown</span></div></section>
          <section className="ai-card"><div className="ai-heading"><div className="ai-icon"><Sparkles size={18}/></div><div><div className="eyebrow">YOUR RACING INTELLIGENCE</div><h3>Ask Trackside</h3></div><span className="online-status">READY TO CHAT</span></div><p>Say hi, ask a question, or tell me what you're curious about.</p><div className="chat-thread">{messages.length === 0 ? <div className="starter-message">Hey! I'm your racing co-pilot. Ask me anything, or just say hi 👋</div> : messages.slice(-3).map((message, index) => <div className="message-pair" key={`${message.question}-${index}`}><div className="user-message">{message.question}</div><div className="assistant-message">{message.answer}</div></div>)}</div><div className="suggestions"><button onClick={() => setChat("How do pit stops work?")}>How do pit stops work?</button><button onClick={() => setChat("I'm not sure what to ask")}>I'm not sure what to ask</button></div><form className="chat-form" onSubmit={ask}><input value={chat} onChange={(event) => setChat(event.target.value)} placeholder="Message your racing co-pilot..."/><button aria-label="Send message"><Send size={16}/></button></form><div className="ai-disclaimer"><MessageCircle size={12}/> Trackside chat is a demo with built-in racing replies.</div></section></div>
        </div>
        <section className="watch-section"><div className="watch-heading"><div><div className="eyebrow">DON'T MISS A LAP</div><h3>Race day, <em>your way.</em></h3></div><button className="text-link">FULL SCHEDULE <ChevronRight size={15}/></button></div><div className="race-card"><div className="race-icon"><Flag size={20}/></div><div className="race-details"><span className="race-series">{series} · NEXT RACE</span><b>{series === "NASCAR" ? "NASCAR Cup Series — Coca-Cola 600" : "Formula 1 — Monaco Grand Prix"}</b><span>Race schedule and official viewing options</span></div><div className="race-tag">UP NEXT</div><button className="watch-button" onClick={() => setActive("Race hub")}><Play size={14} fill="currentColor"/> RACE HUB</button></div><div className="watch-note"><LockKeyhole size={13}/> Official viewing options only. Stream availability depends on your location and provider.</div></section>
        <footer><span>TRACKSIDE <i>·</i> BUILT FOR THE LOVE OF THE RACE</span><span>GO FAST. STAY CURIOUS.</span></footer>
      </div>
    </main>
  </div>;
};

export default Index;
