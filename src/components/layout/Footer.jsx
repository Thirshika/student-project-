import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', padding: '60px 32px 40px' }}>
      <div className="section-inner">
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '42px', paddingBottom: '32px', borderBottom: '1px solid rgba(148,163,184,.18)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '13px' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, background: 'var(--grad)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800
              }}>TA</div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>TalentAtlas</div>
                <div style={{ fontSize: '.6rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Powered by TATTI</div>
              </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '.85rem', lineHeight: 1.7, maxWidth: 310 }}>
              TalentAtlas is the digital talent platform of TATTI — Tamilnadu Advanced Technical Training Institute. Connecting skilled students with top employers since 1985.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 16 }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/talent" style={{ color: '#cbd5e1', fontSize: '.85rem' }}>Browse Talent</Link>
              <Link to="/about" style={{ color: '#cbd5e1', fontSize: '.85rem' }}>About TATTI</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 16 }}>Contact TATTI</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: '#cbd5e1', fontSize: '.85rem' }}>No.42/25, GEE GEE Complex</span>
              <span style={{ color: '#cbd5e1', fontSize: '.85rem' }}>Anna Salai, Chennai — 600 002</span>
              <a href="https://www.tatti.in" target="_blank" rel="noreferrer" style={{ color: '#cbd5e1', fontSize: '.85rem' }}>www.tatti.in</a>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: '.76rem', color: '#94a3b8' }}>© 2025 TalentAtlas. All rights reserved.</div>
          <a href="https://www.tatti.in" target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '.75rem' }}>
            TATTI — Tamilnadu Advanced Technical Training Institute
          </a>
        </div>
      </div>
    </footer>
  );
}
