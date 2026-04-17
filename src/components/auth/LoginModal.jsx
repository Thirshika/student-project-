import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginStudent, registerStudent } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiX, FiBriefcase, FiUser } from 'react-icons/fi';

export default function LoginModal({ mode = 'student', onClose }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAsStudent } = useAuth();

  const handleObj = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (tab === 'login') {
        res = await loginStudent({ email: formData.email, password: formData.password });
        toast.success(`Welcome back, ${res.data.name}! 👋`);
      } else {
        res = await registerStudent(formData);
        toast.success(`Welcome to TalentAtlas, ${res.data.name}! 🎉`);
      }
      loginAsStudent(res.data, mode);
      onClose();
      // Redirect based on mode
      if (mode === 'seeker') {
        navigate('/portal');
      } else {
        navigate('/upload');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSeeker = mode === 'seeker';

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div style={{ padding: '30px 26px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'center', position: 'relative' }}>
          <button style={{ position: 'absolute', top: 15, right: 15, width: 32, height: 32, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}><FiX /></button>
          <div style={{ fontSize: '2.6rem', marginBottom: 10 }}>{isSeeker ? '💼' : '🎓'}</div>
          <h3 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>{isSeeker ? 'Job Seeker Portal' : 'Student Portal'}</h3>
          <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{isSeeker ? 'Sign in to your career dashboard' : 'Sign in to upload and manage your projects'}</p>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button style={{ flex: 1, padding: 13, background: 'none', border: 'none', borderBottom: `3px solid ${tab === 'login' ? 'var(--coral)' : 'transparent'}`, color: tab === 'login' ? 'var(--coral)' : 'var(--muted)', fontWeight: 700 }} onClick={() => setTab('login')}>Sign In</button>
          <button style={{ flex: 1, padding: 13, background: 'none', border: 'none', borderBottom: `3px solid ${tab === 'register' ? 'var(--coral)' : 'transparent'}`, color: tab === 'register' ? 'var(--coral)' : 'var(--muted)', fontWeight: 700 }} onClick={() => setTab('register')}>Register</button>
        </div>

        <form onSubmit={submit} style={{ padding: '22px 28px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && <div style={{ fontSize: '.76rem', color: '#dc2626', padding: '9px 14px', background: 'rgba(220,38,38,.07)', borderRadius: 12 }}>{error}</div>}

          {tab === 'register' && (
            <div className="form-field">
              <label>Full Name</label>
              <input name="name" type="text" placeholder="Your full name" required onChange={handleObj} value={formData.name} />
            </div>
          )}
          <div className="form-field">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="you@college.edu" required onChange={handleObj} value={formData.email} />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input name="password" type="password" placeholder="Min 6 characters" required onChange={handleObj} value={formData.password} minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
            {loading ? '⏳ Processing...' : (
              tab === 'login' 
                ? (isSeeker ? 'Sign In & View Jobs →' : 'Sign In & My Projects →') 
                : (isSeeker ? 'Create Account & Join Portal →' : 'Register & Upload Project →')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
