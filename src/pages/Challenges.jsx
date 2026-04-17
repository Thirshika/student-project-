import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchChallenges, 
  createChallenge, 
  submitChallenge, 
  fetchChallengeSubmissions, 
  reviewSubmission 
} from '../services/api';
import { FiPlus, FiUploadCloud, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function Challenges() {
  const { isStudent, isHR, isAdmin, user, hrUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // HR state
  const [showCreate, setShowCreate] = useState(false);
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', deadline: '', skills: '' });
  
  // Student state
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [uploadUrl, setUploadUrl] = useState('');

  // Submissions view state
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const res = await fetchChallenges();
      setChallenges(res.data.challenges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createChallenge({
        ...newChallenge,
        token: hrUser?.token,
        skills: newChallenge.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      setShowCreate(false);
      setNewChallenge({ title: '', description: '', deadline: '', skills: '' });
      loadChallenges();
      alert('Challenge created successfully!');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      alert(errMsg || 'Failed to create challenge');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadUrl) return alert("Please provide a link");
    try {
      await submitChallenge(activeChallenge, { upload_url: uploadUrl, token: user?.token });
      setActiveChallenge(null);
      setUploadUrl('');
      alert('Project submitted! HR will review it soon.');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      alert(errMsg || 'Failed to submit project');
    }
  };

  const loadSubmissions = async (challengeId) => {
    try {
      const res = await fetchChallengeSubmissions(challengeId);
      setSubmissions(res.data.submissions);
      setViewingSubmissions(challengeId);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      alert(errMsg || 'Failed to load submissions');
    }
  };

  const handleReview = async (submissionId, status) => {
    try {
      await reviewSubmission(submissionId, { status, token: hrUser?.token });
      // Refresh submissions
      loadSubmissions(viewingSubmissions);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      alert(errMsg || 'Failed to review submission');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading challenges...</div>;

  return (
    <div className="section-inner" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
          Project Challenges
        </h1>
        {isHR && !isAdmin && (
          <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
            <FiPlus /> {showCreate ? 'Cancel' : 'Create Challenge'}
          </button>
        )}
      </div>

      {showCreate && isHR && (
        <form onSubmit={handleCreate} style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>New Challenge</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            <input 
              required className="form-input" placeholder="Challenge Title"
              value={newChallenge.title} onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
            />
            <textarea 
              required className="form-input" placeholder="Description & Requirements" rows={4}
              value={newChallenge.description} onChange={e => setNewChallenge({...newChallenge, description: e.target.value})}
            />
            <div style={{ display: 'flex', gap: '15px' }}>
              <input 
                required type="date" className="form-input" 
                value={newChallenge.deadline} onChange={e => setNewChallenge({...newChallenge, deadline: e.target.value})}
              />
              <input 
                className="form-input" placeholder="Skills (comma separated, e.g., React, Python)"
                value={newChallenge.skills} onChange={e => setNewChallenge({...newChallenge, skills: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-gradient" style={{ justifySelf: 'start' }}>Publish Challenge</button>
          </div>
        </form>
      )}

      {viewingSubmissions ? (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3>Submissions for Challenge #{viewingSubmissions}</h3>
            <button className="btn-secondary" onClick={() => setViewingSubmissions(null)}>Back</button>
          </div>
          {submissions.length === 0 ? <p>No submissions yet.</p> : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {submissions.map(sub => (
                <div key={sub.id} style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px' }}>{sub.student_name}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>
                      <a href={sub.upload_url} target="_blank" rel="noreferrer" style={{ color: 'var(--violet)' }}>View Project</a>
                      {' • '} Status: <strong style={{ 
                        color: sub.status === 'selected' ? 'green' : sub.status === 'rejected' ? 'red' : 'orange' 
                      }}>{sub.status}</strong>
                    </p>
                  </div>
                  {sub.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" style={{color: 'green', borderColor: 'green'}} onClick={() => handleReview(sub.id, 'selected')}><FiCheckCircle /> Select</button>
                      <button className="btn-secondary" style={{color: 'red', borderColor: 'red'}} onClick={() => handleReview(sub.id, 'rejected')}><FiXCircle /> Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {challenges.map(c => (
            <div key={c.id} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem' }}>{c.title}</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--muted)', display: 'flex', gap: '10px' }}>
                    <span>🏢 {c.hr_company}</span>
                    <span>⌛ Deadline: {c.deadline}</span>
                  </div>
                </div>
                {isHR && (
                  <button className="btn-secondary" onClick={() => loadSubmissions(c.id)}>
                    View Submissions
                  </button>
                )}
              </div>
              <p style={{ margin: 0, color: 'var(--text)' }}>{c.description}</p>
              {c.skills && c.skills.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {c.skills.map(s => <span key={s} className="badge-outline">{s}</span>)}
                </div>
              )}
              
              {isStudent && (
                <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                  {activeChallenge === c.id ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        required className="form-input" style={{ flex: 1 }}
                        placeholder="Paste Google Drive, GitHub, or Video link here"
                        value={uploadUrl} onChange={e => setUploadUrl(e.target.value)}
                      />
                      <button type="submit" className="btn-primary"><FiUploadCloud /> Submit</button>
                      <button type="button" className="btn-secondary" onClick={() => setActiveChallenge(null)}>Cancel</button>
                    </form>
                  ) : (
                    <button className="btn-gradient" onClick={() => setActiveChallenge(c.id)}>
                      Accept Challenge
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {challenges.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '16px' }}>
              <p>No challenges available right now.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
