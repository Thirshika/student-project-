import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchJobs, fetchMyApplications, fetchBookmarks, toggleBookmark,
  fetchChallenges, fetchNotifications, fetchMyProfile, updateStudentProfile, uploadResume, applyToJob
} from '../services/api';
import {
  FiHome, FiUser, FiBriefcase, FiSend, FiStar, FiTriangle,
  FiBell, FiCheckCircle, FiClock, FiXCircle, FiTrendingUp,
  FiMapPin, FiDollarSign, FiDownload, FiGlobe, FiGithub, FiLinkedin, FiEdit2, FiMessageSquare, FiInfo, FiFileText, FiX, FiLogOut
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user, isStudent, logoutStudent } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyingJob, setApplyingJob] = useState(null);
  const [applyForm, setApplyForm] = useState({ coverLetter: '' });
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const stats = {
    applied: applications.length,
    shortlisted: applications.filter(a => ['shortlisted', 'selected', 'interview'].includes(a.status)).length,
    pending: applications.filter(a => ['applied', 'review'].includes(a.status)).length
  };

  const getCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.phone) score += 15;
    if (profile.city) score += 10;
    if (profile.skills?.length > 0) score += 20;
    if (profile.experience) score += 20;
    if (profile.resume_path) score += 25;
    if (profile.linkedin || profile.github) score += 10;
    return score;
  };

  const loadData = async () => {
    if (!isStudent || !user?.token) return;
    setLoading(true);
    try {
      const [resJobs, resApps, resBook, resChal, resProf, resNotif] = await Promise.all([
        fetchJobs().catch(() => ({ data: { jobs: [] } })),
        fetchMyApplications().catch(() => ({ data: { applications: [] } })),
        fetchBookmarks().catch(() => ({ data: { bookmarks: [] } })),
        fetchChallenges().catch(() => ({ data: { challenges: [] } })),
        fetchMyProfile(user.token).catch(() => ({ data: null })),
        fetchNotifications().catch(() => ({ data: { notifications: [] } }))
      ]);
      
      setJobs(resJobs?.data?.jobs || []);
      setApplications(resApps?.data?.applications || []);
      setBookmarks(resBook?.data?.bookmarks || []);
      setChallenges(resChal?.data?.challenges || []);
      setProfile(resProf?.data || null);
      setNotifications(resNotif?.data?.notifications || []);
    } catch (err) {
      console.error(err);
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isStudent, user?.token]);

  const handleBookmark = async (id) => {
    try {
      await toggleBookmark(id);
      loadData();
    } catch { toast.error('Bookmark failed'); }
  };

  const openApplyModal = (job) => {
    setApplyingJob(job);
    setApplyForm({ coverLetter: '' });
    setShowApplyModal(true);
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setApplyingJob(null);
    setApplyForm({ coverLetter: '' });
  };

  const submitApplication = async () => {
    if (!applyingJob) return;
    setIsSaving(true);
    try {
      await applyToJob({ token: user.token, job_id: applyingJob.id, cover_letter: applyForm.coverLetter });
      toast.success('Application submitted!');
      closeApplyModal();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Application failed');
    } finally {
      setIsSaving(false);
    }
  };

  const openChallengeModal = (challenge) => {
    setSelectedChallenge(challenge);
    setShowChallengeModal(true);
  };

  const closeChallengeModal = () => {
    setShowChallengeModal(false);
    setSelectedChallenge(null);
  };

  if (!isStudent) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Session Expired</h2>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ width: 280, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '40px 24px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 14, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: 12 }}>
            {user.name[0]}
          </div>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>{user.name}</h3>
          <p style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 600 }}>Student Member</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {[
            { id: 'overview', label: 'Dashboard', icon: <FiHome /> },
            { id: 'profile', label: 'My Profile', icon: <FiUser /> },
            { id: 'jobs', label: 'Find Jobs', icon: <FiBriefcase /> },
            { id: 'bookmarks', label: 'Saved Jobs', icon: <FiStar /> },
            { id: 'applications', label: 'My Apps', icon: <FiSend /> },
            { id: 'challenges', label: 'Challenges', icon: <FiTriangle /> },
            { id: 'notifications', label: 'Alerts', icon: <FiBell /> },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', borderRadius: 12, border: 'none',
                background: activeTab === tab.id ? 'rgba(79,70,229,0.08)' : 'transparent',
                color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                fontWeight: activeTab === tab.id ? 700 : 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>

        <button onClick={() => { logoutStudent(); navigate('/'); }} style={{ marginTop: 'auto', border: 'none', background: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          <FiLogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px 60px', overflowY: 'auto' }}>
        
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <header style={{ marginBottom: 40 }}>
                <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#0f172a' }}>Dashboard <span style={{ color: '#4f46e5' }}>Overview</span></h1>
                <p style={{ color: '#64748b', marginTop: 8 }}>Welcome back! Here's what's happening with your applications.</p>
              </header>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
                {[
                  { label: 'Applied', value: stats.applied, icon: <FiSend />, color: '#6366f1' },
                  { label: 'Shortlisted', value: stats.shortlisted, icon: <FiCheckCircle />, color: '#10b981' },
                  { label: 'Profile Rank', value: `${getCompleteness()}%`, icon: <FiTrendingUp />, color: '#f59e0b' }
                ].map((s, i) => (
                  <div key={i} style={{ padding: 24, background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '.85rem', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{s.value}</div>
                    </div>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{s.icon}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
                <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', padding: 32 }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 24 }}>Recent Job Listings</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {jobs.slice(0, 4).map(j => (
                      <div key={j.id} style={{ padding: 20, background: '#f8fafc', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{j.title}</div>
                          <div style={{ fontSize: '.8rem', color: '#64748b' }}>{j.company} • {j.location}</div>
                        </div>
                        <button onClick={() => setActiveTab('jobs')} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: 10, fontSize: '.8rem', fontWeight: 600, cursor: 'pointer' }}>View Details</button>
                      </div>
                    ))}
                    {jobs.length === 0 && <p style={{ color: '#64748b', textAlign: 'center' }}>Searching for new roles...</p>}
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 24, padding: 32, color: '#fff' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 12 }}>Profile Completeness</h3>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 10, marginBottom: 12 }}>
                    <div style={{ width: `${getCompleteness()}%`, height: '100%', background: '#fff', borderRadius: 10 }}></div>
                  </div>
                  <p style={{ fontSize: '.85rem', lineHeight: 1.6, opacity: 0.9, marginBottom: 24 }}>Complete your profile to unlock premium job recommendations.</p>
                  <button onClick={() => setActiveTab('profile')} style={{ width: '100%', background: '#fff', color: '#4f46e5', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Finish Profile</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <header style={{ marginBottom: 40 }}>
                <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#0f172a' }}>Explore <span style={{ color: '#4f46e5' }}>Jobs</span></h1>
                <p style={{ color: '#64748b' }}>Discover opportunities that match your professional goals.</p>
              </header>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {jobs.map(j => (
                  <div key={j.id} style={{ background: '#fff', padding: 28, borderRadius: 24, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                      <div style={{ width: 44, height: 44, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏢</div>
                      <button onClick={() => handleBookmark(j.id)} style={{ background: 'none', border: 'none', color: bookmarks.find(b => b.id === j.id) ? '#f59e0b' : '#cbd5e1', cursor: 'pointer', fontSize: '1.4rem' }}>
                        <FiStar fill={bookmarks.find(b => b.id === j.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{j.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '.9rem', marginBottom: 20 }}>{j.company} • {j.location}</p>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                      <span style={{ fontSize: '.75rem', padding: '4px 10px', background: '#f1f5f9', borderRadius: 20 }}>{j.type}</span>
                      <span style={{ fontSize: '.75rem', padding: '4px 10px', background: '#f1f5f9', borderRadius: 20 }}>{j.salary}</span>
                    </div>
                    <button className="btn-primary" onClick={() => openApplyModal(j)} style={{ width: '100%', marginTop: 'auto' }}>Apply Now</button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'bookmarks' && (
            <motion.div key="bookmarks" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#0f172a', marginBottom: 32 }}>Saved <span style={{ color: '#4f46e5' }}>Jobs</span></h1>
              {bookmarks.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', background: '#fff', borderRadius: 24, border: '1px dashed #cbd5e1' }}>
                  <p style={{ color: '#64748b' }}>No bookmarked jobs yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                  {bookmarks.map(b => (
                    <div key={b.id} style={{ background: '#fff', padding: 28, borderRadius: 24, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏢</div>
                        <button onClick={() => handleBookmark(b.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.4rem' }}>
                          <FiX />
                        </button>
                      </div>
                      <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{b.title}</h3>
                      <p style={{ color: '#64748b', fontSize: '.9rem', marginBottom: 20 }}>{b.company} • {b.location}</p>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                        <span style={{ fontSize: '.75rem', padding: '4px 10px', background: '#f1f5f9', borderRadius: 20 }}>{b.type}</span>
                        <span style={{ fontSize: '.75rem', padding: '4px 10px', background: '#f1f5f9', borderRadius: 20 }}>{b.salary}</span>
                      </div>
                      <button className="btn-primary" onClick={() => openApplyModal(b)} style={{ width: '100%', marginTop: 'auto' }}>Apply Now</button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {showApplyModal && (
            <motion.div key="apply-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
              <div style={{ width: '100%', maxWidth: 680, background: '#fff', borderRadius: 24, padding: 40, position: 'relative', boxShadow: '0 24px 80px rgba(15,23,42,.18)', my: 'auto' }}>
                <button onClick={closeApplyModal} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '1.4rem' }}><FiX /></button>
                
                {/* Job Header */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Job Details</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12, color: '#0f172a' }}>{applyingJob?.title}</h2>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.95rem', color: '#64748b' }}>
                      <span>🏢</span> {applyingJob?.company}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.95rem', color: '#64748b' }}>
                      <span>📍</span> {applyingJob?.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.95rem', color: '#64748b' }}>
                      <span>💼</span> {applyingJob?.type}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.95rem', color: '#64748b' }}>
                      <span>💰</span> {applyingJob?.salary}
                    </div>
                  </div>
                  <div style={{ padding: 16, background: '#f8fafc', borderRadius: 14, marginBottom: 20 }}>
                    <p style={{ fontSize: '.95rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>{applyingJob?.description}</p>
                  </div>
                </div>

                {/* Requirements & Skills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                  {applyingJob?.requirements && applyingJob.requirements.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '.9rem', fontWeight: 700, color: '#1e293b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requirements</h4>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {applyingJob.requirements.slice(0, 4).map((req, i) => (
                          <li key={i} style={{ fontSize: '.85rem', color: '#64748b', marginBottom: 6 }}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {applyingJob?.skills_needed && applyingJob.skills_needed.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '.9rem', fontWeight: 700, color: '#1e293b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills Needed</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {applyingJob.skills_needed.slice(0, 5).map((skill, i) => (
                          <span key={i} style={{ fontSize: '.8rem', padding: '4px 12px', background: '#4f46e510', color: '#4f46e5', borderRadius: 20, fontWeight: 600 }}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#e2e8f0', marginBottom: 32 }} />

                {/* Application Form */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Your Submission</h4>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#1e293b', fontSize: '.95rem' }}>Cover Letter</label>
                    <textarea value={applyForm.coverLetter} onChange={e => setApplyForm({ ...applyForm, coverLetter: e.target.value })} placeholder="Tell us why you're interested in this role and how your skills match the requirements..." style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                  <p style={{ fontSize: '.8rem', color: '#94a3b8', marginBottom: 24 }}>Make your application stand out. Share your motivation and relevant experience.</p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                  <button onClick={closeApplyModal} style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                  <button onClick={submitApplication} disabled={isSaving} className="btn-primary" style={{ padding: '12px 24px', borderRadius: 12 }}>{isSaving ? '⏳ Submitting...' : '✓ Submit Application'}</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div key="applications" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#0f172a', marginBottom: 32 }}>My <span style={{ color: '#4f46e5' }}>Applications</span></h1>
              {applications.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', background: '#fff', borderRadius: 24, border: '1px dashed #cbd5e1' }}>
                  <p style={{ color: '#64748b', marginBottom: 20 }}>You haven't applied to any jobs yet.</p>
                  <button className="btn-primary" onClick={() => setActiveTab('jobs')}>Browse Jobs →</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {applications.map(app => (
                    <div key={app.id} style={{ background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontWeight: 800, color: '#1e293b' }}>{app.title}</h3>
                        <p style={{ color: '#64748b', fontSize: '.85rem' }}>{app.company} • {app.location}</p>
                        <p style={{ color: '#94a3b8', fontSize: '.75rem', marginTop: 4 }}>Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                        {app.cover_letter ? (
                          <p style={{ color: '#475569', fontSize: '.82rem', marginTop: 10, lineHeight: 1.5 }}>{app.cover_letter.length > 140 ? `${app.cover_letter.slice(0, 140)}...` : app.cover_letter}</p>
                        ) : null}
                      </div>
                      <span style={{
                        padding: '8px 18px', borderRadius: 20, fontSize: '.8rem', fontWeight: 700,
                        background: app.status === 'shortlisted' ? '#dcfce7' : app.status === 'rejected' ? '#fee2e2' : '#f0f9ff',
                        color: app.status === 'shortlisted' ? '#15803d' : app.status === 'rejected' ? '#b91c1c' : '#0369a1'
                      }}>
                        {app.status?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'challenges' && (
            <motion.div key="challenges" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#0f172a', marginBottom: 8 }}>Skill <span style={{ color: '#4f46e5' }}>Challenges</span></h1>
              <p style={{ color: '#64748b', marginBottom: 32 }}>Solve real projects from top companies and boost your hireability.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                {challenges.map(c => (
                  <div key={c.id} style={{ background: '#fff', padding: 28, borderRadius: 24, border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 44, height: 44, background: '#fef3c7', color: '#d97706', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 16 }}>🏆</div>
                    <h3 style={{ fontWeight: 800, marginBottom: 8 }}>{c.title}</h3>
                    <p style={{ fontSize: '.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>{c.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '.75rem', color: '#b45309', fontWeight: 700 }}>Deadline: {c.deadline}</span>
                      <button onClick={() => navigate('/challenges', { state: { challenge: c } })} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '.85rem' }}>Start Challenge</button>
                    </div>
                  </div>
                ))}
                {challenges.length === 0 && <p style={{ color: '#64748b' }}>No challenges available right now.</p>}
              </div>
            </motion.div>
          )}

          {showChallengeModal && (
            <motion.div key="challenge-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
              <div style={{ width: '100%', maxWidth: 680, background: '#fff', borderRadius: 24, padding: 40, position: 'relative', boxShadow: '0 24px 80px rgba(15,23,42,.18)' }}>
                <button onClick={closeChallengeModal} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '1.4rem' }}><FiX /></button>
                
                {/* Challenge Header */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🏆</span> Challenge
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12, color: '#0f172a' }}>{selectedChallenge?.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.95rem', color: '#64748b', marginBottom: 20 }}>
                    <span>📅</span> Deadline: {selectedChallenge?.deadline}
                  </div>
                  <div style={{ padding: 20, background: '#fef3c7', borderRadius: 14, marginBottom: 20 }}>
                    <p style={{ fontSize: '.95rem', lineHeight: 1.6, color: '#92400e', margin: 0 }}>{selectedChallenge?.description}</p>
                  </div>
                </div>

                {/* Challenge Details */}
                <div style={{ marginBottom: 24, padding: 20, background: '#f8fafc', borderRadius: 14 }}>
                  <h4 style={{ fontSize: '.9rem', fontWeight: 700, color: '#1e293b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>About This Challenge</h4>
                  <p style={{ fontSize: '.95rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>This is a real-world project challenge designed to test your skills and expertise. Complete the challenge successfully to boost your hireability and showcase your abilities to recruiters.</p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                  <button onClick={closeChallengeModal} style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>Close</button>
                  <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: 12 }}>🚀 Start Challenge</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#0f172a' }}>My <span style={{ color: '#4f46e5' }}>Profile</span></h1>
                <button onClick={() => setIsEditing(!isEditing)} style={{ padding: '10px 24px', borderRadius: 12, border: '1px solid #4f46e5', background: isEditing ? '#4f46e5' : '#fff', color: isEditing ? '#fff' : '#4f46e5', fontWeight: 700, cursor: 'pointer' }}>
                  {isEditing ? 'Cancel' : '✏️ Edit Profile'}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ background: '#fff', padding: 32, borderRadius: 24, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 20 }}>Personal Info</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div><label style={{ fontSize: '.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label><input disabled value={user.name} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc' }} /></div>
                      <div><label style={{ fontSize: '.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label><input disabled value={user.email || ''} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc' }} /></div>
                      <div><label style={{ fontSize: '.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Phone</label><input disabled={!isEditing} value={profile?.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="Not set" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10 }} /></div>
                      <div><label style={{ fontSize: '.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>City</label><input disabled={!isEditing} value={profile?.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })} placeholder="e.g. Chennai" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10 }} /></div>
                      {profile?.skills && profile.skills.length > 0 && (
                        <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '.8rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>Skills</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{profile.skills.map((s, i) => <span key={i} style={{ fontSize: '.75rem', padding: '4px 10px', background: '#4f46e510', color: '#4f46e5', borderRadius: 20, fontWeight: 600 }}>{s}</span>)}</div></div>
                      )}
                      {profile?.linkedin && <div><label style={{ fontSize: '.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>LinkedIn</label><a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: '.85rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>View Profile →</a></div>}
                      {profile?.github && <div><label style={{ fontSize: '.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>GitHub</label><a href={profile.github} target="_blank" rel="noreferrer" style={{ fontSize: '.85rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>View Profile →</a></div>}
                    </div>
                  </div>
                  {isEditing && (
                    <button onClick={async () => { setIsSaving(true); try { const { updateStudentProfile } = await import('../services/api'); await updateStudentProfile({ token: user.token, ...profile }); toast.success('Profile saved!'); setIsEditing(false); } catch { toast.error('Save failed'); } finally { setIsSaving(false); } }} style={{ padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  )}
                </div>
                <div style={{ background: '#fff', padding: 28, borderRadius: 24, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📄</div>
                  <h4 style={{ fontWeight: 800, marginBottom: 8 }}>Resume</h4>
                  <p style={{ fontSize: '.8rem', color: '#64748b', marginBottom: 20 }}>Upload a PDF for recruiters.</p>
                  {profile?.resume_path && <a href={`http://127.0.0.1:8000/uploads/${profile.resume_path}`} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '10px', marginBottom: 10, background: '#f8fafc', borderRadius: 10, textDecoration: 'none', color: '#4f46e5', fontWeight: 600, fontSize: '.85rem' }}>📥 View Current</a>}
                  <input type="file" id="resume-upload" accept=".pdf" style={{ display: 'none' }} onChange={async (e) => { const file = e.target.files[0]; if (!file) return; setIsSaving(true); try { await uploadResume(file, user.token); toast.success('Resume uploaded!'); loadData(); } catch { toast.error('Upload failed'); } finally { setIsSaving(false); } }} />
                  <button onClick={() => document.getElementById('resume-upload').click()} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }} disabled={isSaving}>{isSaving ? 'Uploading...' : profile?.resume_path ? 'Update Resume' : 'Upload PDF'}</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#0f172a', marginBottom: 32 }}>Recent <span style={{ color: '#4f46e5' }}>Alerts</span></h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 24, border: '1px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>No alerts at this time.</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const isJobNotif = n.type === 'job';
                    const icon = isJobNotif ? '💼' : '🔔';
                    const bgColor = isJobNotif ? '#f0f9ff' : '#f8fafc';
                    return (
                      <div key={n.id} style={{ padding: 20, background: bgColor, borderRadius: 16, border: isJobNotif ? '1px solid #bfdbfe' : '1px solid #e2e8f0', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: isJobNotif ? '#0ea5e910' : '#4f46e510', color: isJobNotif ? '#0ea5e9' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{n.title}</div>
                          <div style={{ fontSize: '.85rem', color: '#64748b', lineHeight: 1.5 }}>{n.message}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
