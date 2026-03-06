export const metadata = { robots: { index: false } };

export default function FontPreview() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=Tenor+Sans&family=Nunito+Sans:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .fp-wrap { background:#1a1a1a; min-height:100vh; padding:32px 20px; }
        .fp-title { text-align:center; font-family:sans-serif; font-size:13px; letter-spacing:.2em; text-transform:uppercase; color:#888; margin-bottom:40px; }
        .fp-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; max-width:1200px; margin:0 auto; }
        @media(max-width:800px){ .fp-grid { grid-template-columns:1fr; } }
        .fp-card { background:#f8f7f5; border-radius:16px; overflow:hidden; box-shadow:0 8px 40px rgba(0,0,0,.4); color:#1f2937; }
        .fp-badge { background:#3b6341; color:#fff; font-family:sans-serif; font-size:11px; font-weight:600; letter-spacing:.15em; text-transform:uppercase; padding:6px 16px; display:block; }
        .fp-badge-current { background:#b45309; }
        .fp-nav { background:#fff; border-bottom:1px solid #e5e7eb; padding:10px 20px; display:flex; align-items:center; gap:10px; }
        .fp-logo-mark { width:32px; height:32px; background:#3b6341; border-radius:6px; flex-shrink:0; }
        .fp-brand { font-size:1.05rem; font-weight:700; color:#3b6341; }
        .fp-nav-link { margin-left:auto; font-size:.78rem; color:#6b7280; font-weight:500; }
        .fp-hero { position:relative; height:220px; background:linear-gradient(135deg,#2d4a30,#4a7c59 50%,#3b6341); display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center; padding:20px; gap:8px; }
        .fp-hero::before { content:''; position:absolute; inset:0; background:url('/hero-wedding.jpg') center/cover; opacity:.35; }
        .fp-hero-content { position:relative; z-index:1; }
        .fp-hero h2 { font-size:2rem; font-weight:700; color:#fff; line-height:1.15; text-shadow:0 2px 12px rgba(0,0,0,.4); }
        .fp-hero p { color:rgba(255,255,255,.85); font-size:.9rem; margin-top:6px; }
        .fp-btn { margin-top:14px; background:#fff; color:#3b6341; border:none; border-radius:99px; padding:9px 22px; font-size:.8rem; font-weight:600; display:inline-block; }
        .fp-body { padding:20px; }
        .fp-section-label { font-size:.7rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:#3b6341; margin-bottom:8px; }
        .fp-section-title { font-size:1.4rem; font-weight:700; color:#1f2937; margin-bottom:4px; line-height:1.2; }
        .fp-section-sub { font-size:.82rem; color:#6b7280; margin-bottom:16px; }
        .fp-venue-row { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
        .fp-venue-card { background:#fff; border-radius:10px; overflow:hidden; border:1px solid #e5e7eb; }
        .fp-venue-img { height:64px; background:linear-gradient(135deg,#c9d9cc,#a8c4ac); }
        .fp-venue-info { padding:8px; }
        .fp-venue-name { font-size:.76rem; font-weight:600; color:#1f2937; line-height:1.3; }
        .fp-venue-city { font-size:.68rem; color:#9ca3af; margin-top:2px; }
        .fp-body-sample { font-size:.82rem; color:#4b5563; line-height:1.65; border-top:1px solid #e5e7eb; padding-top:14px; margin-top:4px; }

        /* OPT 1 — Cormorant Garamond + Jost */
        .opt1 .fp-brand, .opt1 .fp-hero h2, .opt1 .fp-section-title, .opt1 .fp-venue-name { font-family:'Cormorant Garamond',serif; }
        .opt1 .fp-nav-link, .opt1 .fp-hero p, .opt1 .fp-btn, .opt1 .fp-section-label, .opt1 .fp-section-sub, .opt1 .fp-venue-city, .opt1 .fp-body-sample { font-family:'Jost',sans-serif; }
        .opt1 .fp-hero h2 { font-size:2.3rem; font-weight:600; letter-spacing:.01em; }
        .opt1 .fp-section-title { font-size:1.6rem; font-weight:600; }

        /* OPT 2 — Libre Baskerville + Lato */
        .opt2 .fp-brand, .opt2 .fp-hero h2, .opt2 .fp-section-title, .opt2 .fp-venue-name { font-family:'Libre Baskerville',serif; }
        .opt2 .fp-nav-link, .opt2 .fp-hero p, .opt2 .fp-btn, .opt2 .fp-section-label, .opt2 .fp-section-sub, .opt2 .fp-venue-city, .opt2 .fp-body-sample { font-family:'Lato',sans-serif; }
        .opt2 .fp-hero h2 { font-size:1.75rem; font-weight:700; }
        .opt2 .fp-section-title { font-size:1.3rem; }

        /* OPT 3 — DM Serif Display + DM Sans (CURRENT) */
        .opt3 .fp-brand, .opt3 .fp-hero h2, .opt3 .fp-section-title, .opt3 .fp-venue-name { font-family:'DM Serif Display',serif; }
        .opt3 .fp-nav-link, .opt3 .fp-hero p, .opt3 .fp-btn, .opt3 .fp-section-label, .opt3 .fp-section-sub, .opt3 .fp-venue-city, .opt3 .fp-body-sample { font-family:'DM Sans',sans-serif; }

        /* OPT 4 — Tenor Sans + Nunito Sans */
        .opt4 .fp-brand, .opt4 .fp-hero h2, .opt4 .fp-section-title, .opt4 .fp-venue-name { font-family:'Tenor Sans',serif; }
        .opt4 .fp-nav-link, .opt4 .fp-hero p, .opt4 .fp-btn, .opt4 .fp-section-label, .opt4 .fp-section-sub, .opt4 .fp-venue-city, .opt4 .fp-body-sample { font-family:'Nunito Sans',sans-serif; }
        .opt4 .fp-hero h2 { font-size:1.85rem; letter-spacing:.02em; }
      `}</style>

      <div className="fp-wrap">
        <p className="fp-title">Green Bowtie — Font Pairing Preview</p>
        <div className="fp-grid">

          {/* OPTION 1 */}
          <div className="fp-card opt1">
            <span className="fp-badge">Option 1 — Cormorant Garamond + Jost</span>
            <div className="fp-nav"><div className="fp-logo-mark" /><span className="fp-brand">Green Bowtie</span><span className="fp-nav-link">Browse States</span></div>
            <div className="fp-hero"><div className="fp-hero-content"><h2>Find Your Perfect<br/>Wedding Venue</h2><p>12,400 venues across all 50 states</p><span className="fp-btn">Browse by State</span></div></div>
            <div className="fp-body">
              <div className="fp-section-label">Popular Destinations</div>
              <div className="fp-section-title">Wedding Venues in California</div>
              <div className="fp-section-sub">From wine country to beachside estates</div>
              <div className="fp-venue-row">
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">Vineyard Estate at Napa Valley</div><div className="fp-venue-city">Napa, CA</div></div></div>
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">The Grand Ballroom</div><div className="fp-venue-city">Los Angeles, CA</div></div></div>
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">Coastal Cliffs Resort</div><div className="fp-venue-city">Malibu, CA</div></div></div>
              </div>
              <div className="fp-body-sample">A stunning vineyard estate nestled in the rolling hills of Napa Valley. With sweeping views of the vines, a restored 19th-century barn, and space for up to 250 guests, this is one of Wine Country&apos;s most sought-after wedding destinations.</div>
            </div>
          </div>

          {/* OPTION 2 */}
          <div className="fp-card opt2">
            <span className="fp-badge">Option 2 — Libre Baskerville + Lato</span>
            <div className="fp-nav"><div className="fp-logo-mark" /><span className="fp-brand">Green Bowtie</span><span className="fp-nav-link">Browse States</span></div>
            <div className="fp-hero"><div className="fp-hero-content"><h2>Find Your Perfect<br/>Wedding Venue</h2><p>12,400 venues across all 50 states</p><span className="fp-btn">Browse by State</span></div></div>
            <div className="fp-body">
              <div className="fp-section-label">Popular Destinations</div>
              <div className="fp-section-title">Wedding Venues in California</div>
              <div className="fp-section-sub">From wine country to beachside estates</div>
              <div className="fp-venue-row">
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">Vineyard Estate at Napa Valley</div><div className="fp-venue-city">Napa, CA</div></div></div>
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">The Grand Ballroom</div><div className="fp-venue-city">Los Angeles, CA</div></div></div>
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">Coastal Cliffs Resort</div><div className="fp-venue-city">Malibu, CA</div></div></div>
              </div>
              <div className="fp-body-sample">A stunning vineyard estate nestled in the rolling hills of Napa Valley. With sweeping views of the vines, a restored 19th-century barn, and space for up to 250 guests, this is one of Wine Country&apos;s most sought-after wedding destinations.</div>
            </div>
          </div>

          {/* OPTION 3 — CURRENT */}
          <div className="fp-card opt3">
            <span className="fp-badge fp-badge-current">Option 3 — DM Serif Display + DM Sans ★ CURRENT</span>
            <div className="fp-nav"><div className="fp-logo-mark" /><span className="fp-brand">Green Bowtie</span><span className="fp-nav-link">Browse States</span></div>
            <div className="fp-hero"><div className="fp-hero-content"><h2>Find Your Perfect<br/>Wedding Venue</h2><p>12,400 venues across all 50 states</p><span className="fp-btn">Browse by State</span></div></div>
            <div className="fp-body">
              <div className="fp-section-label">Popular Destinations</div>
              <div className="fp-section-title">Wedding Venues in California</div>
              <div className="fp-section-sub">From wine country to beachside estates</div>
              <div className="fp-venue-row">
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">Vineyard Estate at Napa Valley</div><div className="fp-venue-city">Napa, CA</div></div></div>
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">The Grand Ballroom</div><div className="fp-venue-city">Los Angeles, CA</div></div></div>
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">Coastal Cliffs Resort</div><div className="fp-venue-city">Malibu, CA</div></div></div>
              </div>
              <div className="fp-body-sample">A stunning vineyard estate nestled in the rolling hills of Napa Valley. With sweeping views of the vines, a restored 19th-century barn, and space for up to 250 guests, this is one of Wine Country&apos;s most sought-after wedding destinations.</div>
            </div>
          </div>

          {/* OPTION 4 */}
          <div className="fp-card opt4">
            <span className="fp-badge">Option 4 — Tenor Sans + Nunito Sans</span>
            <div className="fp-nav"><div className="fp-logo-mark" /><span className="fp-brand">Green Bowtie</span><span className="fp-nav-link">Browse States</span></div>
            <div className="fp-hero"><div className="fp-hero-content"><h2>Find Your Perfect<br/>Wedding Venue</h2><p>12,400 venues across all 50 states</p><span className="fp-btn">Browse by State</span></div></div>
            <div className="fp-body">
              <div className="fp-section-label">Popular Destinations</div>
              <div className="fp-section-title">Wedding Venues in California</div>
              <div className="fp-section-sub">From wine country to beachside estates</div>
              <div className="fp-venue-row">
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">Vineyard Estate at Napa Valley</div><div className="fp-venue-city">Napa, CA</div></div></div>
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">The Grand Ballroom</div><div className="fp-venue-city">Los Angeles, CA</div></div></div>
                <div className="fp-venue-card"><div className="fp-venue-img" /><div className="fp-venue-info"><div className="fp-venue-name">Coastal Cliffs Resort</div><div className="fp-venue-city">Malibu, CA</div></div></div>
              </div>
              <div className="fp-body-sample">A stunning vineyard estate nestled in the rolling hills of Napa Valley. With sweeping views of the vines, a restored 19th-century barn, and space for up to 250 guests, this is one of Wine Country&apos;s most sought-after wedding destinations.</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
