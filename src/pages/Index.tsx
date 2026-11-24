import { useEffect, useState } from "react";
import { Flag, Sparkles, Trophy, Send, Menu, LayoutGrid, ScanLine, CarFront, CalendarDays, Check, ExternalLink, ChevronRight } from "lucide-react";
import "../App.css";

type Series = "NASCAR" | "F1";
type Driver = { name: string; clue: string; series: Series };
type ChatMessage = { role: "user" | "assistant"; content: string };
const scheduleUrl = "https://dd12fans.com/schedule";
const drivers: Driver[] = [
  {name:"Dale Earnhardt",clue:"Seven-time Cup champion known as The Intimidator.",series:"NASCAR"},{name:"Jeff Gordon",clue:"Four-time champion who made the No. 24 famous.",series:"NASCAR"},{name:"Jimmie Johnson",clue:"Seven-time champion who won five titles in a row.",series:"NASCAR"},{name:"Richard Petty",clue:"The King: 200 career Cup wins and seven championships.",series:"NASCAR"},{name:"Tony Stewart",clue:"Three-time Cup champion and standout open-wheel racer.",series:"NASCAR"},{name:"Danica Patrick",clue:"A trailblazing driver who won an IndyCar race and raced in NASCAR.",series:"NASCAR"},{name:"Kyle Busch",clue:"A two-time Cup champion nicknamed Rowdy.",series:"NASCAR"},{name:"Bubba Wallace",clue:"A modern Cup driver who races the No. 23 Toyota.",series:"NASCAR"},{name:"Chase Elliott",clue:"The 2020 Cup champion, known to fans as NAPA Chase.",series:"NASCAR"},{name:"Joey Logano",clue:"Three-time Cup champion known as Sliced Bread early in his career.",series:"NASCAR"},{name:"Martin Truex Jr.",clue:"2017 Cup champion and road-course standout.",series:"NASCAR"},{name:"Kevin Harvick",clue:"2014 Cup champion who took over the No. 3 after Dale Earnhardt.",series:"NASCAR"},{name:"Denny Hamlin",clue:"A multiple-time Daytona 500 winner and long-time No. 11 driver.",series:"NASCAR"},{name:"Ryan Blaney",clue:"2023 Cup champion and driver of the No. 12.",series:"NASCAR"},{name:"William Byron",clue:"2024 Cup champion who drives the No. 24 for Hendrick Motorsports.",series:"NASCAR"},{name:"Kyle Larson",clue:"A versatile champion known for success on dirt and pavement.",series:"NASCAR"},{name:"Brad Keselowski",clue:"2012 Cup champion and co-owner of RFK Racing.",series:"NASCAR"},{name:"Rusty Wallace",clue:"1989 Cup champion and one of the sport's memorable voices.",series:"NASCAR"},{name:"Bobby Allison",clue:"Three-time champion and member of the Alabama Gang.",series:"NASCAR"},{name:"Cale Yarborough",clue:"The first driver to win three consecutive Cup championships.",series:"NASCAR"},{name:"Darrell Waltrip",clue:"Three-time champion famous for his colorful commentary.",series:"NASCAR"},{name:"David Pearson",clue:"A three-time champion with one of the best win percentages ever.",series:"NASCAR"},{name:"Bill Elliott",clue:"1988 champion once known as Million Dollar Bill.",series:"NASCAR"},{name:"Mark Martin",clue:"A legendary five-time runner-up in Cup championship standings.",series:"NASCAR"},
  {name:"Ayrton Senna",clue:"Three-time Brazilian world champion celebrated for wet-weather skill.",series:"F1"},{name:"Lewis Hamilton",clue:"Seven-time world champion and record-setting British driver.",series:"F1"},{name:"Michael Schumacher",clue:"German seven-time champion who dominated with Ferrari.",series:"F1"},{name:"Max Verstappen",clue:"Dutch world champion known for aggressive precision.",series:"F1"},{name:"Fernando Alonso",clue:"Two-time Spanish world champion with remarkable longevity.",series:"F1"},{name:"Sebastian Vettel",clue:"German four-time champion who won titles with Red Bull.",series:"F1"},{name:"Charles Leclerc",clue:"Monégasque Ferrari driver who grew up racing in Monaco.",series:"F1"},{name:"Lando Norris",clue:"British McLaren driver known for speed and a playful personality.",series:"F1"},{name:"Jackie Stewart",clue:"Three-time Scottish champion and influential safety advocate.",series:"F1"},{name:"Alain Prost",clue:"Four-time French champion nicknamed The Professor.",series:"F1"},
];
const tabs = [{name:"Home",icon:LayoutGrid},{name:"Photo challenge",icon:ScanLine},{name:"Garage",icon:CarFront},{name:"Schedule",icon:CalendarDays},{name:"Trackside AI",icon:Sparkles}];
const chooseDriver = (series: Series, previous?: string) => { const pool=drivers.filter((item)=>item.series===series&&item.name!==previous); return pool[Math.floor(Math.random()*pool.length)]; };

