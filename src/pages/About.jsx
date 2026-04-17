import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="page active" style={{ padding: '60px 20px', background: '#f8fafc' }}>
      <div className="section-inner" style={{ maxWidth: 900 }}>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,.1)', color: 'var(--secondary)', borderRadius: 30, padding: '6px 16px', fontSize: '.7rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
            Since 1985
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 20 }}>
            Tamilnadu Advanced Technical Training Institute
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 660, margin: '0 auto', lineHeight: 1.7 }}>
            Empowering students and underprivileged youth with employable technical skills for over 4 decades.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 70 }}>
          {[
            { icon: '🏛️', t: 'Founded 1985', d: 'Started by Late Mr. C. Ranganathan, a visionary who trained over a lakh students.' },
            { icon: '🤝', t: 'Non-Profit Mission', d: 'Committed to social responsibility. Specialized training for physically challenged and underprivileged students.' },
            { icon: '🎓', t: 'Government Certified', d: 'ISO 9001:2015 recognized and partnered with MSME and TN Skill Development Corp.' },
            { icon: '💡', t: '150+ Technical Courses', d: 'From AC Mechanic to Artificial Intelligence. We teach skills the industry actually needs.' }
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>{c.icon}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>{c.t}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', lineHeight: 1.6 }}>{c.d}</p>
            </motion.div>
          ))}
        </div>

        <div className="card" style={{ padding: '50px 40px', background: 'linear-gradient(135deg, var(--primary), var(--violet))', color: '#fff', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 16 }}>Hire TATTI Alumni</h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto 34px', lineHeight: 1.7 }}>
            Our students are trained on real-world projects and are ready to contribute from day one. Browse our Talent Directory to find your next hire.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <a href="https://www.tatti.in/courses" target="_blank" rel="noreferrer" className="btn-secondary" style={{ color: '#fff', background: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.2)' }}>View Courses</a>
            <a href="/talent" className="btn-primary" style={{ background: '#fff', color: 'var(--violet)' }}>Browse Talent →</a>
          </div>
        </div>

      </div>
    </div>
  );
}
