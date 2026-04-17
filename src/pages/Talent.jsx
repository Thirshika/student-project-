import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiStar, FiFilter, FiBriefcase, FiDownload, FiX, FiCheckCircle, FiFile, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { fetchStudents, addToShortlist, updatePipelineStage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdVerified } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const DOMAINS = {
  ai: { l: 'Artificial Intelligence', c: 'dom-ai' },
  web: { l: 'Web Development', c: 'dom-web' },
  mobile: { l: 'App Development', c: 'dom-mobile' },
  iot: { l: 'Hardware / IoT', c: 'dom-iot' },
  data: { l: 'Data Science & Analytics', c: 'dom-data' },
  other: { l: 'Other Tech / Non-Tech', c: 'dom-other' }
};

export default function Talent() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domFilter, setDomFilter] = useState('all');
  const [colleges, setColleges] = useState([]);
  const [colFilter, setColFilter] = useState('all');
  const [hasResumeFilter, setHasResumeFilter] = useState(false);
  const [hasDemoFilter, setHasDemoFilter] = useState(false);
  const [hasGithubFilter, setHasGithubFilter] = useState(false);
  const [hasLinkedinFilter, setHasLinkedinFilter] = useState(false);
  const [selected, setSelected] = useState(null);
  
  const { isHR, isAdmin, hrUser, isApprovedHR } = useAuth();

  useEffect(() => {
    fetchStudents()
      .then(res => {
        setStudents(res.data.students);
        const uniqueCols = [...new Set(res.data.students.map(s => s.college))].filter(Boolean);
        setColleges(uniqueCols);
      })
      .catch(() => toast.error('Failed to load talent pool.'))
      .finally(() => setLoading(false));
  }, [hrUser]);

  const filtered = students.filter(s => {
    const dMatch = domFilter === 'all' || s.domain === domFilter;
    const cMatch = colFilter === 'all' || s.college === colFilter;
    const rMatch = !hasResumeFilter || s.has_resume;
    const lMatch = !hasDemoFilter || !!s.demo;
    const gMatch = !hasGithubFilter || !!s.github;
    const liMatch = !hasLinkedinFilter || !!s.linkedin;
    const sMatch = !search || 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.ptitle.toLowerCase().includes(search.toLowerCase()) ||
      s.skills.some(sk => sk.toLowerCase().includes(search.toLowerCase()));
    return dMatch && cMatch && rMatch && lMatch && gMatch && liMatch && sMatch;
  });

  const handleShortlist = async (e, id) => {
    if (e) e.stopPropagation();
    if (!isHR) return toast.error('Please log in as HR to shortlist candidates.');
    try {
      await addToShortlist({ token: hrUser.token, student_id: id });
      toast.success('Added to your shortlist! ⭐');
    } catch (err) {
      if (err.response?.status !== 400) {
        toast.error(err.response?.data?.detail || 'Failed to shortlist.');
      }
    }
  };

  const handleCallAndShortlist = async (id) => {
    if (!isHR) return;
    try {
      // First ensure they are in the shortlist/pipeline
      await addToShortlist({ token: hrUser.token, student_id: id });
    } catch (err) {
      // Ignore "Already in shortlist" errors (400)
    }

    try {
      // Then move them to contacted stage
      await updatePipelineStage({ token: hrUser.token, student_id: id, stage: 'contacted' });
    } catch (err) {
      console.error('Failed to update stage to contacted during call.', err);
    }
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 70px)' }}>
      
      {/* ── Search Header ── */}
      <div style={{ background: 'linear-gradient(135deg,rgba(15,23,42,.03),rgba(14,165,233,.05))', padding: '42px 32px', borderBottom: '1px solid var(--border)' }}>
        <div className="section-inner">
          <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1.4px', marginBottom: 28, textAlign: 'center' }}>
            Talent <span style={{ color: 'var(--secondary)' }}>Directory</span>
          </h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) auto auto', gap: 14, background: '#fff', padding: 12, borderRadius: 20, boxShadow: 'var(--sh-xs)', border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FiSearch style={{ position: 'absolute', left: 16, color: 'var(--faint)' }} size={20} />
              <input 
                type="text" placeholder="Search by name, project, or skills (e.g. Python, React)" 
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 46px', border: 'none', background: 'transparent', outline: 'none', fontSize: '.95rem', fontWeight: 500 }}
              />
            </div>
            <select value={domFilter} onChange={e => setDomFilter(e.target.value)} style={{ padding: '0 16px', border: '1px solid var(--border)', borderRadius: 12, outline: 'none', fontWeight: 600, fontSize: '.85rem', color: 'var(--ink)', background: '#fff', cursor: 'pointer' }}>
              <option value="all">All Domains</option>
              {Object.entries(DOMAINS).map(([k,v]) => <option key={k} value={k}>{v.l}</option>)}
            </select>
            <select value={colFilter} onChange={e => setColFilter(e.target.value)} style={{ padding: '0 12px', border: '1px solid var(--border)', borderRadius: 12, outline: 'none', fontWeight: 600, fontSize: '.8rem', color: 'var(--ink)', background: '#fff', cursor: 'pointer' }}>
              <option value="all">All Colleges</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { l: 'Resume', v: hasResumeFilter, s: setHasResumeFilter },
                { l: 'Live Demo', v: hasDemoFilter, s: setHasDemoFilter },
                { l: 'GitHub', v: hasGithubFilter, s: setHasGithubFilter },
                { l: 'LinkedIn', v: hasLinkedinFilter, s: setHasLinkedinFilter }
              ].map(f => (
                <div key={f.l} style={{ display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none', cursor: 'pointer' }} onClick={() => f.s(!f.v)}>
                  <div style={{ width: 16, height: 16, border: `2px solid ${f.v ? 'var(--secondary)' : 'var(--faint)'}`, borderRadius: 4, background: f.v ? 'var(--secondary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {f.v && <FiCheckCircle size={10} color="#fff" />}
                  </div>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: f.v ? 'var(--secondary)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{f.l}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18, color: 'var(--muted)', fontSize: '.85rem', fontWeight: 700 }}>
            Showing {filtered.length} {filtered.length === 1 ? 'student' : 'students'}
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ flex: 1, padding: '42px 32px', background: 'var(--bg)' }}>
        <div className="section-inner">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading talent directory...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)', background: '#fff', borderRadius: 24, border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink)' }}>No students found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => {setSearch('');setDomFilter('all');setColFilter('all')}}>Clear Filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
              <AnimatePresence>
                {filtered.map(s => {
                  const d = DOMAINS[s.domain] || DOMAINS.other;
                  const int = (s.name || '').split(' ').map(n=>n?n[0]:'').join('').substring(0,2).toUpperCase();
                  const avIdx = (s.id || 1) % 12 + 1;
                  
                  return (
                    <motion.div 
                      key={s.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelected(s)}
                      className="card" style={{ padding: '24px 24px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
                    >
                      {s.is_new && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(239,68,68,.1)', color: '#ef4444', fontSize: '.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase' }}>New</div>}
                      
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                        <div className={`av${avIdx}`} style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
                          {int}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {s.name}
                            {s.tatti_certified && <MdVerified style={{ color: '#0ea5e9' }} title="TATTI Certified" />}
                          </h3>
                          <div style={{ fontSize: '.76rem', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.college}</div>
                          <div style={{ fontSize: '.72rem', color: 'var(--faint)', fontWeight: 600 }}>{s.degree} · {s.year}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                        <span className={`badge ${d.c}`} style={{ fontSize: '.62rem', padding: '4px 10px', display: 'inline-flex' }}>{d.l}</span>
                        {s.has_resume && <span style={{ fontSize: '.62rem', padding: '4px 10px', display: 'inline-flex', background: 'var(--bg2)', color: 'var(--ink2)', borderRadius: 20, fontWeight: 700, alignItems: 'center', gap: 4 }}><FiFileText size={10} /> Resume</span>}
                      </div>

                      <div style={{ marginBottom: 'auto' }}>
                        <h4 style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--ink2)', marginBottom: 6, lineHeight: 1.3 }}>{s.ptitle}</h4>
                        <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.pdesc}</p>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '18px 0', height: 48, overflow: 'hidden' }}>
                        {s.skills.slice(0,4).map(sk => <span key={sk} style={{ background: 'var(--bg2)', color: 'var(--ink2)', fontSize: '.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 8 }}>{sk}</span>)}
                        {s.skills.length > 4 && <span style={{ color: 'var(--faint)', fontSize: '.7rem', fontWeight: 700, padding: '3px 4px' }}>+{s.skills.length-4}</span>}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '.8rem' }} onClick={(e) => { e.stopPropagation(); setSelected(s); }}>View Profile →</button>
                        <button style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid var(--border)', background: '#fff', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }} onClick={(e) => handleShortlist(e, s.id)} onMouseOver={e => e.currentTarget.style.color='var(--violet)'} onMouseOut={e => e.currentTarget.style.color='var(--muted)'}>
                          <FiStar size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="overlay" style={{ overflowY: 'auto', zIndex: 500 }} onClick={e => { if(e.target===e.currentTarget) setSelected(null) }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modal" style={{ maxWidth: 840, width: '100%', padding: 0, margin: '40px auto' }}>
            
            <div style={{ padding: '40px 40px 30px', background: 'linear-gradient(135deg,var(--primary),var(--violet))', position: 'relative' }}>
              <button style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelected(null)}><FiX size={20}/></button>
              
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div className={`av${(selected.id||1)%12+1}`} style={{ width: 84, height: 84, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
                  {selected.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>{selected.name}</h2>
                  <div style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>{selected.college} • {selected.degree} ({selected.year})</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <span style={{ background: 'rgba(124,58,237,.2)', color: '#d8b4fe', padding: '4px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700 }}>{DOMAINS[selected.domain]?.l || selected.domain}</span>
                    {selected.tatti_certified && <span style={{ background: 'rgba(52,211,153,.2)', color: '#6ee7b7', padding: '4px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><FiCheckCircle /> TATTI Certified</span>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: 40, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 40, alignItems: 'start' }}>
              
              <div>
                <h3 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 800, marginBottom: 12 }}>Project Work</h3>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink2)', marginBottom: 16 }}>{selected.ptitle}</h2>
                <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.8, marginBottom: 24 }}>{selected.pdesc}</p>
                
                {selected.impact && (
                  <>
                    <h3 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--teal)', fontWeight: 800, marginBottom: 8, marginTop: 30 }}>Project Impact / ROI</h3>
                    <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.8, background: 'rgba(15,118,110,.04)', borderLeft: '3px solid var(--teal)', padding: '12px 16px', borderRadius: '0 12px 12px 0' }}>{selected.impact}</p>
                  </>
                )}

                <h3 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 800, marginBottom: 12, marginTop: 40 }}>Skills & Tech Stack</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selected.skills.map(sk => <span key={sk} style={{ background: 'var(--bg2)', color: 'var(--ink2)', fontSize: '.8rem', fontWeight: 600, padding: '6px 14px', borderRadius: 10 }}>{sk}</span>)}
                </div>
              </div>

              <div style={{ background: 'var(--off)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
                <h3 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 800, marginBottom: 18 }}>Student Contact</h3>
                {isApprovedHR ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: '.85rem', color: 'var(--ink2)' }}><strong>Email:</strong> {selected.email}</div>
                    {selected.phone && (
                      <div style={{ fontSize: '.85rem', color: 'var(--ink2)' }}>
                        <strong>Phone:</strong> 
                        <a 
                          href={`tel:${selected.phone}`} 
                          onClick={() => handleCallAndShortlist(selected.id)}
                          style={{ marginLeft: 8, color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}
                        >
                          {selected.phone} 📞
                        </a>
                      </div>
                    )}
                    <hr style={{ borderTop: '1px solid var(--bg2)', margin: '4px 0' }}/>
                    {selected.linkedin && (
                      <a href={selected.linkedin.startsWith('http')?selected.linkedin:'https://'+selected.linkedin} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: '#0077b5', color: '#fff', fontWeight: 700, fontSize: '.85rem', textDecoration: 'none', textAlign: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                        LinkedIn Profile
                      </a>
                    )}
                    {selected.demo && <a href={selected.demo.startsWith('http')?selected.demo:'https://'+selected.demo} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textAlign: 'center' }}>Live Demo</a>}
                    {selected.github && <a href={selected.github.startsWith('http')?selected.github:'https://'+selected.github} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textAlign: 'center' }}>GitHub Repo</a>}
                    
                    <button className="btn-primary" style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }} onClick={(e) => handleShortlist(e, selected.id)}>
                      <FiStar /> Shortlist Candidate
                    </button>
                    {selected.has_resume && (
                      <a href={selected.resume_path ? `http://127.0.0.1:8000/uploads/${selected.resume_path}` : (selected.github ? (selected.github.startsWith('http') ? selected.github : 'https://'+selected.github) : '#')} target="_blank" rel="noreferrer" className="btn-secondary" style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', textDecoration: 'none' }}>
                        <FiDownload /> {selected.resume_path ? 'Download CV' : 'View Resume / Drive'}
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔒</div>
                    <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: 16 }}>Contact details, resumes, and project links are hidden to protect student privacy.</p>
                    <button className="btn-gradient" style={{ width: '100%' }} onClick={() => navigate('/login-hr')}>Login as HR to View</button>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
