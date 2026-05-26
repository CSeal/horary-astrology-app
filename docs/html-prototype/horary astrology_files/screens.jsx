/* global React, DesignCanvas, DCSection, DCArtboard */

// ─────────────────────────────────────────────────────────────
// Shared bits: status bar, tab bar, starfield
// ─────────────────────────────────────────────────────────────

function StatusBar({ time = "9:41" }) {
  return (
    <div className="status-bar">
      <span>{time}</span>
      <div className="icons">
        {/* signal */}
        <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
          <rect x="0"  y="7" width="3" height="4" rx="0.6" fill="#F0EEFF"/>
          <rect x="5"  y="5" width="3" height="6" rx="0.6" fill="#F0EEFF"/>
          <rect x="10" y="3" width="3" height="8" rx="0.6" fill="#F0EEFF"/>
          <rect x="15" y="0" width="3" height="11" rx="0.6" fill="#F0EEFF"/>
        </svg>
        {/* wifi */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <path d="M8.5 10.5 L10.5 8.5 A2.8 2.8 0 0 0 6.5 8.5 Z" fill="#F0EEFF"/>
          <path d="M3.3 5.3 A7.5 7.5 0 0 1 13.7 5.3" stroke="#F0EEFF" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          <path d="M0.7 2.7 A11 11 0 0 1 16.3 2.7" stroke="#F0EEFF" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        </svg>
        {/* battery */}
        <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="#F0EEFF" strokeOpacity="0.4"/>
          <rect x="2"   y="2"   width="19" height="8"  rx="1.5" fill="#F0EEFF"/>
          <rect x="24"  y="4"   width="2"  height="4"  rx="1" fill="#F0EEFF" fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

// pseudo-random but deterministic
function mulberry32(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Starfield({ seed = 1, count = 50 }) {
  const rng = React.useMemo(() => mulberry32(seed), [seed]);
  const stars = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const size = rng() < 0.7 ? 1 : 2;
      arr.push({
        top:  rng() * 100,
        left: rng() * 100,
        size,
        base: 0.1 + rng() * 0.4,
        dur:  (2 + rng() * 3).toFixed(2) + "s",
        delay: (rng() * 3).toFixed(2) + "s",
      });
    }
    return arr;
  }, [count, seed]);
  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} className="star" style={{
          top:    `${s.top}%`,
          left:   `${s.left}%`,
          width:  s.size + "px",
          height: s.size + "px",
          opacity: s.base,
          "--base": s.base,
          "--dur":  s.dur,
          animationDelay: s.delay,
        }}/>
      ))}
    </div>
  );
}

function TabBar({ active = "ask" }) {
  return (
    <div className="tab-bar">
      <div className={"tab" + (active === "ask" ? " active" : "")}>
        {/* sparkles */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3z"/>
          <path d="M19 14l.9 2.5L22 17.5l-2.1.9L19 21l-.9-2.6L16 17.5l2.1-1L19 14z"/>
          <path d="M5 14l.7 1.8L7.5 16.5l-1.8.7L5 19l-.7-1.8L2.5 16.5l1.8-.7L5 14z"/>
        </svg>
        <span>Ask</span>
      </div>
      <div className={"tab" + (active === "journal" ? " active" : "")}>
        {/* book-open */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2V4z"/>
          <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7V4z"/>
        </svg>
        <span>Journal</span>
      </div>
    </div>
  );
}

function HomeIndicator() { return <div className="home-indicator"/>; }

function NavHeader({ left, right, center }) {
  return (
    <div className="nav-header">
      <div>{left}</div>
      {center}
      <div>{right}</div>
    </div>
  );
}

const IconGear = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const IconShare = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5"  r="3"/><circle cx="6"  cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
  </svg>
);
const IconPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconAlertTri = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
    <line x1="12" y1="9"  x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconPencil = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Screens
// ─────────────────────────────────────────────────────────────

function ScreenOnboarding() {
  return (
    <div className="phone">
      <Starfield seed={1} count={60}/>
      <StatusBar/>
      <div className="onb">
        <div className="crest">✦</div>
        <h1>AstraSk</h1>
        <div className="tagline">Ask the stars.<br/>Get your answer.</div>
        <div className="features">
          <div className="feature"><span className="bullet">✦</span><span>Instant horary readings</span></div>
          <div className="feature"><span className="bullet">✦</span><span>Traditional William Lilly technique</span></div>
          <div className="feature"><span className="bullet">✦</span><span>Plain&#8209;language interpretations</span></div>
        </div>
        <button className="btn-gold">Get Started <span style={{marginLeft:4}}>→</span></button>
        <div className="footnote">Enable location for accurate chart casting</div>
      </div>
      <HomeIndicator/>
    </div>
  );
}

// Header used by Home variants
function HomeHeader() {
  return (
    <NavHeader
      left={<div className="app-name" style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:26}}>
        <span className="glyph" style={{color:"var(--accent-gold)"}}>✦</span>{" "}
        <span>AstraSk</span>
      </div>}
      right={<button className="nav-icon-btn"><IconGear/></button>}
    />
  );
}
HomeHeader = (() => {
  // override to render the gold glyph and name
  return function HomeHeader() {
    return (
      <div className="nav-header">
        <div className="app-name" style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:26, color:"var(--text-primary)"}}>
          <span style={{color:"var(--accent-gold)"}}>✦</span> AstraSk
        </div>
        <button className="nav-icon-btn"><IconGear/></button>
      </div>
    );
  };
})();

