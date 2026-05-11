import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Folder, FileText, ChevronRight, Edit2, Trash2 } from 'lucide-react';

const ContentManager = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*').order('name');
    if (data) setExams(data);
  };

  const fetchSubjects = async (examId: string) => {
    const { data } = await supabase.from('subjects').select('*').eq('exam_id', examId).order('name');
    if (data) setSubjects(data);
    setChapters([]);
    setTopics([]);
  };

  const fetchChapters = async (subjectId: string) => {
    const { data } = await supabase.from('chapters').select('*').eq('subject_id', subjectId).order('order_index');
    if (data) setChapters(data);
    setTopics([]);
  };

  const fetchTopics = async (chapterId: string) => {
    const { data } = await supabase.from('topics').select('*').eq('chapter_id', chapterId).order('order_index');
    if (data) setTopics(data);
  };

  // Creation logic
  const handleAddExam = async () => {
    const name = window.prompt('Enter Exam Name (e.g. JEE Main):');
    if (name) {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      const { error } = await supabase.from('exams').insert([{ id, name, icon: 'target' }]);
      if (error) {
        alert(`Error adding exam: ${error.message}`);
      } else {
        fetchExams();
      }
    }
  };

  const handleAddSubject = async () => {
    const name = window.prompt('Enter Subject Name:');
    if (name && selectedExam) {
      const id = `sub-${selectedExam}-${name.toLowerCase().replace(/\s+/g, '-')}`;
      const { error } = await supabase.from('subjects').insert([{ id, exam_id: selectedExam, name, icon: 'book' }]);
      if (error) {
        alert(`Error adding subject: ${error.message}`);
      } else {
        fetchSubjects(selectedExam);
      }
    }
  };

  const handleAddChapter = async () => {
    const name = window.prompt('Enter Chapter Name:');
    if (name && selectedSubject) {
      const id = `chap-${selectedSubject}-${name.toLowerCase().replace(/\s+/g, '-')}`;
      const { error } = await supabase.from('chapters').insert([{ 
        id, 
        subject_id: selectedSubject, 
        name, 
        order_index: chapters.length + 1 
      }]);
      if (error) {
        alert(`Error adding chapter: ${error.message}`);
      } else {
        fetchChapters(selectedSubject);
      }
    }
  };

  const handleAddTopic = async () => {
    const name = window.prompt('Enter Topic Name:');
    if (name && selectedChapter) {
      const id = `topic-${selectedChapter}-${name.toLowerCase().replace(/\s+/g, '-')}`;
      const { error } = await supabase.from('topics').insert([{ 
        id, 
        chapter_id: selectedChapter, 
        name, 
        order_index: topics.length + 1 
      }]);
      if (error) {
        alert(`Error adding topic: ${error.message}`);
      } else {
        fetchTopics(selectedChapter);
      }
    }
  };

  const handleDelete = async (table: string, id: string, refreshFn: () => void) => {
    if (window.confirm(`Are you sure you want to delete this ${table.slice(0, -1)}? All nested content will be lost.`)) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        alert(`Error deleting: ${error.message}`);
      } else {
        refreshFn();
      }
    }
  };

  const handleEdit = async (table: string, id: string, currentName: string, refreshFn: () => void) => {
    const newName = window.prompt(`Edit name:`, currentName);
    if (newName && newName !== currentName) {
      const { error } = await supabase.from(table).update({ name: newName }).eq('id', id);
      if (error) {
        alert(`Error updating: ${error.message}`);
      } else {
        refreshFn();
      }
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1>Content Manager</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage the hierarchy of your educational content.</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Exams Column */}
        <div className="glass card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Exams</h3>
            <Plus size={18} className="btn-outline" style={{ cursor: 'pointer' }} onClick={handleAddExam} />
          </div>
          <div className="nav-links">
            {exams.map(e => (
              <div 
                key={e.id} 
                className={`nav-item ${selectedExam === e.id ? 'active' : ''}`}
                onClick={() => { setSelectedExam(e.id); setSelectedSubject(''); fetchSubjects(e.id); }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {e.name}
                </div>
                <div className="actions" style={{ display: 'flex', gap: '4px' }}>
                  <Edit2 size={12} onClick={(e_stop) => { e_stop.stopPropagation(); handleEdit('exams', e.id, e.name, fetchExams); }} />
                  <Trash2 size={12} onClick={(e_stop) => { e_stop.stopPropagation(); handleDelete('exams', e.id, fetchExams); }} />
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Column */}
        <div className="glass card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Subjects</h3>
            {selectedExam && <Plus size={18} className="btn-outline" style={{ cursor: 'pointer' }} onClick={handleAddSubject} />}
          </div>
          <div className="nav-links">
            {subjects.map(s => (
              <div 
                key={s.id} 
                className={`nav-item ${selectedSubject === s.id ? 'active' : ''}`}
                onClick={() => { setSelectedSubject(s.id); setSelectedChapter(''); fetchChapters(s.id); }}
              >
                <Folder size={16} />
                <div style={{ flex: 1 }}>{s.name}</div>
                <div className="actions" style={{ display: 'flex', gap: '4px' }}>
                  <Edit2 size={12} onClick={(e_stop) => { e_stop.stopPropagation(); handleEdit('subjects', s.id, s.name, () => fetchSubjects(selectedExam)); }} />
                  <Trash2 size={12} onClick={(e_stop) => { e_stop.stopPropagation(); handleDelete('subjects', s.id, () => fetchSubjects(selectedExam)); }} />
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
            {!selectedExam && <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Select an Exam</div>}
          </div>
        </div>

        {/* Chapters Column */}
        <div className="glass card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Chapters</h3>
            {selectedSubject && <Plus size={18} className="btn-outline" style={{ cursor: 'pointer' }} onClick={handleAddChapter} />}
          </div>
          <div className="nav-links">
            {chapters.map(c => (
              <div 
                key={c.id} 
                className={`nav-item ${selectedChapter === c.id ? 'active' : ''}`}
                onClick={() => { setSelectedChapter(c.id); fetchTopics(c.id); }}
              >
                <Folder size={16} />
                <div style={{ flex: 1 }}>{c.name}</div>
                <div className="actions" style={{ display: 'flex', gap: '4px' }}>
                  <Edit2 size={12} onClick={(e_stop) => { e_stop.stopPropagation(); handleEdit('chapters', c.id, c.name, () => fetchChapters(selectedSubject)); }} />
                  <Trash2 size={12} onClick={(e_stop) => { e_stop.stopPropagation(); handleDelete('chapters', c.id, () => fetchChapters(selectedSubject)); }} />
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
            {!selectedSubject && <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Select a Subject</div>}
          </div>
        </div>

        {/* Topics Column */}
        <div className="glass card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Topics</h3>
            {selectedChapter && <Plus size={18} className="btn-outline" style={{ cursor: 'pointer' }} onClick={handleAddTopic} />}
          </div>
          <div className="nav-links">
            {topics.map(t => (
              <div key={t.id} className="nav-item">
                <FileText size={16} />
                <div style={{ flex: 1 }}>{t.name}</div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                   <Edit2 size={12} onClick={() => handleEdit('topics', t.id, t.name, () => fetchTopics(selectedChapter))} />
                   <Trash2 size={12} onClick={() => handleDelete('topics', t.id, () => fetchTopics(selectedChapter))} />
                </div>
              </div>
            ))}
            {!selectedChapter && <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Select a Chapter</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManager;