const Index = () => {
  const [active,setActive]=useState("Home");
  const [menuOpen,setMenuOpen]=useState(false);
  const [series,setSeries]=useState<Series>("NASCAR");
  const [driver,setDriver]=useState<Driver>(()=>chooseDriver("NASCAR"));
  const [photo,setPhoto]=useState("");
  const [guess,setGuess]=useState("");
  const [result,setResult]=useState("");
  const [garage,setGarage]=useState<string[]>(()=>JSON.parse(localStorage.getItem("trackside-garage")||"[]"));
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [chat,setChat]=useState("");
  const [chatError,setChatError]=useState("");
  const [sending,setSending]=useState(false);

  useEffect(()=>{
    let cancelled=false;
    setPhoto("");
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(driver.name)}`)
      .then((response)=>response.ok?response.json():Promise.reject())
      .then((data:{thumbnail?:{source?:string}})=>{if(!cancelled)setPhoto(data.thumbnail?.source||"");})
      .catch(()=>{if(!cancelled)setPhoto("");});
    return ()=>{cancelled=true;};
  },[driver]);

  const changeSeries=(next:Series)=>{setSeries(next);setDriver(chooseDriver(next));setResult("");};
  const submitGuess=(event:React.FormEvent)=>{
    event.preventDefault();
    if(guess.trim().toLowerCase()===driver.name.toLowerCase()){
      const updated=[...new Set([...garage,driver.name])];
      setGarage(updated);localStorage.setItem("trackside-garage",JSON.stringify(updated));
      setResult(`Correct! ${driver.name} has been added to your garage.`);
    }else setResult("Not quite — type the driver's full name and try again.");
    setGuess("");
  };
  const sendMessage=async(event:React.FormEvent)=>{
    event.preventDefault();const content=chat.trim();if(!content||sending)return;
    const next=[...messages,{role:"user" as const,content}];setMessages(next);setChat("");setChatError("");setSending(true);
    try{
      const response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.statusMessage||data.message||"Trackside couldn't reply. Please try again.");
      setMessages((current)=>[...current,{role:"assistant",content:data.reply}]);
    }catch(error){setChatError(error instanceof Error?error.message:"Trackside couldn't reply. Please try again.");}
    finally{setSending(false);}
  };
  const navigate=(tab:string)=>{setActive(tab);setMenuOpen(false);};

  return <div className="apex-app">
    <aside className={`sidebar ${menuOpen?"menu-open":""}`}>
      <a className="brand" href="#home" onClick={(event)=>{event.preventDefault();navigate("Home");}}><span className="brand-mark"><Flag size={23}/></span><span>TRACK<span className="brand-light">SIDE</span><small>THE RACING CLUBHOUSE</small></span></a>
      <div className="side-label">YOUR PADDOCK</div>
      {tabs.map(({name,icon:Icon})=><button key={name} className={`nav-item ${active===name?"selected":""}`} onClick={()=>navigate(name)}><Icon size={19}/>{name}{name==="Garage"&&<span className="nav-count">{garage.length}</span>}</button>)}
      <div className="sidebar-bottom"><div className="member-card"><div className="member-icon"><Sparkles size={19}/></div><b>Your racing co-pilot.</b><span>Every driver. Every story.</span></div><div className="profile"><div className="profile-avatar">R</div><div><b>Racing fan</b><span>{garage.length} drivers collected</span></div></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={()=>setMenuOpen((open)=>!open)}><Menu/></button><div className="top-intro">{active==="Home"?"Your all-access pass to motorsport":active}</div>{active==="Photo challenge"&&<div className="series-toggle"><button className={series==="NASCAR"?"active":""} onClick={()=>changeSeries("NASCAR")}>NASCAR</button><button className={series==="F1"?"active":""} onClick={()=>changeSeries("F1")}>F1 FORMULA 1</button></div>}</header>
      {active==="Home"&&<div className="empty-home" aria-label="Home"/>}
      {active==="Photo challenge"&&<div className="page-content tab-page"><div className="welcome-row"><div><div className="eyebrow"><span/> {series} PADDOCK</div><h1>Photo challenge</h1><p>Recognize the driver. Type their name to collect them.</p></div></div><section className="quiz-card standalone-card"><div className="quiz-top"><div><div className="eyebrow"><Sparkles size={14}/> DRIVER CHALLENGE · {series}</div><h2>Who is this <em>driver?</em></h2></div><button className="text-link" onClick={()=>{setDriver(chooseDriver(series,driver.name));setResult("");}}>NEXT DRIVER <ChevronRight size={15}/></button></div><div className={`driver-photo ${photo?"has-photo":""}`} style={photo?{backgroundImage:`linear-gradient(0deg,rgba(18,20,23,.82),transparent 65%),url("${photo}")`}:undefined}>{photo?<span className="photo-credit">REAL DRIVER PHOTO · WIKIPEDIA</span>:<div className="photo-loading"><Flag size={35}/><span>Loading a real {series} driver photo…</span><small>If images are blocked, try the next driver.</small></div>}<div className="photo-clue"><span>HINT</span><p>{driver.clue}</p></div></div><form className="guess-form" onSubmit={submitGuess}><input value={guess} onChange={(event)=>setGuess(event.target.value)} placeholder="Type the driver's full name..." aria-label="Type the driver's full name"/><button type="submit">SUBMIT GUESS <ChevronRight size={16}/></button></form>{result&&<div className={`answer-note ${result.startsWith("Correct")?"correct":""}`}>{result.startsWith("Correct")&&<Check size={15}/>} {result}</div>}<div className="quiz-foot"><span>Correct guesses are added to your Garage</span><span>{garage.length} COLLECTED</span></div></section></div>}
      {active==="Garage"&&<div className="page-content tab-page"><div className="welcome-row"><div><div className="eyebrow"><span/> YOUR COLLECTION</div><h1>Driver garage</h1><p>Your correctly guessed drivers, saved on this device.</p></div></div>{garage.length?<div className="collection-grid">{garage.map((name)=><article className="collection-card" key={name}><div className="driver-initial">{name.split(" ").map((part)=>part[0]).join("")}</div><div><b>{name}</b><span>{drivers.find((item)=>item.name===name)?.series||"MOTORSPORT"} · COLLECTED</span></div><Trophy size={18}/></article>)}</div>:<div className="empty-state"><CarFront size={36}/><h2>Your garage is waiting</h2><p>Guess a driver's full name in Photo Challenge to collect them here.</p><button className="watch-button" onClick={()=>navigate("Photo challenge")}>GO TO PHOTO CHALLENGE</button></div>}</div>}
      {active==="Schedule"&&<div className="page-content tab-page"><div className="welcome-row"><div><div className="eyebrow"><span/> RACE CALENDAR</div><h1>Race schedule</h1><p>Schedule provided by DD12 Fans.</p></div><a className="watch-button schedule-link" href={scheduleUrl} target="_blank" rel="noreferrer">OPEN SCHEDULE <ExternalLink size={15}/></a></div><section className="schedule-frame-wrap"><iframe className="schedule-frame" src={scheduleUrl} title="DD12 Fans race schedule" loading="lazy"/><div className="frame-fallback">If the schedule doesn't load inside the app, <a href={scheduleUrl} target="_blank" rel="noreferrer">open it in a new tab <ExternalLink size={13}/></a>.</div></section></div>}
      {active==="Trackside AI"&&<div className="page-content tab-page chat-page"><div className="welcome-row"><div><div className="eyebrow"><span/> YOUR RACING INTELLIGENCE</div><h1>Chat with <em>Trackside.</em></h1><p>Ask about NASCAR, Formula 1, drivers, race history, or strategy.</p></div></div><section className="ai-card full-chat"><div className="ai-heading"><div className="ai-icon"><Sparkles size={18}/></div><div><div className="eyebrow">CHATGPT-POWERED RACING ASSISTANT</div><h3>Trackside</h3></div><span className="online-status">READY TO CHAT</span></div><div className="full-chat-thread">{messages.length===0&&<div className="starter-message">Hi! I'm Trackside. Ask me anything about racing and I'll help you figure it out.</div>}{messages.map((message,index)=><div className={`chat-line ${message.role}`} key={`${index}-${message.role}`}><span>{message.role==="user"?"YOU":"TRACKSIDE"}</span><p>{message.content}</p></div>)}{sending&&<div className="chat-line assistant"><span>TRACKSIDE</span><p>Thinking…</p></div>}</div>{chatError&&<div className="chat-error">{chatError}{chatError.includes("API key")&&<span> The app owner needs to add an OpenAI API key to the server configuration.</span>}</div>}<form className="chat-form full-chat-form" onSubmit={sendMessage}><input value={chat} onChange={(event)=>setChat(event.target.value)} placeholder="Message Trackside..." disabled={sending}/><button aria-label="Send message" disabled={sending||!chat.trim()}><Send size={17}/></button></form><div className="ai-disclaimer">Trackside uses OpenAI to answer. Please don't share sensitive personal information.</div></section></div>}
    </main>
  </div>;
};
export default Index;
