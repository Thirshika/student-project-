import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Talent from './pages/Talent';
import Upload from './pages/Upload';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Challenges from './pages/Challenges';

import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/talent" element={<Talent />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/about" element={<About />} />
          <Route path="/hr-dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/portal" element={<StudentDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