function LocationRow({ city = "London, United Kingdom", coords = "51.5074° N, 0.1278° W" }) {
  return (
    <div className="loc-row">
      <div className="pin"><IconPin/></div>
      <div>
        <div className="city">{city}</div>
        <div className="coords">{coords}</div>
      </div>
    </div>
  );
}

function ScreenHomeEmpty() {
  return (
    <div className="phone">
      <Starfield seed={2} count={50}/>
      <StatusBar/>
      <HomeHeader/>
      <div className="content">
        <div className="home-pad">
          <div>
            <div className="ask-label">Ask your question</div>
            <div className="ask-sub">Be sincere and specific</div>
          </div>
          <div>
            <div className="field" style={{minHeight: 140, color: "var(--text-disabled)"}}>
              Will I get the job offer this month?
            </div>
            <div className="char-counter">0 / 280</div>
          </div>
          <LocationRow/>
          <div style={{flex: 1}}/>
          <button className="btn-gold disabled">✦ Ask the Stars</button>
          <div className="questions-footer">Questions this month: 2 / 5</div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenHomeFilled() {
  return (
    <div className="phone">
      <Starfield seed={3} count={50}/>
      <StatusBar/>
      <HomeHeader/>
      <div className="content">
        <div className="home-pad">
          <div>
            <div className="ask-label">Ask your question</div>
            <div className="ask-sub">Be sincere and specific</div>
          </div>
          <div>
            <div className="field focused" style={{minHeight: 140}}>
              Will I get the promotion I applied for last week?
              <span style={{
                display:"inline-block", width:1, height:"1.1em",
                background:"var(--accent-gold)", marginLeft:2,
                verticalAlign:"text-bottom",
                animation:"caret-blink 1s steps(1) infinite",
              }}/>
            </div>
            <div className="char-counter">47 / 280</div>
          </div>
          <LocationRow/>
          <div style={{flex: 1}}/>
          <button className="btn-gold glowing">✦ Ask the Stars</button>
          <div className="questions-footer">Questions this month: 2 / 5</div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenLoading() {
  return (
    <div className="phone">
      <Starfield seed={4} count={70}/>
      <StatusBar/>
      <div className="content">
        <div className="loading-wrap">
          <div className="orbit">
            <div className="orbit-ellipse"/>
            <div className="orbit-planet"><span className="planet">♃</span></div>
            <div className="orbit-sun"><span>☉</span></div>
          </div>
          <div>
            <div className="loading-label">Casting your chart…</div>
            <div className="loading-sub">Reading the celestial map</div>
          </div>
          <div className="progress-track"><div className="progress-fill"/></div>
          <div style={{
            marginTop: 18, fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: 14, color: "var(--text-secondary)", textAlign: "center", maxWidth: 280, lineHeight: 1.5,
          }}>
            “Will I get the promotion I applied for last week?”
          </div>
        </div>
      </div>
      <HomeIndicator/>
    </div>
  );
}

function VerdictHeader() {
  return (
    <NavHeader
      left={<button className="nav-icon-btn"><IconArrowLeft/></button>}
      right={<button className="nav-icon-btn disabled"><IconShare/></button>}
    />
  );
}

function ConfidenceDots({ filled, tone }) {
  return (
    <div className="confidence-dots">
      {[0,1,2,3,4].map(i => (
        <span key={i} className={"dot" + (i < filled ? " fill " + tone : "")}/>
      ))}
    </div>
  );
}

function ScreenVerdictYes() {
  return (
    <div className="phone">
      <Starfield seed={5} count={45}/>
      <StatusBar/>
      <VerdictHeader/>
      <div className="content">
        <div style={{padding:"4px 20px 20px", overflow:"hidden"}}>
          <div className="verdict-question">“Will I get the promotion I applied for last week?”</div>

          <div className="verdict-card yes">
            <div className="verdict-line">
              <span className="gold-star">✦</span>
              <span className="verdict-text yes">YES</span>
              <span className="gold-star">✦</span>
            </div>
            <ConfidenceDots filled={3} tone="yes"/>
            <div className="confidence-label">CONFIDENCE: HIGH</div>
          </div>

          <div className="section-head">
            <span className="label">The Planets Say</span>
            <span className="rule"/>
          </div>

          <div className="sig-row">
            <span className="glyph">♃</span>
            <div className="body">
              <div className="name">Jupiter</div>
              <div className="where">Sagittarius · House 1</div>
            </div>
            <div className="role">You</div>
          </div>
          <div className="sig-row">
            <span className="glyph">☉</span>
            <div className="body">
              <div className="name">Sun</div>
              <div className="where">Aries · House 10</div>
            </div>
            <div className="role">Your goal</div>
          </div>

          <div style={{display:"flex", flexWrap:"wrap", gap: 8, marginTop: 12}}>
            <span className="aspect-chip good">Applying trine <IconCheck/></span>
          </div>

          <div className="moon-row good">
            <span className="glyph">☽</span>
            <span>Moon · not void-of-course</span>
            <span className="check"><IconCheck/></span>
          </div>

          <div className="summary">
            The situation is moving strongly in your favor. Jupiter, your significator, applies by trine to the Sun in the tenth house of career — a powerful indicator of professional success.
          </div>

          <div className="meta-row">May 25, 2026 · 14:32 · London</div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenVerdictNo() {
  return (
    <div className="phone">
      <Starfield seed={6} count={45}/>
      <StatusBar/>
      <VerdictHeader/>
      <div className="content">
        <div style={{padding:"4px 20px 20px", overflow:"hidden"}}>
          <div className="verdict-question">“Will she call me this week?”</div>

          <div className="verdict-card no">
            <div className="verdict-line">
              <span className="gold-star">✦</span>
              <span className="verdict-text no">NO</span>
              <span className="gold-star">✦</span>
            </div>
            <ConfidenceDots filled={2} tone="no"/>
            <div className="confidence-label">CONFIDENCE: MEDIUM</div>
          </div>

          <div className="section-head">
            <span className="label">The Planets Say</span>
            <span className="rule"/>
          </div>

          <div className="sig-row">
            <span className="glyph">♀</span>
            <div className="body">
              <div className="name">Venus</div>
              <div className="where">Virgo · House 6</div>
            </div>
            <div className="role">You</div>
          </div>
          <div className="sig-row">
            <span className="glyph">♂</span>
            <div className="body">
              <div className="name">Mars</div>
              <div className="where">Pisces · House 12</div>
            </div>
            <div className="role">The other</div>
          </div>

          <div style={{display:"flex", flexWrap:"wrap", gap: 8, marginTop: 12}}>
            <span className="aspect-chip bad">Separating opposition ✗</span>
          </div>

          <div className="moon-row warn">
            <span className="glyph">☽</span>
            <span>Moon · Void&#8209;of&#8209;course</span>
            <span className="check"><IconAlertTri/></span>
          </div>

          <div className="summary">
            The celestial indicators suggest this matter will not proceed as hoped. Your significator and the quesited are separating — the opportunity has already passed its peak.
          </div>

          <div className="meta-row">May 22, 2026 · 09:14 · London</div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenVerdictMaybe() {
  return (
    <div className="phone">
      <Starfield seed={7} count={45}/>
      <StatusBar/>
      <VerdictHeader/>
      <div className="content">
        <div style={{padding:"4px 20px 20px", overflow:"hidden"}}>
          <div className="verdict-question">“Is this the right investment to make?”</div>

          <div className="verdict-card maybe">
            <div className="verdict-line">
              <span className="gold-star">✦</span>
              <span className="verdict-text maybe">MAYBE</span>
              <span className="gold-star">✦</span>
            </div>
            <ConfidenceDots filled={1} tone="maybe"/>
            <div className="confidence-label">CONFIDENCE: LOW</div>
          </div>

          <div className="section-head">
            <span className="label">The Planets Say</span>
            <span className="rule"/>
          </div>

          <div className="sig-row">
            <span className="glyph">☿</span>
            <div className="body">
              <div className="name">Mercury</div>
              <div className="where">Gemini · House 2</div>
            </div>
            <div className="role">You</div>
          </div>
          <div className="sig-row">
            <span className="glyph">♄</span>
            <div className="body">
              <div className="name">Saturn</div>
              <div className="where">Capricorn · House 8</div>
            </div>
            <div className="role">The matter</div>
          </div>

          <div style={{display:"flex", flexWrap:"wrap", gap: 8, marginTop: 12}}>
            <span className="aspect-chip warn">Mutual reception ~</span>
          </div>

          <div className="moon-row warn">
            <span className="glyph">☽</span>
            <span>Moon · in late degrees</span>
            <span className="check"><IconAlertTri/></span>
          </div>

          <div className="summary">
            The chart shows favourable connection but uncertain timing. Mercury and Saturn exchange dignity — there is potential here, but conditions are still forming. Proceed with caution and observe how circumstances develop.
          </div>

          <div className="meta-row">May 20, 2026 · 19:48 · London</div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenVerdictUnclear() {
  return (
    <div className="phone">
      <Starfield seed={8} count={45}/>
      <StatusBar/>
      <VerdictHeader/>
      <div className="content">
        <div style={{padding:"4px 20px 20px", overflow:"hidden"}}>
          <div className="verdict-question">“Should I sell the apartment now?”</div>

          <div className="verdict-card unclear">
            <div className="radical-warning">
              <span className="icon"><IconAlertTri/></span>
              <div>
                <div className="title">Chart may not be radical</div>
                <div className="body">Ascendant at 2° (too early). Early degrees suggest the question may not yet be ready to be answered. Consider asking again when the time is right.</div>
              </div>
            </div>
            <div className="verdict-line">
              <span className="gold-star" style={{opacity:0.5}}>✦</span>
              <span className="verdict-text unclear">UNCLEAR</span>
              <span className="gold-star" style={{opacity:0.5}}>✦</span>
            </div>
            <ConfidenceDots filled={0} tone="unclear"/>
            <div className="confidence-label">CONFIDENCE: —</div>
          </div>

          <div className="section-head">
            <span className="label">The Planets Say</span>
            <span className="rule"/>
          </div>

          <div className="sig-row" style={{opacity:0.7}}>
            <span className="glyph" style={{color:"var(--unclear)"}}>♀</span>
            <div className="body">
              <div className="name">Venus</div>
              <div className="where">Taurus · House 1 · 2°</div>
            </div>
            <div className="role">You</div>
          </div>

          <div style={{display:"flex", flexWrap:"wrap", gap: 8, marginTop: 12}}>
            <span className="aspect-chip muted">No exact aspect ·</span>
          </div>

          <div className="summary" style={{color:"var(--text-secondary)"}}>
            The chart is not yet ripe for judgement. The Ascendant falls in the earliest degrees of its sign, traditionally a sign that the matter is premature. Reflect, then ask again when the question feels truly urgent.
          </div>

          <div className="meta-row">May 25, 2026 · 14:32 · London</div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenJournal() {
  return (
    <div className="phone">
      <Starfield seed={9} count={40}/>
      <StatusBar/>
      <div className="page-title">Journal</div>
      <div className="content">
        <div style={{padding: "0 20px 20px"}}>
          <div className="month-header">May 2026</div>

          <div className="journal-card yes">
            <div className="top">
              <span className="badge yes">YES</span>
              <span style={{flex:1}}/>
              <span style={{color:"var(--text-disabled)", fontSize:12}}>↗</span>
            </div>
            <div className="question">Will I get the promotion I applied for last week?</div>
            <div className="meta">
              <span>May 25</span><span className="dot-sep">·</span>
              <span>HIGH confidence</span>
            </div>
          </div>

          <div className="journal-card no">
            <div className="top">
              <span className="badge no">NO</span>
              <span style={{flex:1}}/>
              <span style={{color:"var(--text-disabled)", fontSize:12}}>↗</span>
            </div>
            <div className="question">Will she call me this week?</div>
            <div className="meta">
              <span>May 22</span><span className="dot-sep">·</span>
              <span>MEDIUM confidence</span>
            </div>
          </div>

          <div className="journal-card maybe">
            <div className="top">
              <span className="badge maybe">MAYBE</span>
              <span style={{flex:1}}/>
              <span style={{color:"var(--text-disabled)", fontSize:12}}>↗</span>
            </div>
            <div className="question">Is this the right investment to make for my savings?</div>
            <div className="meta">
              <span>May 20</span><span className="dot-sep">·</span>
              <span>LOW confidence</span>
            </div>
          </div>

          <div className="month-header" style={{marginTop:24}}>April 2026</div>

          <div className="journal-card yes">
            <div className="top">
              <span className="badge yes">YES</span>
              <span style={{flex:1}}/>
              <span style={{color:"var(--text-disabled)", fontSize:12}}>↗</span>
            </div>
            <div className="question">Should I accept the offer from Berlin?</div>
            <div className="meta">
              <span>Apr 30</span><span className="dot-sep">·</span>
              <span>HIGH confidence</span>
            </div>
          </div>

          <div className="swipe-hint">← swipe to delete</div>
        </div>
      </div>
      <TabBar active="journal"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenJournalEmpty() {
  return (
    <div className="phone">
      <Starfield seed={10} count={40}/>
      <StatusBar/>
      <div className="page-title">Journal</div>
      <div className="content">
        <div className="empty-state">
          <div className="big-moon">☽</div>
          <h2>No readings yet.</h2>
          <p>Ask your first question to begin your journal.</p>
          <button className="btn-gold" style={{maxWidth: 260}}>Ask a Question →</button>
        </div>
      </div>
      <TabBar active="journal"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenSettings() {
  return (
    <div className="phone">
      <Starfield seed={11} count={30}/>
      <StatusBar/>
      <div className="page-title" style={{display:"flex", alignItems:"center", gap:12}}>
        <button className="nav-icon-btn" style={{width:32, height:32, marginLeft:-6}}><IconArrowLeft/></button>
        <span>Settings</span>
      </div>
      <div className="content">
        <div className="settings-pad">

          <div className="set-group">
            <div className="label">Language</div>
            <div className="set-card">
              <div className="set-row">
                <div className="key">Language</div>
                <div className="lang-pill">English <span style={{fontSize:11}}>▾</span></div>
              </div>
            </div>
          </div>

          <div className="set-group">
            <div className="label">Location</div>
            <div className="set-card">
              <div className="set-row">
                <div className="left">
                  <div className="key">Detected timezone</div>
                  <div className="sub">Used for chart accuracy</div>
                </div>
                <div className="value" style={{fontFamily:"var(--font-mono)", fontSize:13}}>Europe/London</div>
              </div>
            </div>
          </div>

          <div className="set-group">
            <div className="label">Usage</div>
            <div className="set-card">
              <div className="key">Questions this month</div>
              <div className="progress-bar">
                <div className="cell fill"/><div className="cell fill"/>
                <div className="cell fill"/><div className="cell fill"/>
                <div className="cell"/>
              </div>
              <div className="sub" style={{fontFamily:"var(--font-mono)"}}>4 / 5 · Resets June 1</div>
            </div>
          </div>

          <div className="set-group">
            <div className="label">API Key</div>
            <div className="set-card">
              <div className="set-row">
                <div className="api-mask">●●●●●●●●●●●●●●●●</div>
                <button className="nav-icon-btn" style={{color:"var(--accent-gold)", width:32, height:32}}><IconPencil/></button>
              </div>
              <div className="sub" style={{marginTop:8}}>Using: personal key</div>
            </div>
          </div>

        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenErrorNoInternet() {
  return (
    <div className="phone">
      <Starfield seed={12} count={50}/>
      <StatusBar/>
      <HomeHeader/>
      <div className="banner error">
        <span className="led"/>
        <div>
          <div style={{fontWeight:500}}>No connection</div>
          <div style={{fontSize:11, color:"var(--text-secondary)", marginTop:2}}>Check your internet</div>
        </div>
      </div>
      <div className="content">
        <div className="home-pad">
          <div>
            <div className="ask-label">Ask your question</div>
            <div className="ask-sub">Be sincere and specific</div>
          </div>
          <div>
            <div className="field" style={{minHeight: 140, color: "var(--text-disabled)"}}>
              Will I get the job offer this month?
            </div>
            <div className="char-counter">0 / 280</div>
          </div>
          <LocationRow/>
          <div style={{flex: 1}}/>
          <button className="btn-gold disabled">✦ Ask the Stars</button>
          <div className="questions-footer">Questions this month: 2 / 5</div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenErrorLocation() {
  return (
    <div className="phone">
      <Starfield seed={13} count={50}/>
      <StatusBar/>
      <HomeHeader/>
      <div className="content">
        <div className="home-pad">
          <div>
            <div className="ask-label">Ask your question</div>
            <div className="ask-sub">Be sincere and specific</div>
          </div>
          <div>
            <div className="field" style={{minHeight: 140, color: "var(--text-disabled)"}}>
              Will I get the job offer this month?
            </div>
            <div className="char-counter">0 / 280</div>
          </div>

          <div className="loc-warn">
            <div className="pin"><IconAlertTri/></div>
            <div>
              <div className="title">Location unavailable</div>
              <a className="link" href="#">Grant permission in Settings</a>
            </div>
          </div>

          <div style={{flex: 1}}/>
          <button className="btn-gold disabled">✦ Ask the Stars</button>
          <div className="questions-footer">Questions this month: 2 / 5</div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

function ScreenFreeLimit() {
  return (
    <div className="phone">
      <Starfield seed={14} count={50}/>
      <StatusBar/>
      <HomeHeader/>
      <div className="content">
        <div className="home-pad" style={{filter:"brightness(0.6)"}}>
          <div>
            <div className="ask-label">Ask your question</div>
            <div className="ask-sub">Be sincere and specific</div>
          </div>
          <div>
            <div className="field" style={{minHeight: 140}}>
              Will I find a new flat before the summer?
            </div>
            <div className="char-counter">42 / 280</div>
          </div>
          <LocationRow/>
          <div style={{flex: 1}}/>
          <button className="btn-gold disabled">✦ Ask the Stars</button>
          <div className="questions-footer">Questions this month: 5 / 5</div>
        </div>
      </div>
      <TabBar active="ask"/>

      {/* overlay */}
      <div className="scrim"/>
      <div className="sheet">
        <div className="crest">✦</div>
        <h2>You've used all 5 free<br/>questions this month.</h2>
        <p>Unlimited access is coming soon. Check back next month or watch this space for subscription options.</p>
        <div className="reset-line">Questions reset: June 1, 2026</div>
        <button className="btn-ghost">Close</button>
        <div className="footer-line">Questions this month: 5 / 5</div>
      </div>

      <HomeIndicator/>
    </div>
  );
}

// Export shared components and phase-1 screens to window so screens-phase2.jsx
// (which has its own Babel scope) can use them.
Object.assign(window, {
  // shared
  StatusBar, Starfield, TabBar, HomeIndicator, NavHeader, HomeHeader,
  LocationRow, ConfidenceDots,
  // icons
  IconGear, IconArrowLeft, IconShare, IconPin, IconCheck, IconAlertTri, IconPencil,
  // phase 1 screens
  ScreenOnboarding, ScreenHomeEmpty, ScreenHomeFilled, ScreenLoading,
  ScreenVerdictYes, ScreenVerdictNo, ScreenVerdictMaybe, ScreenVerdictUnclear,
  ScreenJournal, ScreenJournalEmpty, ScreenSettings,
  ScreenErrorNoInternet, ScreenErrorLocation, ScreenFreeLimit,
});
