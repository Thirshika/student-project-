import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginHR, registerHR } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiX } from 'react-icons/fi';

export default function HRLoginModal({ onClose }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [formData, setFormData] = useState({ name: '', company: '', designation: '', intent: '', requirements: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAsHR } = useAuth();

  const handleObj = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await loginHR({ email: formData.email, password: formData.password });
        loginAsHR(res.data);
        toast.success(`Welcome back, ${res.data.name}! 🏢`);
        navigate('/hr-dashboard');
        onClose();
      } else {
        const res = await registerHR(formData);
        loginAsHR(res.data);
        if (res.data.approved) {
          toast.success(`Welcome, ${res.data.name}! Your account is active. 🚀`);
        } else {
          toast.success(`Welcome, ${res.data.name}! Your account is now active. You have full access to student details. 🚀`, { duration: 6000 });
        }
        navigate('/hr-dashboard');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" style={{ overflowY: 'auto' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 480, maxHeight: '92vh', overflowY: 'auto', background: '#fff' }}>
        <div style={{ padding: '28px 26px 20px', background: 'linear-gradient(135deg,#0f172a,#1e293b)', textAlign: 'center', position: 'relative' }}>
          <button style={{ position: 'absolute', top: 15, right: 15, width: 32, height: 32, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} onClick={onClose}><FiX /></button>
          <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🏢</div>
          <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>HR / Recruiter Portal</h3>
          <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.65)' }}>Access verified student talent</p>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button style={{ flex: 1, padding: 13, background: 'none', border: 'none', borderBottom: `3px solid ${tab === 'login' ? 'var(--coral)' : 'transparent'}`, color: tab === 'login' ? 'var(--coral)' : 'var(--muted)', fontWeight: 700 }} onClick={() => setTab('login')}>Sign In</button>
          <button style={{ flex: 1, padding: 13, background: 'none', border: 'none', borderBottom: `3px solid ${tab === 'register' ? 'var(--coral)' : 'transparent'}`, color: tab === 'register' ? 'var(--coral)' : 'var(--muted)', fontWeight: 700 }} onClick={() => setTab('register')}>Register</button>
        </div>

        <form onSubmit={submit} style={{ padding: '22px 28px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && <div style={{ fontSize: '.76rem', color: '#dc2626', padding: '9px 14px', background: 'rgba(220,38,38,.07)', borderRadius: 12 }}>{error}</div>}

          {tab === 'register' ? (
            <>
              <div className="form-field"><label>Full Name <span className="req">*</span></label><input name="name" type="text" placeholder="e.g. Priya Sharma" required onChange={handleObj} value={formData.name} /></div>
              <div className="form-field"><label>Company Name <span className="req">*</span></label><input name="company" type="text" placeholder="e.g. Infosys, TCS, Startup XYZ" required onChange={handleObj} value={formData.company} /></div>
              <div className="form-field">
                <label>Designation <span className="req">*</span></label>
                <select name="designation" required onChange={handleObj} value={formData.designation}>
                  <option value="">Select role</option>
                  <option>HR Manager</option>
                  <option>Talent Acquisition</option>
                  <option>Recruiter</option>
                  <option>Hiring Manager</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-field"><label>Hiring Requirements</label><textarea name="requirements" placeholder="e.g. Java, React, Data Science" onChange={handleObj} value={formData.requirements} style={{minHeight:60}}></textarea></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-field"><label>Company Email <span className="req">*</span></label><input name="email" type="email" placeholder="you@company.com" required onChange={handleObj} value={formData.email} /></div>
                <div className="form-field"><label>Password <span className="req">*</span></label><input name="password" type="password" placeholder="Min 6 chars" required onChange={handleObj} value={formData.password} minLength={6} /></div>
              </div>
            </>
          ) : (
            <>
              <div className="form-field"><label>Company Email</label><input name="email" type="email" placeholder="you@company.com" required onChange={handleObj} value={formData.email} /></div>
              <div className="form-field"><label>Password</label><input name="password" type="password" required onChange={handleObj} value={formData.password} /></div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
            {loading ? '⏳ Processing...' : (tab === 'login' ? 'Sign In to Dashboard →' : 'Create HR Account →')}
          </button>
          
        </form>
      </div>
    </div>
  );
}
