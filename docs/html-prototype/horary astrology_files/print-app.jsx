/* global React, ReactDOM */
// Print layout — render every screen at native 390×844 in its own paged block.

const PRINT_SCREENS = [
  { id: "01", title: "Onboarding",                  group: "Phase 1 · Entry & Ask",        Comp: window.ScreenOnboarding },
  { id: "02", title: "Home — empty",                group: "Phase 1 · Entry & Ask",        Comp: window.ScreenHomeEmpty },
  { id: "03", title: "Home — ready",                group: "Phase 1 · Entry & Ask",        Comp: window.ScreenHomeFilled },
  { id: "04", title: "Casting chart",               group: "Phase 1 · Entry & Ask",        Comp: window.ScreenLoading },
  { id: "05", title: "Verdict · YES",               group: "Phase 1 · Verdicts",           Comp: window.ScreenVerdictYes },
  { id: "06", title: "Verdict · NO",                group: "Phase 1 · Verdicts",           Comp: window.ScreenVerdictNo },
  { id: "07", title: "Verdict · MAYBE",             group: "Phase 1 · Verdicts",           Comp: window.ScreenVerdictMaybe },
  { id: "08", title: "Verdict · UNCLEAR",           group: "Phase 1 · Verdicts",           Comp: window.ScreenVerdictUnclear },
  { id: "09", title: "Journal — entries",           group: "Phase 1 · Journal & Settings", Comp: window.ScreenJournal },
  { id: "10", title: "Journal — empty",             group: "Phase 1 · Journal & Settings", Comp: window.ScreenJournalEmpty },
  { id: "11", title: "Settings",                    group: "Phase 1 · Journal & Settings", Comp: window.ScreenSettings },
  { id: "12", title: "Error · No internet",         group: "Phase 1 · Edge states",        Comp: window.ScreenErrorNoInternet },
  { id: "13", title: "Error · Location denied",     group: "Phase 1 · Edge states",        Comp: window.ScreenErrorLocation },
  { id: "14", title: "Free limit reached",          group: "Phase 1 · Edge states",        Comp: window.ScreenFreeLimit },
  { id: "15", title: "Chart Wheel",                 group: "Phase 2 · Chart & Technical",  Comp: window.ScreenChartWheel },
  { id: "16", title: "Aspects · Dignities",         group: "Phase 2 · Chart & Technical",  Comp: window.ScreenAspects },
  { id: "17", title: "Paywall",                     group: "Phase 2 · Subscription & Share", Comp: window.ScreenPaywall },
  { id: "18", title: "Share Reading",               group: "Phase 2 · Subscription & Share", Comp: window.ScreenShare },
  { id: "19", title: "Push opt-in",                 group: "Phase 2 · Subscription & Share", Comp: window.ScreenPushOptin },
  { id: "20", title: "Practitioner mode",           group: "Phase 3 · Growth",             Comp: window.ScreenPractitioner },
  { id: "21", title: "Peer Review",                 group: "Phase 3 · Growth",             Comp: window.ScreenCommunity },
  { id: "22", title: "Language Select",             group: "Phase 3 · Growth",             Comp: window.ScreenLanguage },
];

function PrintPage({ id, title, group, Comp, totalPages }) {
  return (
    <section className="print-page">
      <header className="print-header">
        <div className="print-eyebrow">{group}</div>
        <div className="print-title-row">
          <span className="print-id">{id}</span>
          <h2 className="print-title">{title}</h2>
          <span className="print-meta">AstraSk · iPhone 14 Pro · 390 × 844</span>
        </div>
      </header>
      <div className="print-stage">
        <div className="print-phone-wrap">
          {Comp ? <Comp/> : <div style={{color:"#F87171"}}>Missing: {title}</div>}
        </div>
      </div>
      <footer className="print-footer">
        <span>AstraSk · Cosmos Dark</span>
        <span>{id} / {totalPages}</span>
      </footer>
    </section>
  );
}

function CoverPage() {
  return (
    <section className="print-page print-cover">
      <div className="cover-inner">
        <div className="cover-mark">✦</div>
        <h1 className="cover-title">AstraSk</h1>
        <div className="cover-sub">Horary Astrology · Mobile App Design</div>
        <div className="cover-meta">
          <div>Cosmos Dark theme</div>
          <div>22 screens · iPhone 14 Pro · 390 × 844</div>
          <div>Phase 1 · Phase 2 · Phase 3</div>
        </div>
        <div className="cover-toc">
          <div className="toc-group">
            <div className="toc-h">Phase 1 — MVP</div>
            <div className="toc-line">01–04 · Entry &amp; Ask</div>
            <div className="toc-line">05–08 · Verdicts</div>
            <div className="toc-line">09–11 · Journal &amp; Settings</div>
            <div className="toc-line">12–14 · Edge states</div>
          </div>
          <div className="toc-group">
            <div className="toc-h">Phase 2 — Growth</div>
            <div className="toc-line">15–16 · Chart &amp; Technical</div>
            <div className="toc-line">17–19 · Subscription &amp; Share</div>
          </div>
          <div className="toc-group">
            <div className="toc-h">Phase 3 — Scale</div>
            <div className="toc-line">20 · Practitioner mode</div>
            <div className="toc-line">21 · Peer Review</div>
            <div className="toc-line">22 · Language Select</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrintApp() {
  return (
    <React.Fragment>
      <CoverPage/>
      {PRINT_SCREENS.map(s => (
        <PrintPage key={s.id} {...s} totalPages={PRINT_SCREENS.length}/>
      ))}
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<PrintApp/>);

// Trigger print once everything is settled: fonts loaded, all images decoded,
// React committed, plus a safety delay. Skipped during preview-iframe verification.
(async () => {
  const isTopLevel = (() => { try { return window.top === window.self; } catch (e) { return false; } })();
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch {}
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise(r => setTimeout(r, 600));
  if (isTopLevel) window.print();
})();
