import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginHR, registerHR } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiBriefcase, FiArrowLeft, FiMail, FiLock, FiUser, FiZap, FiCheckCircle } from 'react-icons/fi';

export default function HRLogin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [formData, setFormData] = useState({ 
    name: '', 
    company: '', 
    designation: '', 
    intent: '', 
    requirements: '', 
    email: '', 
    password: '' 
  });
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
      } else {
        const res = await registerHR(formData);
        loginAsHR(res.data);
        toast.success(`Welcome, ${res.data.name}! Your account is now active. 🚀`, { duration: 6000 });
        navigate('/hr-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active" style={{ 
      minHeight: 'calc(100vh - 70px)', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          maxWidth: 1000, 
          width: '100%', 
          background: '#fff', 
          borderRadius: 32, 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
        }}
        className="stack-mobile"
      >
        {/* Left Side: Branding/Info */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          padding: '60px 48px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15), transparent 70%)' }} />
          
          <button 
            onClick={() => navigate('/talent')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              background: 'rgba(255,255,255,0.1)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', 
              padding: '8px 16px', 
              borderRadius: 12, 
              fontSize: '.85rem', 
              fontWeight: 600,
              cursor: 'pointer',
              alignSelf: 'flex-start',
              marginBottom: 60,
              backdropFilter: 'blur(10px)'
            }}
          >
            <FiArrowLeft /> Back to Directory
          </button>

          <div style={{ fontSize: '3rem', marginBottom: 24 }}>🏢</div>
          <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            HR & Recruiter <span style={{ color: 'var(--secondary)' }}>Portal</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 40 }}>
            Access Tamil Nadu's most talented students. View project work, download resumes, and connect directly with verified candidates.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              'Instant access to verified student profiles',
              'View live project demos and GitHub repos',
              'Direct contact with top talent',
              'Shortlist and manage your pipeline'
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.9rem', color: 'rgba(255,255,255,0.8)' }}>
                <FiCheckCircle style={{ color: 'var(--secondary)', flexShrink: 0 }} /> {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={{ padding: '60px 50px' }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 32, borderBottom: '1px solid #f1f5f9' }}>
            <button 
              onClick={() => setTab('login')}
              style={{ 
                padding: '0 4px 12px', 
                background: 'none', 
                border: 'none', 
                fontSize: '1rem', 
                fontWeight: 700, 
                color: tab === 'login' ? 'var(--ink)' : 'var(--muted)',
                borderBottom: `3px solid ${tab === 'login' ? 'var(--secondary)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button 
              onClick={() => setTab('register')}
              style={{ 
                padding: '0 4px 12px', 
                background: 'none', 
                border: 'none', 
                fontSize: '1rem', 
                fontWeight: 700, 
                color: tab === 'register' ? 'var(--ink)' : 'var(--muted)',
                borderBottom: `3px solid ${tab === 'register' ? 'var(--secondary)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{ 
                background: '#fef2f2', 
                border: '1px solid #fee2e2', 
                color: '#dc2626', 
                padding: '12px 16px', 
                borderRadius: 12, 
                fontSize: '.85rem',
                fontWeight: 500
              }}>
                {error}
              </div>
            )}

            {tab === 'register' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-field-v2">
                    <label>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <FiUser className="input-icon" />
                      <input name="name" type="text" placeholder="John Doe" required onChange={handleObj} value={formData.name} />
                    </div>
                  </div>
                  <div className="form-field-v2">
                    <label>Company Name</label>
                    <div style={{ position: 'relative' }}>
                      <FiBriefcase className="input-icon" />
                      <input name="company" type="text" placeholder="TechCorp Inc." required onChange={handleObj} value={formData.company} />
                    </div>
                  </div>
                </div>

                <div className="form-field-v2">
                  <label>Designation</label>
                  <select name="designation" required onChange={handleObj} value={formData.designation} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 500 }}>
                    <option value="">Select your role</option>
                    <option>HR Manager</option>
                    <option>Talent Acquisition</option>
                    <option>Recruiter</option>
                    <option>Hiring Manager</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-field-v2">
                  <label>Hiring Requirements (Optional)</label>
                  <textarea name="requirements" placeholder="e.g. Seeking Python & React developers for upcoming projects..." onChange={handleObj} value={formData.requirements} style={{ width: '100%', minHeight: 80, padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 500 }}></textarea>
                </div>
              </>
            ) : null}

            <div className="form-field-v2">
              <label>Work Email</label>
              <div style={{ position: 'relative' }}>
                <FiMail className="input-icon" />
                <input name="email" type="email" placeholder="you@company.com" required onChange={handleObj} value={formData.email} />
              </div>
            </div>

            <div className="form-field-v2">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock className="input-icon" />
                <input name="password" type="password" placeholder="••••••••" required onChange={handleObj} value={formData.password} minLength={6} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary" 
              style={{ 
                marginTop: 10, 
                height: 54, 
                fontSize: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 10,
                borderRadius: 14
              }}
            >
              {loading ? 'Processing...' : (tab === 'login' ? <>Sign In Now <FiZap /></> : 'Create HR Account')}
            </button>
            
            <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--muted)', marginTop: 10 }}>
              {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span 
                onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                style={{ color: 'var(--secondary)', fontWeight: 700, cursor: 'pointer' }}
              >
                {tab === 'login' ? 'Register here' : 'Sign in here'}
              </span>
            </p>
          </form>
        </div>
      </motion.div>

      <style>{`
        .form-field-v2 label {
          display: block;
          font-size: .85rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
        }
        .form-field-v2 input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-weight: 500;
          transition: all 0.2s;
        }
        .form-field-v2 input:focus {
          border-color: var(--secondary);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
          outline: none;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 1.1rem;
        }
        @media (max-width: 768px) {
          .stack-mobile {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
