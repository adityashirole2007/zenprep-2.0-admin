import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Users, HelpCircle, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    exams: 0,
    subjects: 0,
    chapters: 0,
    topics: 0,
    questions: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count: examsCount } = await supabase.from('exams').select('*', { count: 'exact', head: true });
    const { count: subjectsCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true });
    const { count: chaptersCount } = await supabase.from('chapters').select('*', { count: 'exact', head: true });
    const { count: topicsCount } = await supabase.from('topics').select('*', { count: 'exact', head: true });
    const { count: questionsCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });

    setStats({
      exams: examsCount || 0,
      subjects: subjectsCount || 0,
      chapters: chaptersCount || 0,
      topics: topicsCount || 0,
      questions: questionsCount || 0
    });
  };

  return (
    <div className="fade-in">
      <h1>Dashboard Overview</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Welcome back, Aditya. Here's what's happening with ZenPrep.</p>

      <div className="stats-grid" style={{ marginTop: '40px' }}>
        <div className="glass stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-label">Subjects</div>
            <BookOpen size={20} color="var(--primary)" />
          </div>
          <div className="stat-value">{stats.subjects}</div>
        </div>
        <div className="glass stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-label">Chapters</div>
            <Activity size={20} color="var(--accent)" />
          </div>
          <div className="stat-value">{stats.chapters}</div>
        </div>
        <div className="glass stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-label">Topics</div>
            <Users size={20} color="var(--success)" />
          </div>
          <div className="stat-value">{stats.topics}</div>
        </div>
        <div className="glass stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="stat-label">Questions</div>
            <HelpCircle size={20} color="var(--danger)" />
          </div>
          <div className="stat-value">{stats.questions.toLocaleString()}</div>
        </div>
      </div>

      <div className="glass card">
        <h3>Recent Activity</h3>
        <div style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '40px' }}>
          Activity logs will appear here as you manage content.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
