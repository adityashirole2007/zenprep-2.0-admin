import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import QuestionEditor from '../components/QuestionEditor';

const QuestionBank = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchQuestions = async () => {
    setLoading(true);
    let allData: any[] = [];
    let from = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('questions')
        .select('*, topics(name)')
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);
      
      if (error || !data) break;
      
      allData = [...allData, ...data];
      if (data.length < limit) {
        hasMore = false;
      } else {
        from += limit;
      }
    }
    
    setQuestions(allData);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (!error) fetchQuestions();
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.topics?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.exam_shift || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.exam_date || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuestions.length / 50);
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * 50, currentPage * 50);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Question Bank</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your exam questions and solutions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedQuestion(null); setIsEditorOpen(true); }}>
          <Plus size={20} />
          Add Question
        </button>
      </div>

      <div className="glass card" style={{ padding: '16px', display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            placeholder="Search questions or topics..." 
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-outline">
          <Filter size={18} />
          Filter
        </button>
      </div>

      <div className="glass card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading questions...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Topic</th>
                <th>Exam Info</th>
                <th>Difficulty</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuestions.map(q => (
                <tr key={q.id}>
                  <td style={{ maxWidth: '400px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.text}
                    </div>
                  </td>
                  <td>{q.topics?.name || 'Unassigned'}</td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{q.exam_date || 'N/A'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{q.exam_shift || '-'}</div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: q.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.2)' : q.difficulty === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: q.difficulty === 'hard' ? '#ef4444' : q.difficulty === 'medium' ? '#f59e0b' : '#10b981'
                    }}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td>{q.type?.toUpperCase()}</td>

                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => { setSelectedQuestion(q); setIsEditorOpen(true); }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => handleDelete(q.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              className="btn btn-outline" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
            <button 
              className="btn btn-outline" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {isEditorOpen && (
        <QuestionEditor 
          question={selectedQuestion} 
          onClose={() => setIsEditorOpen(false)} 
          onSave={() => { setIsEditorOpen(false); fetchQuestions(); }}
        />
      )}
    </div>
  );
};

export default QuestionBank;
