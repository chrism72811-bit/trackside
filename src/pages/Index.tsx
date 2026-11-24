import { useState } from "react";
import { Flag, Gauge, Trophy, MessageCircle, Play, ChevronRight, Sparkles, Check, LockKeyhole, Send, Menu } from "lucide-react";
import "../App.css";

type Series = "NASCAR" | "F1";
const drivers = ["Dale Earnhardt", "Jeff Gordon", "Jimmie Johnson", "Richard Petty", "Tony Stewart"];

const Index = () => {
  const [series, setSeries] = useState<Series>("NASCAR");
  const [guess, setGuess] = useState("");
  const [collected, setCollected] = useState<string[]>(() => JSON.parse(localStorage.getItem("apex-garage") || "[]"));
  const [answer, setAnswer] = useState("");
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [active, setActive] = useState("Home");
  const correct = series === "NASCAR" ? "Dale Earnhardt" : "Ayrton Senna";

  const submitGuess = (event: React.FormEvent) => {
    event.preventDefault();
    if (guess.trim().toLowerCase() === correct.toLowerCase()) {
      const updated = [...new Set([...collected, correct])];
      setCollected(updated);
      localStorage.setItem("apex-garage", JSON.stringify(updated));
      setAnswer(`That's right — ${correct} is now in your garage!`);
    } else setAnswer("Not quite. Take another look and try again!");
    setGuess("");
  };

  const ask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!chat.trim()) return;
    setMessages([...messages, chat.trim()]);
    setChat("");
  };

  const image = series === "NASCAR"
    ? "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1100&q=85"
    : "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1100&q=85";

  return <div className="apex-app">
    <aside className="sidebar">
      <a className="brand" href="#home"><span className="brand-mark"><Gauge size={23}/></span><span>APEX<span className="brand-light"> GARAGE</span><small>THE RACING CLUBHOUSE</small></span></a>
      <div className="side-label">YOUR PADDOCK</div>
      {[{name:"Home",icon:Gauge},{name:"NASCAR",icon:Flag},{name:"F1",icon:Flag},{name:"Photo quiz",icon:Sparkles},{name:"My garage",icon:Trophy}].map(({name,icon:Icon})=><button key={name} className={`nav-item ${active===name?"selected":""}`} onClick={()=>{setActive(name);if(name==="NASCAR"||name==="F1")setSeries(name)}}><Icon size={18}/>{name}{name==="My garage"&&<span className="nav-count">{collected.length}</span>}</button>)}
      <div className="sidebar-bottom"><div className="member-card"><div className="member-icon"><Trophy size={19}/></div><b>Your collection</b><span>{collected.length} drivers unlocked</span><div className="mini-progress"><i style={{width:`${Math.min(100,collected.length*20)}%`}}/></div></div><div className="profile"><div className="profile-avatar">R</div><div><b>Racing fan</b><span>Rookie member</span></div><ChevronRight size={16}/></div></div>
    </aside>
    <main className="main-area" id="home">
      <header className="topbar"><button className="mobile-menu"><Menu/></button><div className="breadcrumb">THE CLUBHOUSE <span>/</span> <b>{active.toUpperCase()}</b></div><div className="top-right"><span className="live-dot"/> RACE WEEKEND <span className="avatar-small">R</span></div></header>
      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow"><span/> YOUR RACING HQ</div><h1>Good to see you,<br/><em>race fan.</em></h1><p>Your next racing obsession starts right here.</p></div><div className="series-toggle"><button className={series==="NASCAR"?"active nascar":""} onClick={()=>setSeries("NASCAR")}>NASCAR</button><button className={series==="F1"?"active f1":""} onClick={()=>setSeries("F1")}>F1</button></div></section>
        <div className="dashboard-grid">
          <section className="quiz-card"><div className="quiz-top"><div><div className="eyebrow"><Sparkles size={14}/> THE DRIVER CHALLENGE</div><h2>Can you name<br/>this <em>{series === "NASCAR" ? "legend" : "racing icon"}?</em></h2></div><span className="round-count">01 <i>/ 05</i></span></div><div className="driver-photo" style={{backgroundImage:`linear-gradient(0deg,rgba(18,20,23,.92),transparent 68%),url('${image}')`}}><div className="photo-label"><span className="red-dot"/> {series} · DRIVER #01</div><div className="photo-clue"><span>CLUE 01</span><b>{series==="NASCAR"?"The Intimidator.":"The rain master."}</b><p>{series==="NASCAR"?"A seven-time champion who made the black No. 3 an icon.":"A three-time world champion from Brazil, revered for qualifying brilliance."}</p></div><span className="photo-question">?</span></div><form className="guess-form" onSubmit={submitGuess}><input value={guess} onChange={e=>setGuess(e.target.value)} placeholder="Type your answer..." aria-label="Guess the driver"/><button type="submit">LOCK IN <ChevronRight size={16}/></button></form>{answer&&<div className={`answer-note ${answer.startsWith("That's")?"correct":""}`}>{answer.startsWith("That's")&&<Check size={15}/>} {answer}</div>}<div className="quiz-foot"><span><Sparkles size={14}/> Correct answer joins your garage</span><span>+250 PTS</span></div></section>
          <div className="right-column"><section className="garage-card"><div className="section-head"><div><div className="eyebrow">YOUR COLLECTION</div><h3>The Garage <span className="garage-total">{collected.length}</span></h3></div><button className="text-link" onClick={()=>setActive("My garage")}>VIEW ALL <ChevronRight size={15}/></button></div><div className="garage-shelf">{Array.from({length:4},(_,i)=>{const driver=collected[i];return <div className={`driver-slot ${driver?"unlocked":""}`} key={i}>{driver?<><div className="driver-initial">{driver.split(" ").map(x=>x[0]).join("")}</div><b>{driver.split(" ").at(-1)}</b><span>LEGEND</span></>:<><LockKeyhole size={18}/><span>LOCKED</span></>}</div>})}</div><div className="garage-footer"><span>Collect racing legends</span><span>{collected.length}/20 drivers</span></div></section>
          <section className="ai-card"><div className="ai-heading"><div className="ai-icon"><Sparkles size={18}/></div><div><div className="eyebrow">YOUR PIT WALL EXPERT</div><h3>Ask Apex AI</h3></div><span className="online-status">ONLINE</span></div><p>Strategy, stats, rivalries — ask me anything about {series}.</p>{messages.length>0&&<div className="chat-reply"><span>You asked: “{messages[messages.length-1]}”</span><b>Great question! I can help break down the racing context, drivers, rules, and history. What part would you like to explore?</b></div>}<div className="suggestions"><button onClick={()=>setChat("How does a NASCAR pit stop work?")}>How do pit stops work?</button><button onClick={()=>setChat("Who should I watch this season?")}>Who to watch this season?</button></div><form className="chat-form" onSubmit={ask}><input value={chat} onChange={e=>setChat(e.target.value)} placeholder="Ask anything about racing..."/><button aria-label="Send question"><Send size={16}/></button></form><div className="ai-disclaimer"><MessageCircle size={12}/> AI answers can make mistakes. Let’s talk racing.</div></section></div>
        </div>
        <section className="watch-section"><div className="watch-heading"><div><div className="eyebrow">DON'T MISS A LAP</div><h3>Race day, <em>your way.</em></h3></div><button className="text-link">FULL SCHEDULE <ChevronRight size={15}/></button></div><div className="race-card"><div className="race-icon"><Flag size={20}/></div><div className="race-details"><span className="race-series">{series} · NEXT RACE</span><b>{series==="NASCAR"?"NASCAR Cup Series — Coca-Cola 600":"Formula 1 — Monaco Grand Prix"}</b><span>Sunday · 6:00 PM ET · Charlotte Motor Speedway</span></div><div className="race-tag">UP NEXT</div><button className="watch-button" onClick={()=>setActive("Watch") }><Play size={14} fill="currentColor"/> WHERE TO WATCH</button></div><div className="watch-note"><LockKeyhole size={13}/> Official viewing options only. Stream availability depends on your location and provider.</div></section>
        <footer><span>APEX GARAGE <i>·</i> BUILT FOR THE LOVE OF THE RACE</span><span>GO FAST. STAY CURIOUS.</span></footer>
      </div>
    </main>
  </div>;
};

export default Index;
