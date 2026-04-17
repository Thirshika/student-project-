import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAdminStats, fetchHRAccounts, approveHR, fetchAllSubmissions, adminReviewSubmission } from '../services/api';

export default function Admin() {
  const { isHR, hrUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Basic admin check (admin email or hrUser.role === 'admin')
    if (!isHR || (hrUser?.email !== 'admin@tatti.in' && hrUser?.role !== 'admin')) {
      setError("Unauthorized access. Admin privileges required.");
      setLoading(false);
      return;
    }
    loadData();
  }, [isHR, hrUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, accountsRes, subsRes] = await Promise.all([
        fetchAdminStats(),
        fetchHRAccounts(),
        fetchAllSubmissions()
      ]);
      setStats(statsRes.data);
      setAccounts(accountsRes.data.accounts);
      setSubmissions(subsRes.data.submissions);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (email) => {
    try {
      if (!window.confirm(`Approve HR account for ${email}?`)) return;
      
      await approveHR({ hr_email: email, token: hrUser.token });
      alert("Account approved successfully.");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to approve account.");
    }
  };

  const handleAdminReview = async (subId, e) => {
    e.preventDefault();
    const rating = e.target.rating.value;
    const feedback = e.target.feedback.value;
    try {
      await adminReviewSubmission(subId, { rating: parseInt(rating), feedback, token: hrUser?.token });
      alert("Review saved!");
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      alert(errMsg || "Failed to save review");
    }
  };

  if (loading) return <div style={{ padding: '80px', textAlign: 'center' }}>Loading Admin Panel...</div>;
  if (error) return <div style={{ padding: '80px', textAlign: 'center', color: 'red' }}>{error}</div>;

  const pendingAccounts = accounts.filter(a => !a.approved);
  const approvedAccounts = accounts.filter(a => a.approved);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 20 }}>👑 Admin Control Panel</h1>
      
      {/* Stats */}
      {stats && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Students', value: stats.total_students },
            { label: 'Total HR Accounts', value: stats.total_hr },
            { label: 'Pending Approval', value: stats.pending_hr, highlight: stats.pending_hr > 0 },
            { label: 'Approved HRs', value: stats.approved_hr },
            { label: 'Shortlists / Pipeline', value: stats.total_selections }
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: `1px solid ${s.highlight ? '#f87171' : 'var(--border)'}`, padding: '20px', borderRadius: 16, minWidth: 160 }}>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.highlight ? '#ef4444' : 'var(--ink)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Accounts */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>Pending Registrations ({pendingAccounts.length})</h2>
      {pendingAccounts.length === 0 ? (
        <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', marginBottom: 40, color: 'var(--muted)' }}>No pending accounts.</div>
      ) : (
        <div style={{ display: 'grid', gap: 16, marginBottom: 40 }}>
          {pendingAccounts.map(hr => (
            <div key={hr.id} style={{ background: '#fff', border: '1px solid #f87171', padding: 24, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991b1b', marginBottom: 4 }}>{hr.name}</h3>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--muted)' }}>{hr.designation} @ {hr.company}</div>
                <div style={{ fontSize: '.85rem', color: 'var(--ink2)', marginTop: 4 }}>📧 {hr.email}</div>
                {(hr.intent || hr.requirements) && (
                  <div style={{ marginTop: 12, background: 'var(--off)', padding: 12, borderRadius: 8, fontSize: '.85rem' }}>
                    <strong>Intent:</strong> {hr.intent}<br/>
                    <strong>Requirements:</strong> {hr.requirements}
                  </div>
                )}
              </div>
              <button className="btn-primary" style={{ background: '#22c55e', border: 'none' }} onClick={() => handleApprove(hr.email)}>
                Approve Account
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Approved Accounts */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>Approved HR Accounts ({approvedAccounts.length})</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        {approvedAccounts.map(hr => (
          <div key={hr.id} style={{ background: '#fff', border: '1px solid var(--border)', padding: 20, borderRadius: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>{hr.name}</h3>
            <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--muted)' }}>{hr.designation} @ {hr.company}</div>
            <div style={{ fontSize: '.85rem', color: 'var(--ink2)', marginTop: 4 }}>📧 {hr.email}</div>
          </div>
        ))}
      </div>

      {/* Admin Submissions Review */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '40px 0 16px' }}>Challenge Submissions ({submissions.length})</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        {submissions.map(sub => (
          <div key={sub.id} style={{ background: '#fff', border: '1px solid var(--border)', padding: 20, borderRadius: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)' }}>{sub.challenge_title}</h3>
            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: 'var(--muted)' }}>HR: {sub.hr_company} | Student: {sub.student_name}</p>
            <p><strong><a href={sub.upload_url} target="_blank" rel="noreferrer" style={{ color: 'var(--violet)' }}>View Project Submission</a></strong></p>
            <p style={{ margin: '5px 0' }}>Status: <strong>{sub.status}</strong></p>
            
            <form onSubmit={(e) => handleAdminReview(sub.id, e)} style={{ marginTop: '15px', padding: '15px', background: 'var(--off)', borderRadius: 10 }}>
              <h4 style={{ margin: '0 0 10px' }}>Admin Feedback</h4>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <input required name="rating" type="number" min="1" max="5" defaultValue={sub.rating || ''} placeholder="Rating (1-5)" className="form-input" style={{ width: 100 }} />
                <input required name="feedback" type="text" defaultValue={sub.feedback || ''} placeholder="Feedback comments..." className="form-input" style={{ flex: 1 }} />
              </div>
              <button type="submit" className="btn-secondary">Save Review</button>
            </form>
          </div>
        ))}
        {submissions.length === 0 && <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', color: 'var(--muted)' }}>No submissions yet.</div>}
      </div>
    </div>
  );
}
