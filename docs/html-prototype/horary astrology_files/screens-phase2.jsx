/* global React */

// ─────────────────────────────────────────────────────────────
// Chart wheel SVG (horary chart, Aries on Ascendant convention
// for illustration only — real charts use cusps from API)
// ─────────────────────────────────────────────────────────────

const ZODIAC = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const ZODIAC_NAMES = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

function polar(cx, cy, r, degFromEast) {
  // 0° = east (3 o'clock); positive deg goes counter-clockwise (astrological)
  const rad = -degFromEast * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function ChartWheel() {
  const size = 340;
  const cx = size / 2, cy = size / 2;
  const rOuter = 165;
  const rSign  = 138;     // inner edge of zodiac ring
  const rHouseRing = 110; // outer edge of house ring
  const rHouseInner = 86;
  const rPlanetRing = 70; // planets sit here
  const rAspectsR  = 64;

  // For demo: Ascendant at 9 o'clock (180° east) — equivalent to traditional left.
  // We rotate so the wheel feels familiar.
  const asc = 180;

  // House cusps every 30° starting at ASC
  const houseCusps = [];
  for (let i = 0; i < 12; i++) houseCusps.push(asc + i * 30);

  // Demo planets at specific zodiac longitudes (deg from 0° Aries, CCW)
  const planets = [
    { g: "♃", color: "#F5C842", lng: 250, name: "Jupiter" },          // querent
    { g: "☉", color: "#F5C842", lng: 18,  name: "Sun" },              // quesited
    { g: "☽", color: "#8B5CF6", lng: 102, name: "Moon" },
    { g: "♀", color: "#8B5CF6", lng: 64,  name: "Venus" },
    { g: "☿", color: "#8B5CF6", lng: 28,  name: "Mercury" },
    { g: "♂", color: "#8B5CF6", lng: 320, name: "Mars" },
    { g: "♄", color: "#8B5CF6", lng: 215, name: "Saturn" },
  ];

  // Aspects to draw between significators
  const aspects = [
    { a: 250, b: 18,  color: "#22D3A4" }, // Jupiter trine Sun
    { a: 102, b: 250, color: "#60A5FA" }, // Moon sextile Jupiter
    { a: 320, b: 64,  color: "#F87171" }, // Mars square Venus
  ];

  // For visual layout we map astrological deg → svg deg.
  // Astro 0° (Aries) appears at right. CCW increasing.
  // polar() uses CCW from east already, so deg passes straight through.

  return (
    <svg viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cw-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#1C1940" stopOpacity="0.9"/>
          <stop offset="55%" stopColor="#0A091F" stopOpacity="1"/>
          <stop offset="100%" stopColor="#070714" stopOpacity="1"/>
        </radialGradient>
      </defs>

      {/* background */}
      <circle cx={cx} cy={cy} r={rOuter} fill="url(#cw-glow)" stroke="rgba(245,200,66,0.25)" strokeWidth="1"/>

      {/* zodiac ring divisions */}
      {Array.from({length: 12}).map((_, i) => {
        const deg = i * 30;
        const [x1, y1] = polar(cx, cy, rSign, deg);
        const [x2, y2] = polar(cx, cy, rOuter, deg);
        return <line key={`zd-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(245,200,66,0.18)" strokeWidth="1"/>;
      })}
      {/* zodiac glyphs */}
      {ZODIAC.map((g, i) => {
        const deg = i * 30 + 15;
        const [x, y] = polar(cx, cy, (rSign + rOuter) / 2, deg);
        return (
          <text key={`zg-${i}`} x={x} y={y} fill="#F5C842" fontSize="16" textAnchor="middle"
                dominantBaseline="central" fontFamily="serif">{g}</text>
        );
      })}

      {/* house ring boundary */}
      <circle cx={cx} cy={cy} r={rSign} fill="none" stroke="rgba(240,238,255,0.08)" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r={rHouseRing} fill="none" stroke="rgba(240,238,255,0.08)" strokeWidth="1"/>

      {/* house cusps */}
      {houseCusps.map((deg, i) => {
        const isAngular = i % 3 === 0;
        const [x1, y1] = polar(cx, cy, rAspectsR, deg);
        const [x2, y2] = polar(cx, cy, rSign, deg);
        return (
          <line key={`hc-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isAngular ? "rgba(245,200,66,0.45)" : "rgba(240,238,255,0.10)"}
                strokeWidth={isAngular ? 1.2 : 0.8}/>
        );
      })}

      {/* house numbers */}
      {houseCusps.map((deg, i) => {
        const mid = deg + 15;
        const [x, y] = polar(cx, cy, (rHouseInner + rHouseRing) / 2, mid);
        return (
          <text key={`hn-${i}`} x={x} y={y} fill="#9B93B8" fontSize="9" textAnchor="middle"
                dominantBaseline="central" fontFamily="ui-monospace,SFMono-Regular,monospace">{i + 1}</text>
        );
      })}

      {/* aspect lines */}
      {aspects.map((asp, i) => {
        const [x1, y1] = polar(cx, cy, rAspectsR, asp.a);
        const [x2, y2] = polar(cx, cy, rAspectsR, asp.b);
        return <line key={`asp-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                     stroke={asp.color} strokeWidth="1.3" opacity="0.7"/>;
      })}

      {/* aspect inner circle */}
      <circle cx={cx} cy={cy} r={rAspectsR} fill="none" stroke="rgba(240,238,255,0.08)" strokeWidth="1"/>

      {/* planets */}
      {planets.map((p, i) => {
        const [x, y] = polar(cx, cy, rPlanetRing, p.lng);
        return (
          <g key={`pl-${i}`}>
            <circle cx={x} cy={y} r="12" fill="#0A091F" stroke={p.color} strokeWidth="1"/>
            <text x={x} y={y + 0.5} fill={p.color} fontSize="14" textAnchor="middle"
                  dominantBaseline="central" fontFamily="serif">{p.g}</text>
          </g>
        );
      })}

      {/* ASC marker — arrow at 9 o'clock (180°) */}
      <g>
        {(() => {
          const [x, y] = polar(cx, cy, rOuter + 4, asc);
          const [xi, yi] = polar(cx, cy, rOuter - 6, asc);
          return (
            <g>
              <line x1={x} y1={y} x2={xi} y2={yi} stroke="#F5C842" strokeWidth="2"/>
              <text x={x - 14} y={y + 4} fill="#F5C842" fontSize="10" fontWeight="600" textAnchor="end">ASC</text>
            </g>
          );
        })()}
      </g>

      {/* center dot */}
      <circle cx={cx} cy={cy} r="3" fill="#F5C842"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 15 — Chart Wheel
// ─────────────────────────────────────────────────────────────
function ScreenChartWheel() {
  return (
    <div className="phone">
      <Starfield seed={15} count={45}/>
      <StatusBar/>
      <NavHeader
        left={<button className="nav-icon-btn"><IconArrowLeft/></button>}
        center={<div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:20, color:"var(--text-primary)"}}>Chart Wheel</div>}
        right={<button className="nav-icon-btn disabled"><IconShare/></button>}
      />
      <div className="content">
        <div style={{padding:"0 20px 12px"}}>
          <div className="verdict-question" style={{marginBottom: 10, fontSize: 14}}>
            “Will I get the promotion I applied for last week?”
          </div>
        </div>
        <div className="chart-wheel-wrap">
          <div className="chart-wheel"><ChartWheel/></div>

          <div className="legend-row">
            <span className="item"><span className="swatch" style={{background:"#22D3A4"}}/>Trine</span>
            <span className="item"><span className="swatch" style={{background:"#F87171"}}/>Square</span>
            <span className="item"><span className="swatch" style={{background:"#60A5FA"}}/>Sextile</span>
            <span className="item"><span className="swatch" style={{background:"#fb923c"}}/>Opposition</span>
            <span className="item"><span className="swatch" style={{background:"#F5C842"}}/>Conjunction</span>
          </div>

          <div style={{
            marginTop: 14, padding: "12px 16px",
            background: "var(--bg-card)", borderRadius: 12, width: "100%",
            display: "flex", flexWrap: "wrap", gap: "8px 16px",
            justifyContent: "center", fontSize: 12, color: "var(--text-secondary)",
          }}>
            <span><span style={{color:"#F5C842", fontSize:14}}>♃</span> Jupiter · Sag · H1</span>
            <span><span style={{color:"#F5C842", fontSize:14}}>☉</span> Sun · Aries · H10</span>
            <span><span style={{color:"#8B5CF6", fontSize:14}}>☽</span> Moon · Cancer · H4</span>
            <span><span style={{color:"#8B5CF6", fontSize:14}}>♀</span> Venus · Tau · H2</span>
            <span><span style={{color:"#8B5CF6", fontSize:14}}>☿</span> Mercury · Aries · H10</span>
            <span><span style={{color:"#8B5CF6", fontSize:14}}>♂</span> Mars · Aqu · H8</span>
            <span><span style={{color:"#8B5CF6", fontSize:14}}>♄</span> Saturn · Sco · H12</span>
          </div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 16 — Aspects / Technical Breakdown
// ─────────────────────────────────────────────────────────────
function ScreenAspects() {
  return (
    <div className="phone">
      <Starfield seed={16} count={40}/>
      <StatusBar/>
      <NavHeader
        left={<button className="nav-icon-btn"><IconArrowLeft/></button>}
        center={<div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:20, color:"var(--text-primary)"}}>Technical Detail</div>}
        right={<button className="nav-icon-btn disabled"><IconShare/></button>}
      />
      <div className="content">
        <div className="tab-row">
          <div className="tab-pill">Summary</div>
          <div className="tab-pill active">Aspects</div>
          <div className="tab-pill">Dignities</div>
        </div>

        <div style={{padding:"0 20px 20px"}}>
          <div className="data-table">
            <div className="head">
              <span>Planet</span><span>Sign</span><span>H</span><span>Dignity</span><span>Speed</span>
            </div>
            <div className="row highlight">
              <span><span className="glyph">♃</span>Jupiter</span>
              <span>Sagittarius</span>
              <span>1</span>
              <span><span className="dignity-badge domicile">DOM</span></span>
              <span className="dim">+0.12</span>
            </div>
            <div className="row highlight">
              <span><span className="glyph">☉</span>Sun</span>
              <span>Aries</span>
              <span>10</span>
              <span><span className="dignity-badge exalt">EXA</span></span>
              <span className="dim">+0.98</span>
            </div>
            <div className="row">
              <span><span className="glyph">☽</span>Moon</span>
              <span>Cancer</span>
              <span>4</span>
              <span><span className="dignity-badge domicile">DOM</span></span>
              <span className="dim">+13.2</span>
            </div>
            <div className="row">
              <span><span className="glyph">♀</span>Venus</span>
              <span>Taurus</span>
              <span>2</span>
              <span><span className="dignity-badge domicile">DOM</span></span>
              <span className="dim">+1.04</span>
            </div>
            <div className="row">
              <span><span className="glyph">☿</span>Mercury</span>
              <span>Aries</span>
              <span>10</span>
              <span><span className="dignity-badge neutral">—</span></span>
              <span className="dim">+1.31</span>
            </div>
            <div className="row">
              <span><span className="glyph">♂</span>Mars</span>
              <span>Pisces</span>
              <span>8</span>
              <span><span className="dignity-badge fall">FALL</span></span>
              <span className="dim">+0.61</span>
            </div>
            <div className="row">
              <span><span className="glyph">♄</span>Saturn</span>
              <span>Scorpio</span>
              <span>12</span>
              <span><span className="dignity-badge neutral">—</span></span>
              <span className="dim">+0.08</span>
            </div>
          </div>

          <div className="section-head">
            <span className="label">Aspect Grid</span><span className="rule"/>
          </div>

          <div className="aspect-matrix">
            <div className="cell header"/>
            <div className="cell header">♃</div>
            <div className="cell header">☉</div>
            <div className="cell header">☽</div>
            <div className="cell header">♀</div>
            <div className="cell header">♂</div>
            <div className="cell header">♄</div>

            <div className="cell header">♃</div>
            <div className="cell diag">—</div>
            <div className="cell trine">△</div>
            <div className="cell sextile">⚹</div>
            <div className="cell"/>
            <div className="cell square">□</div>
            <div className="cell opp">☍</div>

            <div className="cell header">☉</div>
            <div className="cell trine">△</div>
            <div className="cell diag">—</div>
            <div className="cell"/>
            <div className="cell conj">☌</div>
            <div className="cell"/>
            <div className="cell"/>

            <div className="cell header">☽</div>
            <div className="cell sextile">⚹</div>
            <div className="cell"/>
            <div className="cell diag">—</div>
            <div className="cell trine">△</div>
            <div className="cell"/>
            <div className="cell"/>

            <div className="cell header">♀</div>
            <div className="cell"/>
            <div className="cell conj">☌</div>
            <div className="cell trine">△</div>
            <div className="cell diag">—</div>
            <div className="cell square">□</div>
            <div className="cell"/>

            <div className="cell header">♂</div>
            <div className="cell square">□</div>
            <div className="cell"/>
            <div className="cell"/>
            <div className="cell square">□</div>
            <div className="cell diag">—</div>
            <div className="cell sextile">⚹</div>

            <div className="cell header">♄</div>
            <div className="cell opp">☍</div>
            <div className="cell"/>
            <div className="cell"/>
            <div className="cell"/>
            <div className="cell sextile">⚹</div>
            <div className="cell diag">—</div>
          </div>

          <div className="info-card">
            <span className="icon"><IconAlertTri/></span>
            <div>
              <div className="title">Moon · Not void-of-course</div>
              <div className="body">
                The Moon, in Cancer at 14°, will perfect a trine to Venus before leaving its sign. Traditionally, this indicates the matter has momentum and will resolve.
              </div>
            </div>
          </div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 17 — Paywall
// ─────────────────────────────────────────────────────────────
function ScreenPaywall() {
  return (
    <div className="phone">
      <Starfield seed={17} count={70}/>
      <StatusBar/>
      <NavHeader
        left={<button className="nav-icon-btn"><IconArrowLeft/></button>}
        right={<button className="nav-icon-btn" style={{fontSize:18, color:"var(--text-secondary)"}}>×</button>}
      />
      <div className="content">
        <div className="paywall">
          <div className="crest">✦</div>
          <h1>AstraSk Unlimited</h1>
          <div className="sub">Unlock the full art of horary</div>

          <div className="benefits">
            <div className="benefit"><span className="check"><IconCheck/></span><span>Unlimited questions, every month</span></div>
            <div className="benefit"><span className="check"><IconCheck/></span><span>Full chart wheel visualization</span></div>
            <div className="benefit"><span className="check"><IconCheck/></span><span>Technical aspects breakdown</span></div>
            <div className="benefit"><span className="check"><IconCheck/></span><span>Priority support</span></div>
          </div>

          <div className="price">$4.99<span className="per">/ month</span></div>
          <div className="cancel">Cancel anytime</div>

          <button className="btn-gold glowing">Start Unlimited Access</button>
          <button className="btn-ghost" style={{marginTop:10}}>Restore Purchases</button>

          <div className="terms">
            By continuing you agree to the Terms of Use and Privacy Policy.
            Subscription auto-renews monthly unless cancelled at least 24 hours before the end of the current period.
          </div>
        </div>
      </div>
      <HomeIndicator/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 18 — Share Result Card
// ─────────────────────────────────────────────────────────────
function ScreenShare() {
  return (
    <div className="phone">
      <Starfield seed={18} count={40}/>
      <StatusBar/>
      <NavHeader
        left={<button className="nav-icon-btn"><IconArrowLeft/></button>}
        center={<div style={{fontWeight:600, fontSize:17, color:"var(--text-primary)"}}>Share Reading</div>}
        right={<span style={{width:36}}/>}
      />
      <div className="content">
        <div className="share-stage">
          <div className="share-card">
            <div className="app-name"><span className="glyph">✦</span> AstraSk</div>

            <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
              <div className="big-verdict">YES</div>
              <div className="question">“Will I get the promotion I applied for last week?”</div>
              <div className="aspect">♃ Jupiter <span style={{color:"#22D3A4"}}>△</span> ☉ Sun</div>
            </div>

            <div className="watermark">astrasK.app</div>
          </div>

          <div className="share-row">
            <button className="share-btn"><span className="ico" style={{color:"#E1306C"}}>◧</span>Instagram</button>
            <button className="share-btn"><span className="ico" style={{color:"#25D366"}}>◷</span>WhatsApp</button>
            <button className="share-btn"><span className="ico">⧉</span>Copy</button>
            <button className="share-btn"><span className="ico">⋯</span>More</button>
          </div>
        </div>
      </div>
      <HomeIndicator/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 19 — Push Notification Opt-in
// ─────────────────────────────────────────────────────────────
function ScreenPushOptin() {
  return (
    <div className="phone">
      <Starfield seed={19} count={40}/>
      <StatusBar/>
      <HomeHeader/>
      <div className="content">
        <div className="home-pad" style={{filter:"brightness(0.55)"}}>
          <div>
            <div className="ask-label">Ask your question</div>
            <div className="ask-sub">Be sincere and specific</div>
          </div>
          <div className="field" style={{minHeight: 120, color: "var(--text-disabled)"}}>
            Will I get the job offer this month?
          </div>
          <LocationRow/>
          <div style={{flex:1}}/>
          <button className="btn-gold disabled">✦ Ask the Stars</button>
        </div>
      </div>
      <TabBar active="ask"/>

      <div className="scrim"/>
      <div style={{
        position:"absolute", inset:0, display:"flex",
        alignItems:"center", justifyContent:"center", zIndex:22, padding: 24,
      }}>
        <div className="push-card">
          <div className="bell">🔔</div>
          <h2>Stay connected<br/>to the stars</h2>
          <p>Get gentle reminders to check in with your horary journal and reflect on past readings.</p>
          <button className="btn-gold glowing">Allow Notifications</button>
          <button className="btn-ghost" style={{marginTop:10}}>Not Now</button>
        </div>
      </div>

      <HomeIndicator/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 20 — Practitioner Mode: Full Radicality
// ─────────────────────────────────────────────────────────────
function ScreenPractitioner() {
  return (
    <div className="phone">
      <Starfield seed={20} count={35}/>
      <StatusBar/>
      <NavHeader
        left={<button className="nav-icon-btn"><IconArrowLeft/></button>}
        center={<div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:20, color:"var(--text-primary)"}}>Practitioner</div>}
        right={<button className="nav-icon-btn disabled"><IconShare/></button>}
      />
      <div className="content">
        <div style={{padding:"4px 20px 20px"}}>
          <div className="verdict-card yes" style={{padding: "22px 20px 18px", marginBottom: 18}}>
            <div className="verdict-line">
              <span className="gold-star">✦</span>
              <span className="verdict-text yes" style={{fontSize:48}}>YES</span>
              <span className="gold-star">✦</span>
            </div>
            <ConfidenceDots filled={3} tone="yes"/>
            <div className="confidence-label">CONFIDENCE: HIGH</div>
          </div>

          <div className="practitioner-section">
            <div className="head">
              <span className="title">Radicality</span>
              <span style={{
                fontSize: 10, padding: "3px 8px",
                background: "rgba(34,211,164,0.18)", color: "var(--yes)",
                borderRadius: 999, fontWeight: 600, letterSpacing: 0.4,
              }}>RADICAL</span>
            </div>
            <div className="check-row">
              <span className="check"><IconCheck/></span>
              <div className="body">
                Ascendant degree <span style={{fontFamily:"var(--font-mono)"}}>14°</span>
                <div className="note">Valid · within 3°–27° window</div>
              </div>
            </div>
            <div className="check-row">
              <span className="check"><IconCheck/></span>
              <div className="body">
                Lord of Hour = Lord of Ascendant
                <div className="note">Both Jupiter — strong agreement</div>
              </div>
            </div>
            <div className="check-row">
              <span className="check"><IconCheck/></span>
              <div className="body">
                <span className="verdict">Chart is RADICAL</span> — fit to be judged
              </div>
            </div>
          </div>

          <div className="practitioner-section">
            <div className="head"><span className="title">Essential Dignity</span></div>
            <div className="data-table" style={{margin:0, background:"transparent"}}>
              <div className="head" style={{padding:"6px 0"}}>
                <span style={{gridColumn:"1 / span 2"}}>Planet</span>
                <span>Rul</span><span>Exa</span><span>Tri</span>
              </div>
              <div className="row" style={{padding:"8px 0"}}>
                <span style={{gridColumn:"1 / span 2"}}><span className="glyph">♃</span>Jupiter</span>
                <span className="dim">+5</span><span className="dim">0</span><span className="dim">+3</span>
              </div>
              <div className="row" style={{padding:"8px 0"}}>
                <span style={{gridColumn:"1 / span 2"}}><span className="glyph">☉</span>Sun</span>
                <span className="dim">0</span><span className="dim">+4</span><span className="dim">+3</span>
              </div>
              <div className="row" style={{padding:"8px 0", borderBottom:"none"}}>
                <span style={{gridColumn:"1 / span 2"}}><span className="glyph">♂</span>Mars</span>
                <span className="dim">0</span><span className="dim">−4</span><span className="dim">0</span>
              </div>
            </div>
          </div>

          <div className="practitioner-section">
            <div className="head"><span className="title">Notes</span></div>
            <div style={{fontSize:13, color:"var(--text-secondary)", lineHeight:1.6}}>
              Accidental: Jupiter direct, swift, in 1st house — strong testimony.<br/>
              Antiscia: Sun → ♎ 12° (no aspect to significators).<br/>
              <span style={{color:"var(--accent-gold)"}}>Pars Fortunae</span> at ♌ 8° trines Jupiter — additional confirmation.
            </div>
          </div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 21 — Community / Peer Review
// ─────────────────────────────────────────────────────────────
function ScreenCommunity() {
  return (
    <div className="phone">
      <Starfield seed={21} count={35}/>
      <StatusBar/>
      <NavHeader
        left={<button className="nav-icon-btn"><IconArrowLeft/></button>}
        center={<div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:20, color:"var(--text-primary)"}}>Peer Review</div>}
        right={<span style={{width:36}}/>}
      />
      <div className="content">
        <div className="tab-row">
          <div className="tab-pill">Summary</div>
          <div className="tab-pill">Technical</div>
          <div className="tab-pill active">Community</div>
        </div>

        <div style={{padding:"0 20px 20px"}}>
          <div className="community-banner">
            <div className="title">Get a second opinion</div>
            <div className="body">Three astrologers in the community have weighed in on a question similar to yours. Your question is anonymized before being shared.</div>
          </div>

          <div className="community-card">
            <div className="top">
              <div className="avatar">M</div>
              <div className="name">Mira · 4y horary</div>
              <span className="stance agree">Agrees · YES</span>
            </div>
            <div className="note">
              “Jupiter in domicile applying by trine is one of the strongest testimonies you can get. I'd trust this one.”
            </div>
            <div className="vote-row">
              <span>Accuracy:</span>
              <button className="vote-btn">👍</button>
              <button className="vote-btn">👎</button>
              <span style={{flex:1}}/>
              <span style={{color:"var(--text-disabled)", fontFamily:"var(--font-mono)"}}>2d ago</span>
            </div>
          </div>

          <div className="community-card">
            <div className="top">
              <div className="avatar" style={{background:"linear-gradient(135deg,#F5C842,#A1843A)"}}>P</div>
              <div className="name">PaulO · Lilly student</div>
              <span className="stance agree">Agrees · YES</span>
            </div>
            <div className="note">
              “I'd look at the Moon's next aspect too — but the main testimony here is solid. Watch the timing.”
            </div>
            <div className="vote-row">
              <span>Accuracy:</span>
              <button className="vote-btn">👍</button>
              <button className="vote-btn">👎</button>
              <span style={{flex:1}}/>
              <span style={{color:"var(--text-disabled)", fontFamily:"var(--font-mono)"}}>5d ago</span>
            </div>
          </div>

          <div className="community-card">
            <div className="top">
              <div className="avatar" style={{background:"linear-gradient(135deg,#F87171,#7c2d2d)"}}>S</div>
              <div className="name">Sofia_H · traditional</div>
              <span className="stance disagree">Disagrees · NO</span>
            </div>
            <div className="note">
              “The Sun is combust the Moon's antiscion. I'd be more cautious — the situation may shift before completion.”
            </div>
            <div className="vote-row">
              <span>Accuracy:</span>
              <button className="vote-btn">👍</button>
              <button className="vote-btn">👎</button>
              <span style={{flex:1}}/>
              <span style={{color:"var(--text-disabled)", fontFamily:"var(--font-mono)"}}>1w ago</span>
            </div>
          </div>

          <button className="btn-gold" style={{marginTop:8}}>Submit for peer review</button>
          <div style={{fontSize:11, color:"var(--text-disabled)", textAlign:"center", marginTop:10}}>
            Your question is anonymized
          </div>
        </div>
      </div>
      <TabBar active="ask"/>
      <HomeIndicator/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 22 — Onboarding: Language Select
// ─────────────────────────────────────────────────────────────
function ScreenLanguage() {
  return (
    <div className="phone">
      <Starfield seed={22} count={55}/>
      <StatusBar/>
      <div className="content">
        <div className="lang-wrap">
          <div style={{
            fontSize: 36, color: "var(--accent-gold)",
            textShadow: "0 0 30px rgba(245,200,66,0.45)",
            marginBottom: 18, lineHeight: 1,
          }}>✦</div>
          <h1>Choose your<br/>language</h1>

          <div className="lang-card selected">
            <span className="flag">🇬🇧</span>
            <div style={{flex:1}}>
              <div className="name">English</div>
              <div className="native">English</div>
            </div>
            <span className="check"><IconCheck/></span>
          </div>

          <div className="lang-card">
            <span className="flag">🇷🇺</span>
            <div style={{flex:1}}>
              <div className="name">Russian</div>
              <div className="native">Русский</div>
            </div>
          </div>

          <div style={{flex:1}}/>

          <button className="btn-gold glowing">Continue →</button>
          <div style={{fontSize:12, color:"var(--text-secondary)", marginTop:14}}>
            You can change this anytime in Settings
          </div>

          {/* page dots */}
          <div style={{display:"flex", justifyContent:"center", gap:8, marginTop:24}}>
            <span style={{width:8, height:8, borderRadius:"50%", background:"var(--accent-gold)"}}/>
            <span style={{width:8, height:8, borderRadius:"50%", background:"var(--text-disabled)"}}/>
            <span style={{width:8, height:8, borderRadius:"50%", background:"var(--text-disabled)"}}/>
            <span style={{width:8, height:8, borderRadius:"50%", background:"var(--text-disabled)"}}/>
          </div>
        </div>
      </div>
      <HomeIndicator/>
    </div>
  );
}

// Export to window so the host design canvas can render them
Object.assign(window, {
  ScreenChartWheel, ScreenAspects, ScreenPaywall, ScreenShare,
  ScreenPushOptin, ScreenPractitioner, ScreenCommunity, ScreenLanguage,
});

// ─────────────────────────────────────────────────────────────
// App: design canvas with all 22 artboards
// ─────────────────────────────────────────────────────────────

const { DesignCanvas, DCSection, DCArtboard } = window;
const {
  ScreenOnboarding, ScreenHomeEmpty, ScreenHomeFilled, ScreenLoading,
  ScreenVerdictYes, ScreenVerdictNo, ScreenVerdictMaybe, ScreenVerdictUnclear,
  ScreenJournal, ScreenJournalEmpty, ScreenSettings,
  ScreenErrorNoInternet, ScreenErrorLocation, ScreenFreeLimit,
} = window;

const PHONE_W = 390;
const PHONE_H = 844;

function App() {
  return (
    <React.Fragment>
      <div className="canvas-title">
        <div className="h"><span className="glyph">✦</span>AstraSk</div>
        <div className="s">Cosmos Dark · iPhone 14 Pro · 22 screens · Phase 1 → 3</div>
      </div>

      <DesignCanvas>
        <DCSection id="phase1-entry" title="Phase 1 · Entry & Ask" subtitle="Onboarding through chart-cast">
          <DCArtboard id="s01" label="01 · Onboarding" width={PHONE_W} height={PHONE_H}><ScreenOnboarding/></DCArtboard>
          <DCArtboard id="s02" label="02 · Home — empty" width={PHONE_W} height={PHONE_H}><ScreenHomeEmpty/></DCArtboard>
          <DCArtboard id="s03" label="03 · Home — ready" width={PHONE_W} height={PHONE_H}><ScreenHomeFilled/></DCArtboard>
          <DCArtboard id="s04" label="04 · Casting chart" width={PHONE_W} height={PHONE_H}><ScreenLoading/></DCArtboard>
        </DCSection>

        <DCSection id="verdicts" title="Phase 1 · Verdicts" subtitle="Four outcomes from the same visual system">
          <DCArtboard id="s05" label="05 · YES" width={PHONE_W} height={PHONE_H}><ScreenVerdictYes/></DCArtboard>
          <DCArtboard id="s06" label="06 · NO" width={PHONE_W} height={PHONE_H}><ScreenVerdictNo/></DCArtboard>
          <DCArtboard id="s07" label="07 · MAYBE" width={PHONE_W} height={PHONE_H}><ScreenVerdictMaybe/></DCArtboard>
          <DCArtboard id="s08" label="08 · UNCLEAR · radical warning" width={PHONE_W} height={PHONE_H}><ScreenVerdictUnclear/></DCArtboard>
        </DCSection>

        <DCSection id="library" title="Phase 1 · Journal & Settings" subtitle="Saved readings and configuration">
          <DCArtboard id="s09" label="09 · Journal — entries" width={PHONE_W} height={PHONE_H}><ScreenJournal/></DCArtboard>
          <DCArtboard id="s10" label="10 · Journal — empty" width={PHONE_W} height={PHONE_H}><ScreenJournalEmpty/></DCArtboard>
          <DCArtboard id="s11" label="11 · Settings" width={PHONE_W} height={PHONE_H}><ScreenSettings/></DCArtboard>
        </DCSection>

        <DCSection id="errors" title="Phase 1 · Edge states" subtitle="Offline, denied permission, monthly cap">
          <DCArtboard id="s12" label="12 · No internet" width={PHONE_W} height={PHONE_H}><ScreenErrorNoInternet/></DCArtboard>
          <DCArtboard id="s13" label="13 · Location denied" width={PHONE_W} height={PHONE_H}><ScreenErrorLocation/></DCArtboard>
          <DCArtboard id="s14" label="14 · Free limit reached" width={PHONE_W} height={PHONE_H}><ScreenFreeLimit/></DCArtboard>
        </DCSection>

        <DCSection id="phase2-chart" title="Phase 2 · Chart & Technical" subtitle="Visualization and breakdown">
          <DCArtboard id="s15" label="15 · Chart Wheel" width={PHONE_W} height={PHONE_H}><ScreenChartWheel/></DCArtboard>
          <DCArtboard id="s16" label="16 · Aspects · Dignities" width={PHONE_W} height={PHONE_H}><ScreenAspects/></DCArtboard>
        </DCSection>

        <DCSection id="phase2-monetize" title="Phase 2 · Subscription & Share" subtitle="Paywall, shareable card, push opt-in">
          <DCArtboard id="s17" label="17 · Paywall" width={PHONE_W} height={PHONE_H}><ScreenPaywall/></DCArtboard>
          <DCArtboard id="s18" label="18 · Share Reading" width={PHONE_W} height={PHONE_H}><ScreenShare/></DCArtboard>
          <DCArtboard id="s19" label="19 · Push opt-in" width={PHONE_W} height={PHONE_H}><ScreenPushOptin/></DCArtboard>
        </DCSection>

        <DCSection id="phase3" title="Phase 3 · Growth" subtitle="Practitioner mode, community, i18n">
          <DCArtboard id="s20" label="20 · Practitioner mode" width={PHONE_W} height={PHONE_H}><ScreenPractitioner/></DCArtboard>
          <DCArtboard id="s21" label="21 · Peer Review" width={PHONE_W} height={PHONE_H}><ScreenCommunity/></DCArtboard>
          <DCArtboard id="s22" label="22 · Language Select" width={PHONE_W} height={PHONE_H}><ScreenLanguage/></DCArtboard>
        </DCSection>
      </DesignCanvas>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
