import { Link } from 'react-router-dom';
import { FiBriefcase, FiUpload } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="page active">
      <section style={{ background: '#fff', padding: '80px 32px 74px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', top: -110, right: -80, width: 330, height: 330, borderRadius: '48%', background: 'radial-gradient(circle,rgba(15,23,42,.08),transparent 65%)', pointerEvents: 'none' }} />
        <div className="section-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '70px', alignItems: 'center' }}>
          
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.2)', color: 'var(--violet)', borderRadius: 30, padding: '6px 16px', fontSize: '.7rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>
              Tamil Nadu's #1 Student Talent Platform
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem,4vw,3.6rem)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-2px', lineHeight: 1.08, marginBottom: 22 }}>
              Where Student Talent<br />Meets <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real Opportunity</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '.96rem', maxWidth: 460, marginBottom: 38, lineHeight: 1.8 }}>
              TalentAtlas, powered by TATTI, connects skilled students from Tamil Nadu's top colleges with HR professionals — through real project work, not just resumes.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/talent" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiBriefcase /> Hire Verified Talent →</Link>
              <Link to="/challenges" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>🏆 Skill Challenges</Link>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
              {[
                { n: '500+', l: 'Students' },
                { n: '6', l: 'Domains' },
                { n: '40+', l: 'Years TATTI' },
                { n: '2', l: 'Colleges' }
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{s.l}</div>
                  </div>
                  {i < 3 && <div style={{ width: 1, height: '100%', background: 'var(--border)' }}></div>}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ position: 'relative' }} className="hide-mobile">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14, height: 430 }}>
              <div style={{ borderRadius: 22, overflow: 'hidden', position: 'relative', gridRow: '1/3' }}>
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80" alt="Students" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,92,92,.12),rgba(124,58,237,.18))' }} />
              </div>
              <div style={{ borderRadius: 22, overflow: 'hidden', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80" alt="Coding" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(6,182,212,.12),rgba(59,130,246,.18))' }} />
              </div>
              <div style={{ borderRadius: 22, overflow: 'hidden', position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80" alt="Team" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(245,158,11,.12),rgba(255,92,92,.12))' }} />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      <section className="section" style={{ background: 'linear-gradient(160deg,#fdf8ff 0%,#f8f5ff 50%,#f0fff8 100%)' }}>
        <div className="section-inner stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <motion.div whileHover={{ y: -5 }} className="card" style={{ padding: '32px 30px', background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🏢</div>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginBottom: 8, fontFamily: "'Source Sans 3', sans-serif" }}>Hire Verified Student Talent</h3>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.86rem', marginBottom: 20 }}>Register as a recruiter to instantly access top student talent.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.75)', fontSize: '.82rem' }}><span style={{ background: 'rgba(14,165,233,.2)', color: '#7dd3fc', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span> Register as an HR</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.75)', fontSize: '.82rem' }}><span style={{ background: 'rgba(14,165,233,.2)', color: '#7dd3fc', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span> Browse & shortist profiles</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.75)', fontSize: '.82rem' }}><span style={{ background: 'rgba(14,165,233,.2)', color: '#7dd3fc', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span> Contact directly</div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="card" style={{ padding: '32px 30px', background: 'linear-gradient(135deg,#fdf8ff,#f0fff8)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🏆</div>
            <h3 style={{ color: 'var(--ink)', fontSize: '1.3rem', fontWeight: 800, marginBottom: 8, fontFamily: "'Source Sans 3', sans-serif" }}>Compete in Project Challenges</h3>
            <p style={{ color: 'var(--muted)', fontSize: '.86rem', marginBottom: 20 }}>Take on industry-standard challenges and prove your skills to recruiters.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: '.82rem' }}><span style={{ background: 'rgba(124,58,237,.12)', color: 'var(--violet)', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span> Pick a challenge</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: '.82rem' }}><span style={{ background: 'rgba(124,58,237,.12)', color: 'var(--violet)', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span> Build and solve it</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: '.82rem' }}><span style={{ background: 'rgba(124,58,237,.12)', color: 'var(--violet)', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span> Get verified badges</div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="section-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: '22px' }}>
          {[
            { icon: '🎓', title: 'Talent Directory', desc: 'Browse student projects across AI, Web, Mobile, IoT and Data Science. Filter by domain and connect directly.', link: '/talent' },
            { icon: '🏆', title: 'Skill Challenges', desc: 'Solve live project challenges from industry partners and get your skills verified by top HR professionals.', link: '/challenges' },
            { icon: '🏛️', title: 'About TATTI', desc: 'Founded 1985 by Mr. C. Ranganathan — TATTI is Tamil Nadu\'s trusted non-profit technical training institute.', link: '/about' },
          ].map((c, i) => (
            <Link to={c.link} key={i}>
              <motion.div whileHover={{ y: -4, boxShadow: 'var(--sh)' }} className="card" style={{ padding: '26px', cursor: 'pointer', height: '100%' }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(14,165,233,.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', marginBottom: 16 }}>{c.icon}</div>
                <div style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>{c.title}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>{c.desc}</div>
                <div style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--secondary)' }}>Explore →</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
