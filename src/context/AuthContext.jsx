import { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // student user
  const [hrUser, setHrUser] = useState(null);       // HR user
  const [studentRole, setStudentRole] = useState(null); // 'student' or 'seeker'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Restore student session
      const sToken = sessionStorage.getItem('ta_token');
      const sRole = sessionStorage.getItem('ta_role');
      if (sToken) {
        try {
          const res = await verifyToken(sToken);
          setUser({ ...res.data, token: sToken });
          setStudentRole(sRole || 'student');
        } catch { 
           sessionStorage.removeItem('ta_token'); 
           sessionStorage.removeItem('ta_role');
        }
      }
      // Restore HR session
      const hToken = sessionStorage.getItem('ta_hr_token');
      if (hToken) {
        try {
          const res = await verifyToken(hToken);
          setHrUser({ ...res.data, token: hToken });
        } catch { sessionStorage.removeItem('ta_hr_token'); }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginAsStudent = (data, role = 'student') => {
    sessionStorage.removeItem('ta_hr_token'); // Ensure HR is logged out
    setHrUser(null);
    sessionStorage.setItem('ta_token', data.token);
    sessionStorage.setItem('ta_role', role);
    setUser(data);
    setStudentRole(role);
  };

  const loginAsHR = (data) => {
    sessionStorage.removeItem('ta_token'); // Ensure student is logged out
    sessionStorage.removeItem('ta_role');
    setUser(null);
    setStudentRole(null);
    sessionStorage.setItem('ta_hr_token', data.token);
    setHrUser(data);
  };

  const logoutStudent = () => {
    sessionStorage.removeItem('ta_token');
    sessionStorage.removeItem('ta_role');
    setUser(null);
    setStudentRole(null);
  };

  const logoutHR = () => {
    sessionStorage.removeItem('ta_hr_token');
    setHrUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, hrUser, loading, studentRole,
      loginAsStudent, loginAsHR,
      logoutStudent, logoutHR,
      isStudent: !!user,
      isHR: !!hrUser,
      isAdmin: hrUser?.role === 'admin' || hrUser?.email === 'admin@tatti.in',
      isApprovedHR: !!hrUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
