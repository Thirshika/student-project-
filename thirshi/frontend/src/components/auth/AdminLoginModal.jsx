import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginHR } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiX } from 'react-icons/fi';

export default function AdminLoginModal({ onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: 'admin@tatti.in', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAsHR } = useAuth();

  const handleObj = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginHR({ email: formData.email, password: formData.password });
      toast.success(`Welcome back, ${res.data.name}! 🔐`);
      loginAsHR(res.data);
      navigate('/admin');
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ animation: 'scaleIn 0.24s ease' }}>
        <div style={{ padding: '40px 30px 30px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'center', position: 'relative' }}>
          <button style={{ position: 'absolute', top: 15, right: 15, width: 34, height: 34, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={onClose}><FiX /></button>
          
          <div style={{ fontSize: '3rem', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <span style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🔐</span>
          </div>
          
          <h3 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 8 }}>Admin Portal</h3>
          <p style={{ fontSize: '.9rem', color: '#64748b', lineHeight: 1.5, maxWidth: '80%', margin: '0 auto' }}>
            Authorized administrators only. Secure database authentication.
          </p>
        </div>

        <form onSubmit={submit} style={{ padding: '32px' }}>
          {error && <div style={{ fontSize: '.85rem', color: '#dc2626', padding: '12px 16px', background: '#fef2f2', borderRadius: 12, marginBottom: 20, border: '1px solid #fecaca' }}>{error}</div>}

          <div className="form-field" style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6, display: 'block' }}>Admin Email</label>
            <input name="email" type="email" placeholder="admin@tatti.in" required onChange={handleObj} value={formData.email} style={{ width: '100%', padding: '12px 16px', borderRadius: 24, border: '2px solid #cbd5e1', fontSize: '.95rem', color: '#64748b', outline: 'none', transition: 'all 0.2s' }} />
          </div>

          <div className="form-field" style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 6, display: 'block' }}>Password</label>
            <input name="password" type="password" placeholder="Enter your password" required onChange={handleObj} value={formData.password} style={{ width: '100%', padding: '12px 16px', borderRadius: 24, border: '2px solid #cbd5e1', fontSize: '.95rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 24, border: 'none', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)' }}>
            {loading ? '⏳ Verifying...' : '🔐 Access Admin Dashboard →'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: '.85rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>Pre-authorized admin accounts only</p>
            <p style={{ fontSize: '.85rem', color: '#64748b' }}>Contact Sundar Sir for access credentials</p>
          </div>
        </form>
      </div>
    </div>
  );
}
