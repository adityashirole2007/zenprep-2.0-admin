import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  HelpCircle, 
  Settings, 
  Menu,
  X
} from 'lucide-react';
import './index.css';

// Pages
import Dashboard from './pages/Dashboard.tsx';
import ContentManager from './pages/ContentManager.tsx';
import QuestionBank from './pages/QuestionBank.tsx';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar glass" style={{ display: isSidebarOpen ? 'flex' : 'none' }}>
          <div className="logo">
            <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
              <BookOpen color="white" size={24} />
            </div>
            ZenPrep Admin
          </div>
          
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
            <NavLink to="/content" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BookOpen size={20} />
              Content Manager
            </NavLink>
            <NavLink to="/questions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <HelpCircle size={20} />
              Question Bank
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              Settings
            </NavLink>
          </nav>

          <div style={{ marginTop: 'auto' }}>
            <div className="nav-item">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                AD
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Aditya</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Administrator</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
             <button 
               className="btn btn-outline" 
               style={{ padding: '8px' }}
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             >
               {!isSidebarOpen ? <Menu size={20} /> : <X size={20} />}
             </button>
             <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '14px' }}>
               {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </div>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/content" element={<ContentManager />} />
            <Route path="/questions" element={<QuestionBank />} />
            <Route path="/settings" element={<div className="fade-in"><h1>Settings</h1><p style={{marginTop: '20px', color: 'var(--text-muted)'}}>System settings and user management coming soon.</p></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
