import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiLock, FiBriefcase, FiUser, FiLogOut } from 'react-icons/fi';
import LoginModal from '../auth/LoginModal';
import HRLoginModal from '../auth/HRLoginModal';
import AdminLoginModal from '../auth/AdminLoginModal';
import './Header.css';

export default function Header() {
  const { isStudent, isHR, isAdmin, studentRole, user, hrUser, logoutStudent, logoutHR } = useAuth();
  const navigate = useNavigate();
  const [mobOpen, setMobOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('student'); // 'student' or 'seeker'
  const [showHRLogin, setShowHRLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Talent Directory', path: '/talent' },
    { name: 'Challenges', path: '/challenges' },
    { name: 'About TATTI', path: '/about' },
  ];

  return (
    <>
      <header className="header-main">
        <div className="header-container">
          {/* 1. Left: Logo */}
          <div className="nav-left">
            <div className="logo-wrapper" onClick={() => navigate('/')}>
              <div className="logo-box">TA</div>
              <div>
                <div className="logo-text-main">TalentAtlas</div>
                <div className="logo-text-sub">Powered by TATTI</div>
              </div>
            </div>
          </div>

          {/* 2. Center: Navigation links */}
          <nav className="nav-center">
            {navLinks.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* 3. Right: Action buttons */}
          <div className="nav-right">
            {isHR ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isAdmin ? (
                  <button className="btn-nav btn-nav-primary" onClick={() => navigate('/admin')}>
                    <FiLock /> Admin Panel
                  </button>
                ) : (
                  <button className="btn-nav btn-nav-primary" onClick={() => navigate('/hr-dashboard')}>
                    <FiBriefcase /> {hrUser.name}
                  </button>
                )}
                <button className="btn-nav btn-nav-outline" onClick={() => { logoutHR(); navigate('/'); }}>
                   Sign Out
                </button>
              </div>
            ) : isStudent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {studentRole === 'student' ? (
                   <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--ink)', background: 'var(--bg)', padding: '8px 16px', borderRadius: 20 }}>Student Profile</div>
                ) : (
                  <button className="btn-nav btn-nav-primary" style={{ background: 'var(--secondary)' }} onClick={() => navigate('/portal')}>
                    <FiBriefcase /> Job Finder
                  </button>
                )}
                <button className="btn-nav btn-nav-outline" onClick={() => { logoutStudent(); navigate('/'); }}>
                   Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-nav btn-nav-primary" onClick={() => setShowAdminLogin(true)}>
                  <FiLock /> Admin
                </button>
                <button className="btn-nav btn-nav-primary" onClick={() => setShowHRLogin(true)}>
                  <FiBriefcase /> HR / Recruiter
                </button>
                <button className="btn-nav btn-nav-primary" style={{ background: 'var(--secondary)' }} onClick={() => { setLoginMode('seeker'); setShowLogin(true); }}>
                   Job Seeker
                </button>
                <button className="btn-nav btn-nav-primary" onClick={() => { setLoginMode('student'); setShowLogin(true); }}>
                   Student Login
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="mobile-menu-btn" onClick={() => setMobOpen(true)}>
            <FiMenu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobOpen && (
        <div className="overlay" style={{ alignItems: 'flex-start', justifyContent: 'flex-end', padding: 0 }} onClick={(e) => {if(e.target===e.currentTarget) setMobOpen(false)}}>
          <div style={{ background: '#fff', width: 280, height: '100%', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="logo-box" style={{ width: 36, height: 36 }}>TA</div>
              <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', padding: 10, color: 'var(--ink)' }} onClick={() => setMobOpen(false)}><FiX /></button>
            </div>
            
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} onClick={()=>setMobOpen(false)} style={{padding: '12px 16px', fontWeight:700, borderRadius: 10, color: 'var(--ink)'}} className={({isActive}) => isActive ? 'nav-link active' : ''}>
                {link.name}
              </NavLink>
            ))}
            
            <hr style={{ borderTop: '1px solid var(--border)', margin: '15px 0' }}/>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isHR ? (
                <button className="btn-nav btn-nav-primary" onClick={() => { navigate('/hr-dashboard'); setMobOpen(false) }} style={{ width: '100%', justifyContent: 'center' }}>HR Dashboard</button>
              ) : isStudent ? (
                <>
                  {studentRole === 'student' ? (
                    <div style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--muted)' }}>Student Profile</div>
                  ) : (
                    <button className="btn-nav btn-nav-primary" style={{ background: 'var(--secondary)', width: '100%', justifyContent: 'center' }} onClick={() => { navigate('/portal'); setMobOpen(false) }}>Job Seeker Dashboard</button>
                  )}
                </>
              ) : (
                <>
                  <button className="btn-nav btn-nav-primary" onClick={()=>{setShowAdminLogin(true);setMobOpen(false)}} style={{width: '100%', justifyContent: 'center'}}>Admin Portal</button>
                  <button className="btn-nav btn-nav-primary" onClick={()=>{setShowHRLogin(true);setMobOpen(false)}} style={{width: '100%', justifyContent: 'center'}}>HR / Recruiter</button>
                  <button className="btn-nav btn-nav-primary" style={{ background: 'var(--secondary)', width: '100%', justifyContent: 'center' }} onClick={() => { setLoginMode('seeker'); setShowLogin(true); setMobOpen(false); }}>Job Seeker</button>
                  <button className="btn-nav btn-nav-primary" onClick={() => { setLoginMode('student'); setShowLogin(true); setMobOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>Student Login</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showLogin && <LoginModal mode={loginMode} onClose={() => setShowLogin(false)} />}
      {showHRLogin && <HRLoginModal onClose={() => setShowHRLogin(false)} />}
      {showAdminLogin && <AdminLoginModal onClose={() => setShowAdminLogin(false)} />}
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

