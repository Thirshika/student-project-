import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchShortlist, updatePipelineStage, updatePipelineNote, fetchHRStats, createJob, deleteJob, fetchMyJobs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiStar, FiPhoneCall, FiCalendar, FiCheck, FiX, FiFileText, FiDownload, FiBriefcase, FiPlus, FiMapPin, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STAGES = {
  new: { icon: '🔵', l: 'New', bg: 'var(--muted)' },
  shortlisted: { icon: '⭐', l: 'Shortlisted', bg: '#3b82f6' },
  contacted: { icon: '📞', l: 'Contacted', bg: '#f59e0b' },
  interview: { icon: '📅', l: 'Interview', bg: '#8b5cf6' },
  offer: { icon: '✅', l: 'Offer', bg: '#10b981' },
  rejected: { icon: '❌', l: 'Rejected', bg: '#ef4444' }
};

export default function Dashboard() {
  const { isHR, isAdmin, hrUser, isApprovedHR } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState('all');
  const [noteModal, setNoteModal] = useState(null);
  const [selected, setSelected] = useState(null);

  // New Job states
  const [activePortalTab, setActivePortalTab] = useState('pipeline'); // pipeline, jobs
  const [hrJobs, setHrJobs] = useState([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', location: '', salary: '', type: 'Full-time', description: '' });

  const loadHRJobs = async () => {
    try {
      const res = await fetchMyJobs();
      setHrJobs(res.data.jobs);
    } catch { toast.error('Failed to load your jobs.'); }
  };

  const loadData = async () => {
    if (!isHR) return;
    try {
      const [resSl, resSt] = await Promise.all([
        fetchShortlist(hrUser.token),
        fetchHRStats(hrUser.token)
      ]);
      setList(resSl.data.shortlist);
      setStats(resSt.data);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (isHR) loadHRJobs();
  }, [isHR]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await createJob({
        ...newJob,
        company: hrUser.company,
        requirements: [],
        skills_needed: []
      });
      toast.success('Job posted successfully! 🚀');
      setShowJobModal(false);
      setNewJob({ title: '', location: '', salary: '', type: 'Full-time', description: '' });
      loadHRJobs();
    } catch { toast.error('Failed to post job.'); }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job listing?')) return;
    try {
      await deleteJob(id);
      toast.success('Job deleted.');
      loadHRJobs();
    } catch { toast.error('Failed to delete job.'); }
  };

  const changeStage = async (id, stage) => {
    try {
      await updatePipelineStage({ token: hrUser.token, student_id: id, stage });
      toast.success('Pipeline updated.');
      loadData();
    } catch { toast.error('Failed to update stage.'); }
  };

  const saveNote = async (id, note) => {
    try {
      await updatePipelineNote({ token: hrUser.token, student_id: id, note });
      toast.success('Note saved.');
      setNoteModal(null);
      loadData();
    } catch { toast.error('Failed to save note.'); }
  };

  const handleExport = () => {
    if (list.length === 0) return toast.error('Nothing to export');
    const headers = ['Name', 'Email', 'College', 'Domain', 'Project', 'Stage', 'Note'];
    const rows = list.map(s => [
      s.name, s.email, s.college, s.domain, s.ptitle, s.stage, (s.note || '').replace(/,/g, ';')
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shortlist_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exporting CSV... 📂');
  };

  if (!isHR) return (
    <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 70px)', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>HR Login Required</h2>
        <p style={{ color: 'var(--muted)', margin: '14px 0 24px' }}>Please log in to your HR account to view the dashboard.</p>
        <button className="btn-primary" onClick={() => document.querySelector('header button.btn-secondary:nth-child(1)').click()}>HR Login →</button>
      </div>
    </div>
  );

  const filtered = activeStage === 'all' ? list : list.filter(x => x.stage === activeStage);

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 70px)', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg,#0c0a1e,#1e1b4b)', padding: '42px 32px', color: '#fff' }}>
        <div className="section-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>Welcome back, {hrUser?.name}</h1>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.95rem', fontWeight: 600 }}>{hrUser?.company} • Recruiter Dashboard</p>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setActivePortalTab('pipeline')}
                style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: activePortalTab === 'pipeline' ? 'var(--secondary)' : 'rgba(255,255,255,.1)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <FiUsers /> Recruitment Pipeline
              </button>
              <button
                onClick={() => setActivePortalTab('jobs')}
                style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: activePortalTab === 'jobs' ? 'var(--secondary)' : 'rgba(255,255,255,.1)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <FiBriefcase /> My Job Postings
              </button>
              <button
                onClick={() => navigate('/upload')}
                style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <FiPlus /> Add Candidate Project
              </button>
            </div>
          </div>
          {stats && activePortalTab === 'pipeline' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {[
                { l: 'Total Stars', v: stats.shortlisted, i: <FiStar /> },
                { l: 'Contacted', v: stats.contacted, i: <FiPhoneCall /> },
                { l: 'Interviews', v: stats.interviews, i: <FiCalendar /> },
                { l: 'Offers', v: stats.pipeline.offer || 0, i: <FiCheck /> }
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', padding: '16px 20px', borderRadius: 16 }}>
                  <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center' }}>{s.i} {s.l}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.2, marginTop: 4 }}>{s.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: '32px', background: 'var(--bg)' }}>
        <div className="section-inner">

          {activePortalTab === 'pipeline' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <h1 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px' }}>Recruitment <span style={{ color: 'var(--secondary)' }}>Pipeline</span></h1>
                <button className="btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '.9rem' }}>
                  <FiDownload /> Export Shortlist (CSV)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0,1fr)', gap: 32, alignItems: 'start' }}>
                <div style={{ position: 'sticky', top: 90 }}>
                  <h3 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 800, marginBottom: 14 }}>Pipeline Stages</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      className={`card ${activeStage === 'all' ? 'active' : ''}`}
                      style={{ background: activeStage === 'all' ? '#fff' : 'transparent', border: activeStage === 'all' ? '1px solid var(--violet)' : '1px solid transparent', boxShadow: activeStage === 'all' ? '0 2px 10px rgba(0,0,0,.05)' : 'none', padding: '10px 14px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: activeStage === 'all' ? 700 : 600, color: activeStage === 'all' ? 'var(--violet)' : 'var(--muted)', transition: 'all .2s' }}
                      onClick={() => setActiveStage('all')}
                    >
                      <span>🌍 All Candidates</span>
                      <span style={{ background: 'rgba(0,0,0,.05)', padding: '2px 8px', borderRadius: 20, fontSize: '.7rem' }}>{list.length}</span>
                    </button>

                    {Object.entries(STAGES).map(([k, v]) => (
                      <button
                        key={k} className={`card ${activeStage === k ? 'active' : ''}`}
                        style={{ background: activeStage === k ? '#fff' : 'transparent', border: activeStage === k ? `1px solid ${v.bg}50` : '1px solid transparent', boxShadow: activeStage === k ? '0 2px 10px rgba(0,0,0,.05)' : 'none', padding: '10px 14px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: activeStage === k ? 700 : 600, color: activeStage === k ? 'var(--ink)' : 'var(--muted)', transition: 'all .2s' }}
                        onClick={() => setActiveStage(k)}
                      >
                        <span>{v.icon} {v.l}</span>
                        <span style={{ background: activeStage === k ? v.bg + '20' : 'rgba(0,0,0,.05)', color: activeStage === k ? v.bg : 'inherit', padding: '2px 8px', borderRadius: 20, fontSize: '.7rem' }}>{stats?.pipeline[k] || 0}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeStage === 'all' ? 'My Shortlist' : STAGES[activeStage]?.l} ({filtered.length})</h2>
                  </div>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 40px', background: '#fff', borderRadius: 20, border: '1px dashed var(--border)' }}>
                      <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>📋</div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 6 }}>{activeStage === 'all' ? 'Your shortlist is empty' : `No candidates in ${STAGES[activeStage].l}`}</h3>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {filtered.map(s => {
                        const stageConf = STAGES[s.stage] || STAGES.new;
                        return (
                          <motion.div key={s.student_id} layout className="card" style={{ padding: 20, display: 'flex', gap: 20, alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelected(s)}>
                            <div className={`av${(s.student_id || 1) % 12 + 1}`} style={{ width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>{s.name[0]}</div>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontWeight: 800 }}>{s.name}</h3>
                              <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{s.college} • {s.ptitle}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <select value={s.stage} onChange={e => changeStage(s.student_id, e.target.value)} style={{ padding: '4px 8px', borderRadius: 8, fontSize: '.75rem' }}>
                                {Object.entries(STAGES).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
                              </select>
                              <button onClick={(e) => { e.stopPropagation(); setNoteModal(s); }}><FiFileText /></button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <h1 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--ink)' }}>My <span style={{ color: 'var(--secondary)' }}>Postings</span></h1>
                <button className="btn-primary" onClick={() => setShowJobModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiPlus /> Post New Job
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                {hrJobs.map(j => (
                  <div key={j.id} className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, background: 'var(--bg2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💼</div>
                      <button onClick={() => handleDeleteJob(j.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>{j.title}</h3>
                    <div style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: 16 }}>{j.location} • {j.type}</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '.75rem', padding: '4px 10px', background: 'var(--bg2)', borderRadius: 20 }}><FiMapPin /> {j.location}</span>
                      <span style={{ fontSize: '.75rem', padding: '4px 10px', background: 'var(--bg2)', borderRadius: 20 }}><FiClock /> {j.type}</span>
                    </div>
                  </div>
                ))}
                {hrJobs.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, background: '#fff', borderRadius: 20 }}>No jobs posted yet.</div>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── JOB MODAL ── */}
      {showJobModal && (
        <div className="overlay" style={{ zIndex: 1000 }} onClick={e => e.target === e.currentTarget && setShowJobModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal" style={{ maxWidth: 500 }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create New Job Listing</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.4rem' }} onClick={() => setShowJobModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handlePostJob} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-field">
                <label>Job Title</label>
                <input required placeholder="e.g. Senior Frontend Engineer" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-field">
                  <label>Location</label>
                  <input placeholder="e.g. Remote / Chennai" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Salary</label>
                  <input placeholder="e.g. 10 LPA" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label>Job Type</label>
                <select value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>
              <div className="form-field">
                <label>Job Description</label>
                <textarea required placeholder="Outline the role, responsibilities, and perks..." style={{ minHeight: 120 }} value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 10 }}>Publish Job Listing →</button>
            </form>
          </motion.div>
        </div>
      )}

      {noteModal && (
        <div className="overlay" style={{ zIndex: 600 }} onClick={e => { if (e.target === e.currentTarget) setNoteModal(null) }}>
          <div className="modal" style={{ padding: 0 }}>
            <div style={{ padding: '24px 28px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Private Note</h3>
                <p style={{ fontSize: '.8rem', color: 'var(--muted)' }}>For {noteModal.name}</p>
              </div>
              <button style={{ width: 30, height: 30, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setNoteModal(null)}><FiX /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveNote(noteModal.student_id, e.target.note.value); }} style={{ padding: 28 }}>
              <textarea name="note" defaultValue={noteModal.note || ''} placeholder="Type your notes here. Only you can see this." style={{ width: '100%', minHeight: 140, padding: 16, border: '2px solid var(--bg2)', borderRadius: 14, fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', marginBottom: 20 }} autoFocus />
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Note</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Student Profile Modal (Read-only view for HR) ── */}
      {selected && (
        <div className="overlay" style={{ overflowY: 'auto', zIndex: 700 }} onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modal" style={{ maxWidth: 840, width: '100%', padding: 0, margin: '40px auto' }}>
            <div style={{ padding: '40px 40px 30px', background: 'linear-gradient(135deg,#0c0a1e,#1e1b4b)', position: 'relative' }}>
              <button style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelected(null)}><FiX size={20} /></button>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div className={`av${(selected.student_id || 1) % 12 + 1}`} style={{ width: 84, height: 84, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
                  {(selected.name || '').split(' ').map(n => n ? n[0] : '').join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>{selected.name}</h2>
                  <div style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>{selected.college} • {selected.degree} ({selected.year})</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <span style={{ background: 'rgba(124,58,237,.2)', color: '#d8b4fe', padding: '4px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700 }}>{selected.domain}</span>
                    {selected.tatti_certified && <span style={{ background: 'rgba(52,211,153,.2)', color: '#6ee7b7', padding: '4px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>TATTI Certified</span>}
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
                  <div style={{ background: 'rgba(15,118,110,.04)', borderLeft: '3px solid var(--teal)', padding: '12px 16px', borderRadius: '0 12px 12px 0' }}>
                    <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.8 }}>{selected.impact}</p>
                  </div>
                )}
                <h3 style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 800, marginBottom: 12, marginTop: 40 }}>Skills & Tech Stack</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selected.skills?.map(sk => <span key={sk} style={{ background: 'var(--bg2)', color: 'var(--ink2)', fontSize: '.8rem', fontWeight: 600, padding: '6px 14px', borderRadius: 10 }}>{sk}</span>)}
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
                          onClick={() => {
                            if (!['contacted', 'interview', 'offer', 'rejected'].includes(selected.stage)) {
                              changeStage(selected.student_id, 'contacted');
                            }
                          }}
                          style={{ marginLeft: 8, color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}
                        >
                          {selected.phone} 📞
                        </a>
                      </div>
                    )}
                    <hr style={{ borderTop: '1px solid var(--bg2)', margin: '4px 0' }} />
                    {selected.linkedin && (
                      <a href={selected.linkedin} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: '#0077b5', color: '#fff', fontWeight: 700, fontSize: '.85rem', textDecoration: 'none' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>
                        View LinkedIn Profile
                      </a>
                    )}
                    {selected.github && <a href={selected.github} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textAlign: 'center' }}>GitHub Repo</a>}
                    {selected.demo && <a href={selected.demo} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textAlign: 'center' }}>Live Demo</a>}
                    {selected.has_resume && (
                      <a href={selected.resume_path ? `http://127.0.0.1:8000/uploads/${selected.resume_path}` : (selected.github ? (selected.github.startsWith('http') ? selected.github : 'https://' + selected.github) : '#')} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', textDecoration: 'none', border: 'none' }}>
                        <FiDownload /> {selected.resume_path ? 'Download CV' : 'Resume / Drive Files'}
                      </a>
                    )}
                    <div style={{ padding: '12px', background: 'var(--bg2)', borderRadius: 12, marginTop: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: 4 }}>Current Stage</div>
                      <div style={{ fontSize: '.9rem', fontWeight: 800, color: STAGES[selected.stage]?.bg }}>{STAGES[selected.stage]?.l}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                      <button
                        onClick={() => changeStage(selected.student_id, 'offer')}
                        style={{ padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(16,185,129,.1)', color: '#10b981', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' }}
                      >
                        Accept / Offer
                      </button>
                      <button
                        onClick={() => changeStage(selected.student_id, 'rejected')}
                        style={{ padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,.1)', color: '#ef4444', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>🔒</div>
                    <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>Contact details are locked until your account is approved.</p>
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
