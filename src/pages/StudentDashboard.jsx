import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchJobs, applyToJob, fetchMyApplications, toggleBookmark, fetchBookmarks,
  fetchChallenges, fetchStudent, submitProject, updateStudentProfile, uploadResume
} from '../services/api';
import {
  FiHome, FiUser, FiBriefcase, FiSend, FiStar, FiTriangle,
  FiBell, FiCheckCircle, FiClock, FiXCircle, FiTrendingUp,
  FiMapPin, FiDollarSign, FiClock as FiTime, FiDownload, FiGlobe, FiGithub, FiLinkedin, FiEdit2, FiMessageSquare, FiInfo, FiLayers, FiFileText
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [applyingJob, setApplyingJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ coverLetter: '', resumeUpdate: null });

  // Stats
  const stats = {
    applied: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    pending: applications.filter(a => a.status === 'applied' || a.status === 'review').length
  };

  // Profile Completeness
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
    if (!isStudent) return;
    setLoading(true);
    try {
      const [resJobs, resApps, resBook, resChal, resProf] = await Promise.all([
        fetchJobs(),
        fetchMyApplications(user.token),
        fetchBookmarks(user.token),
        fetchChallenges(),
        fetchStudent(user.uid).catch(() => ({ data: null }))
      ]);
      setJobs(resJobs.data.jobs);
      setApplications(resApps.data.applications);
      setBookmarks(resBook.data.bookmarks);
      setChallenges(resChal.data.challenges);
      setProfile(resProf.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isStudent]);

  const handleApplyInit = (job) => {
    setApplyingJob(job);
    setShowApplyModal(true);
    setApplyForm({ coverLetter: `I am interested in the ${job.title} position at ${job.company}. I believe my skills match the requirements perfectly.`, resumeUpdate: null });
  };

  const submitApp = async () => {
    try {
      await applyToJob({
        token: user.token,
        job_id: applyingJob.id,
        cover_letter: applyForm.coverLetter
      });
      toast.success('Application submitted successfully! 🚀');
      setShowApplyModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Application failed');
    }
  };

  const handleBookmark = async (jobId) => {
    try {
      await toggleBookmark(user.token, jobId);
      loadData();
    } catch {
      toast.error('Bookmark update failed.');
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateStudentProfile({
        token: user.token,
        ...profile
      });
      toast.success('Profile updated successfully! ✨');
      setIsEditing(false);
      loadData();
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', user.token);

    setIsSaving(true);
    try {
      await uploadResume(profile.id, formData);
      toast.success('Resume uploaded! 📄');
      loadData();
    } catch {
      toast.error('Failed to upload resume.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isStudent) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Student Login Required</h2>
          <p style={{ color: 'var(--muted)', marginTop: 10 }}>Please access your student portal to view this page.</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'projects', label: 'My Projects', icon: <FiLayers /> },
    { id: 'overview', label: 'Overview', icon: <FiHome /> },
    { id: 'profile', label: 'My Profile', icon: <FiUser /> },
    { id: 'jobs', label: 'Find Jobs', icon: <FiBriefcase /> },
    { id: 'applications', label: 'Applications', icon: <FiSend /> },
    { id: 'challenges', label: 'Challenges', icon: <FiTriangle /> },
    { id: 'saved', label: 'Saved Jobs', icon: <FiStar /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
  ];

  const handleTabClick = (id) => {
    if (id === 'projects') {
      navigate('/upload');
      return;
    }
    setActiveTab(id);
  };

  return (
    <div className="page active" style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 260, background: '#fff', borderRight: '1px solid var(--border)', padding: '32px 16px', position: 'sticky', top: 70, height: 'calc(100vh - 70px)' }}>
        <div style={{ padding: '0 16px 24px', borderBottom: '1px solid var(--bg2)', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--grad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', marginBottom: 12 }}>
            {user.name[0]}
          </div>
          <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{user.name}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Student Participant</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => handleTabClick(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: 'none',
                background: activeTab === s.id ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                color: activeTab === s.id ? 'var(--violet)' : 'var(--muted)',
                fontWeight: activeTab === s.id ? 700 : 600,
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
              }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '40px' }}>
        <AnimatePresence mode="wait">

          {/* OVERVIEW SECTION */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div style={{ marginBottom: 40 }}>
                <h1 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 800 }}>Welcome back, <span style={{ color: 'var(--violet)' }}>{user.name.split(' ')[0]}!</span></h1>
                <p style={{ color: 'var(--muted)', marginTop: 8 }}>Track your career progress and explore new opportunities.</p>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
                {[
                  { label: 'Jobs Applied', value: stats.applied, icon: <FiSend />, color: '#6366f1' },
                  { label: 'Shortlisted', value: stats.shortlisted, icon: <FiCheckCircle />, color: '#10b981' },
                  { label: 'Pending Review', value: stats.pending, icon: <FiClock />, color: '#f59e0b' }
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800 }}>{s.value}</div>
                    </div>
                    <div style={{ width: 50, height: 50, borderRadius: 12, background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                      {s.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity / Profile Progress */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
                <div className="card" style={{ padding: 32 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 24 }}>Recommended Jobs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {jobs.slice(0, 3).map(j => (
                      <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--bg2)', borderRadius: 16 }}>
                        <div>
                          <div style={{ fontWeight: 800 }}>{j.title}</div>
                          <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{j.company} • {j.location}</div>
                        </div>
                        <button className="btn-secondary" onClick={() => setActiveTab('jobs')} style={{ padding: '6px 14px', fontSize: '.8rem' }}>View Details</button>
                      </div>
                    ))}
                    {jobs.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center' }}>No jobs available right now.</p>}
                  </div>
                </div>

                <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 12 }}>Profile Completeness</h3>
                  <div style={{ height: 10, background: 'rgba(255,255,255,.2)', borderRadius: 10, marginBottom: 4 }}>
                    <div style={{ width: `${getCompleteness()}%`, height: '100%', background: '#fff', borderRadius: 10, boxShadow: '0 0 10px rgba(255,255,255,.5)', transition: 'width 0.5s ease' }}></div>
                  </div>
                  <div style={{ fontSize: '.75rem', fontWeight: 700, textAlign: 'right', marginBottom: 12 }}>{getCompleteness()}% Complete</div>
                  <p style={{ fontSize: '.85rem', lineHeight: 1.5, opacity: 0.9 }}>Add your resume and skills to stand out to recruiters and increase your hireability ranking.</p>
                  <button onClick={() => setActiveTab('profile')} style={{ width: '100%', marginTop: 20, padding: '10px', borderRadius: 12, border: 'none', background: '#fff', color: 'var(--violet)', fontWeight: 700, cursor: 'pointer' }}>Complete Profile</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* JOBS SECTION */}
          {activeTab === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <div>
                  <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800 }}>Explore <span style={{ color: 'var(--secondary)' }}>Opportunities</span></h2>
                  <p style={{ color: 'var(--muted)' }}>Browse and apply to the best roles matching your profile.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <select className="select-modern" style={{ fontSize: '.85rem' }}><option>All Locations</option></select>
                  <select className="select-modern" style={{ fontSize: '.85rem' }}><option>All Types</option></select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {jobs.map(j => (
                  <div key={j.id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, background: 'var(--bg2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏢</div>
                      <button
                        onClick={() => handleBookmark(j.id)}
                        style={{ background: 'none', border: 'none', color: bookmarks.find(b => b.id === j.id) ? 'var(--secondary)' : 'var(--muted)', fontSize: '1.2rem', cursor: 'pointer' }}
                      >
                        <FiStar fill={bookmarks.find(b => b.id === j.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>{j.title}</h3>
                    <div style={{ fontSize: '.9rem', color: 'var(--muted)', fontWeight: 600, marginBottom: 16 }}>{j.company}</div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      <span style={{ fontSize: '.75rem', padding: '4px 10px', background: 'var(--bg2)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin /> {j.location}</span>
                      <span style={{ fontSize: '.75rem', padding: '4px 10px', background: 'var(--bg2)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}><FiTime /> {j.type}</span>
                      <span style={{ fontSize: '.75rem', padding: '4px 10px', background: 'var(--bg2)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}><FiDollarSign /> {j.salary}</span>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <button
                        disabled={applications.find(a => a.job_id === j.id)}
                        className="btn-primary"
                        style={{ width: '100%', padding: '12px', background: applications.find(a => a.job_id === j.id) ? 'var(--muted)' : 'var(--grad)' }}
                        onClick={() => handleApplyInit(j)}
                      >
                        {applications.find(a => a.job_id === j.id) ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PROFILE SECTION */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
                <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800 }}>My <span style={{ color: 'var(--secondary)' }}>Profile</span></h2>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary" onClick={() => { setIsEditing(false); loadData(); }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                ) : (
                  <button className="btn-secondary" onClick={() => setIsEditing(true)} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <FiEdit2 /> Edit Profile
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Info Card */}
                  <div className="card" style={{ padding: 32 }}>
                    <h4 style={{ textTransform: 'uppercase', fontSize: '.75rem', letterSpacing: 1, color: 'var(--muted)', marginBottom: 20 }}>Personal Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div className="form-field"><label>Full Name</label><input disabled value={user.name} /></div>
                      <div className="form-field"><label>Email Address</label><input disabled value={user.email} /></div>
                      <div className="form-field">
                        <label>Phone</label>
                        <input
                          placeholder="Not set"
                          disabled={!isEditing}
                          value={profile?.phone || ''}
                          onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Location (City)</label>
                        <input
                          placeholder="e.g. Chennai"
                          disabled={!isEditing}
                          value={profile?.city || ''}
                          onChange={e => setProfile({ ...profile, city: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: 32 }}>
                    <h4 style={{ textTransform: 'uppercase', fontSize: '.75rem', letterSpacing: 1, color: 'var(--muted)', marginBottom: 20 }}>Professional Links</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div className="form-field">
                        <label>LinkedIn</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <FiLinkedin style={{ marginTop: 14 }} />
                          <input
                            placeholder="linkedin.com/in/..."
                            disabled={!isEditing}
                            value={profile?.linkedin || ''}
                            onChange={e => setProfile({ ...profile, linkedin: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-field">
                        <label>GitHub</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <FiGithub style={{ marginTop: 14 }} />
                          <input
                            placeholder="github.com/..."
                            disabled={!isEditing}
                            value={profile?.github || ''}
                            onChange={e => setProfile({ ...profile, github: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-field">
                        <label>Portfolio URL</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <FiGlobe style={{ marginTop: 14 }} />
                          <input
                            placeholder="yourportfolio.com"
                            disabled={!isEditing}
                            value={profile?.portfolio_url || ''}
                            onChange={e => setProfile({ ...profile, portfolio_url: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: 32 }}>
                    <h4 style={{ textTransform: 'uppercase', fontSize: '.75rem', letterSpacing: 1, color: 'var(--muted)', marginBottom: 20 }}>Education & Experience</h4>
                    <div className="form-field">
                      <label>Experience / Project Highlights</label>
                      <textarea
                        placeholder="Tell us about your background..."
                        style={{ minHeight: 100 }}
                        disabled={!isEditing}
                        value={profile?.experience || ''}
                        onChange={e => setProfile({ ...profile, experience: e.target.value })}
                      />
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <label style={{ fontSize: '.85rem', fontWeight: 700, display: 'block', marginBottom: 8 }}>Top Skills</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {profile?.skills?.map((s, i) => (
                          <span key={i} style={{ padding: '6px 14px', background: 'var(--bg2)', borderRadius: 10, fontSize: '.85rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                            {s}
                            {isEditing && <FiXCircle style={{ cursor: 'pointer' }} onClick={() => setProfile({ ...profile, skills: profile.skills.filter((_, idx) => idx !== i) })} />}
                          </span>
                        ))}
                        {isEditing && (
                          <button
                            onClick={() => {
                              const s = prompt('Enter new skill:');
                              if (s) setProfile({ ...profile, skills: [...(profile.skills || []), s] });
                            }}
                            style={{ padding: '6px 14px', border: '1px dashed var(--muted)', borderRadius: 10, background: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer' }}
                          >
                            + Add Skill
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📄</div>
                    <h4 style={{ fontWeight: 800, marginBottom: 8 }}>My Resume</h4>
                    <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: 20 }}>Upload a PDF resume for recruiters to review.</p>

                    {profile?.resume_path && (
                      <a
                        href={`http://127.0.0.1:8000/uploads/${profile.resume_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ width: '100%', marginBottom: 10, textDecoration: 'none', display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}
                      >
                        <FiDownload /> View Current
                      </a>
                    )}

                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={e => handleResumeUpload(e.target.files[0])}
                    />
                    <button
                      className="btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => document.getElementById('resume-upload').click()}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Uploading...' : (profile?.resume_path ? 'Update Resume' : 'Upload PDF')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* APPLICATIONS TRACKER SECTION */}
          {activeTab === 'applications' && (
            <motion.div key="applications" initial={{ opacity: 0 }}>
              <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32 }}>Application <span style={{ color: 'var(--secondary)' }}>Tracker</span></h2>

              {applications.length === 0 ? (
                <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                  <p style={{ color: 'var(--muted)' }}>You haven't applied to any jobs yet.</p>
                  <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => setActiveTab('jobs')}>Browse Jobs →</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {applications.map(app => (
                    <div key={app.id} className="card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr auto 200px', alignItems: 'center', gap: 32 }}>
                      <div>
                        <h3 style={{ fontWeight: 800 }}>{app.title}</h3>
                        <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{app.company} • {app.location}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 4 }}>Applied on {new Date(app.applied_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        {['Applied', 'Under Review', 'Selected'].map((step, i) => {
                          const stages = { applied: 0, review: 1, shortlisted: 2, rejected: -1 };
                          const currentIdx = stages[app.status] ?? 0;
                          const isDone = i <= currentIdx;
                          const isCurrent = i === currentIdx;
                          const isRejected = app.status === 'rejected' && i === currentIdx;

                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 12, height: 12, borderRadius: '50%', background: isRejected ? '#ef4444' : (isDone ? 'var(--violet)' : 'var(--bg2)'), position: 'relative' }}>
                                {isCurrent && !isRejected && <div style={{ position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, border: '2px solid var(--violet)', borderRadius: '50%', animation: 'ping 1.5s infinite' }}></div>}
                              </div>
                              <span style={{ fontSize: '.7rem', fontWeight: isDone ? 700 : 500, color: isDone ? 'var(--violet)' : 'var(--muted)' }}>{step}</span>
                              {i < 2 && <div style={{ width: 24, height: 2, background: (isDone && i < currentIdx) ? 'var(--violet)' : 'var(--bg2)' }}></div>}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <span style={{
                          padding: '6px 14px', borderRadius: 20, fontSize: '.8rem', fontWeight: 700,
                          background: app.status === 'rejected' ? '#fee2e2' : (app.status === 'shortlisted' ? '#dcfce7' : '#f0f9ff'),
                          color: app.status === 'rejected' ? '#b91c1c' : (app.status === 'shortlisted' ? '#15803d' : '#0369a1')
                        }}>
                          {app.status === 'shortlisted' ? 'Direct Selection' : app.status[0].toUpperCase() + app.status.slice(1).replace('_', ' ')}
                        </span>
                        <button className="btn-secondary" style={{ padding: '6px', borderRadius: 8 }} title="Chat with HR"><FiMessageSquare /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* CHALLENGES tab */}
          {activeTab === 'challenges' && (
            <motion.div key="challenges" initial={{ opacity: 0 }}>
              <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Skill <span style={{ color: 'var(--secondary)' }}>Challenges</span></h2>
              <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Solve projects from top companies and increase your hireability ranking.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                {challenges.map(c => (
                  <div key={c.id} className="card" style={{ padding: 24 }}>
                    <div style={{ width: 44, height: 44, background: '#fef3c7', color: '#d97706', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 16 }}>🏆</div>
                    <h3 style={{ fontWeight: 800, marginBottom: 8 }}>{c.title}</h3>
                    <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.5, height: 45, overflow: 'hidden' }}>{c.description}</p>
                    <hr style={{ borderTop: '1px solid var(--bg2)', margin: '16px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '.75rem', color: '#b45309', fontWeight: 700 }}>Deadline: {c.deadline}</span>
                      <button className="btn-secondary" style={{ padding: '6px 14px' }}>View Project</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeTab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0 }}>
              <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32 }}>Active <span style={{ color: 'var(--secondary)' }}>Alerts</span></h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { t: 'Application Update', m: 'TechCorp viewed your application for Junior React Developer.', time: '2 hours ago', icon: <FiInfo />, color: '#3b82f6' },
                  { t: 'New Message', m: 'HR from CreativeBox sent you a message regarding your portfolio.', time: '5 hours ago', icon: <FiMessageSquare />, color: '#10b981' },
                  { t: 'New Job Alert', m: 'A new Python Intern role was posted by DataStream.', time: '1 day ago', icon: <FiBell />, color: '#f59e0b' }
                ].map((n, i) => (
                  <div key={i} className="card" style={{ padding: '16px 24px', display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: n.color + '15', color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '.95rem' }}>{n.t}</div>
                      <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{n.m}</div>
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}


        </AnimatePresence>
      </main>

      {/* ── APPLY MODAL ── */}
      {showApplyModal && applyingJob && (
        <div className="overlay" style={{ zIndex: 900 }} onClick={e => e.target === e.currentTarget && setShowApplyModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal" style={{ width: 500 }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--bg2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800 }}>Apply for {applyingJob.title}</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.4rem' }} onClick={() => setShowApplyModal(false)}><FiX /></button>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ padding: 12, background: 'var(--bg2)', borderRadius: 10, fontSize: '.8rem', color: 'var(--muted)', marginBottom: 20, display: 'flex', gap: 10 }}>
                <FiInfo style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Your profile (Name, Email, Phone) will be automatically shared with <strong>{applyingJob.company}</strong>.</span>
              </div>

              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>Cover Letter (Optional)</label>
                <textarea
                  value={applyForm.coverLetter}
                  onChange={e => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                  placeholder="Why should we hire you?" style={{ minHeight: 120 }}
                />
              </div>

              <div className="form-field" style={{ marginBottom: 24 }}>
                <label>Update Resume for this job? (Optional)</label>
                <div style={{ border: '2px dashed var(--bg2)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer' }}>
                  <FiDownload size={20} style={{ color: 'var(--muted)' }} />
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 8 }}>Click to upload new PDF version</div>
                </div>
              </div>

              <button className="btn-primary" style={{ width: '100%' }} onClick={submitApp}>Send Application →</button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .select-modern { padding: 8px 14px; border-radius: 10px; border: 1px solid var(--border); background: #fff; font-weight: 600; outline: none; }
        @keyframes ping {
           0% { transform: scale(1); opacity: 0.8; }
           100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
