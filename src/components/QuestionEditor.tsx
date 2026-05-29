import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, Save, Trash2 } from 'lucide-react';

interface QuestionEditorProps {
  question?: any;
  onClose: () => void;
  onSave: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onClose, onSave }) => {
  const isEditing = !!question?.id;
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState(isEditing ? '' : (localStorage.getItem('last_exam') || ''));
  const [selectedSubject, setSelectedSubject] = useState(isEditing ? '' : (localStorage.getItem('last_subject') || ''));
  const [selectedChapter, setSelectedChapter] = useState(isEditing ? '' : (localStorage.getItem('last_chapter') || ''));

  const [formData, setFormData] = useState({
    topic_id: question?.topic_id || (!isEditing ? localStorage.getItem('last_topic') : '') || '',
    difficulty: question?.difficulty || (!isEditing ? localStorage.getItem('last_difficulty') : '') || 'Medium',
    type: question?.type || (!isEditing ? localStorage.getItem('last_type') : '') || 'mcq',
    exam_date: question?.exam_date || (!isEditing ? localStorage.getItem('last_exam_date') : '') || '',
    exam_shift: question?.exam_shift || (!isEditing ? localStorage.getItem('last_exam_shift') : '') || '',
    text: question?.text || '',
    correct_answer: question?.correct_answer || '',
    question_image_base64: question?.question_image_url || '',
    solution_text: question?.solution_text || '',
    solution_image_base64: question?.solution_image_url || '',
    options: (question?.options && Array.isArray(question.options)) 
      ? question.options.map((opt: any) => typeof opt === 'string' ? { text: opt, image_base64: '' } : opt)
      : [{ text: '', image_base64: '' }, { text: '', image_base64: '' }, { text: '', image_base64: '' }, { text: '', image_base64: '' }],
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const [examsRes, subjectsRes, chaptersRes, topicsRes] = await Promise.all([
      supabase.from('exams').select('*').order('name'),
      supabase.from('subjects').select('*').order('name'),
      supabase.from('chapters').select('*').order('name'),
      supabase.from('topics').select('*').order('name')
    ]);

    if (examsRes.data) setExams(examsRes.data);
    if (subjectsRes.data) setSubjects(subjectsRes.data);
    if (chaptersRes.data) setChapters(chaptersRes.data);
    if (topicsRes.data) setTopics(topicsRes.data);

    // If editing, find the hierarchy
    if (question?.topic_id && topicsRes.data && chaptersRes.data && subjectsRes.data) {
      const topic = topicsRes.data.find((t: any) => t.id === question.topic_id);
      if (topic) {
        setSelectedChapter(topic.chapter_id);
        const chapter = chaptersRes.data.find((c: any) => c.id === topic.chapter_id);
        if (chapter) {
          setSelectedSubject(chapter.subject_id);
          const subject = subjectsRes.data.find((s: any) => s.id === chapter.subject_id);
          if (subject) {
            setSelectedExam(subject.exam_id);
          }
        }
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, optionIndex?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (optionIndex !== undefined) {
          const newOptions = [...formData.options];
          newOptions[optionIndex] = { ...newOptions[optionIndex], image_base64: result };
          setFormData({ ...formData, options: newOptions });
        } else {
          setFormData({ ...formData, [field]: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...formData,
      difficulty: formData.difficulty.toLowerCase(),
      has_diagram: !!formData.question_image_base64 || formData.options.some((opt: any) => opt.image_base64),
      exam_date: formData.exam_date || null,
      exam_shift: formData.exam_shift || null,
      question_image_url: formData.question_image_base64,
      solution_image_url: formData.solution_image_base64,
    };

    delete payload.question_image_base64;
    delete payload.solution_image_base64;

    // If type is not mcq, clear options
    if (payload.type !== 'mcq') {
      payload.options = null;
    }

    if (question?.id) {
      const { error } = await supabase.from('questions').update(payload).eq('id', question.id);
      if (!error) onSave();
      else alert(`Error updating question: ${error.message}`);
    } else {
      // Explicitly generate ID to avoid "null value in column id" errors
      const { error } = await supabase.from('questions').insert([{
        ...payload,
        id: crypto.randomUUID()
      }]);
      
      if (!error) {
        localStorage.setItem('last_exam', selectedExam);
        localStorage.setItem('last_subject', selectedSubject);
        localStorage.setItem('last_chapter', selectedChapter);
        localStorage.setItem('last_topic', formData.topic_id);
        localStorage.setItem('last_difficulty', formData.difficulty);
        localStorage.setItem('last_type', formData.type);
        localStorage.setItem('last_exam_date', formData.exam_date || '');
        localStorage.setItem('last_exam_shift', formData.exam_shift || '');
        onSave();
      }
      else alert(`Error adding question: ${error.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal glass fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2>{question ? 'Edit Question' : 'Add New Question'}</h2>
          <button className="btn btn-outline" type="button" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="editor-grid">
          <div className="form-group">
            <label>Select Exam</label>
            <select 
              value={selectedExam} 
              onChange={e => {
                setSelectedExam(e.target.value);
                setSelectedSubject('');
                setFormData({ ...formData, topic_id: '' });
              }}
              required
            >
              <option value="">Choose Exam</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Select Subject</label>
            <select 
              value={selectedSubject} 
              onChange={e => {
                setSelectedSubject(e.target.value);
                setSelectedChapter('');
                setFormData({ ...formData, topic_id: '' });
              }}
              required
              disabled={!selectedExam}
            >
              <option value="">Choose Subject</option>
              {subjects
                .filter(s => s.exam_id === selectedExam)
                .map(s => <option key={s.id} value={s.id}>{s.name}</option>)
              }
            </select>
          </div>

          <div className="form-group">
            <label>Select Chapter</label>
            <select 
              value={selectedChapter} 
              onChange={e => {
                setSelectedChapter(e.target.value);
                setFormData({ ...formData, topic_id: '' });
              }}
              required
              disabled={!selectedSubject}
            >
              <option value="">Choose Chapter</option>
              {chapters
                .filter(c => c.subject_id === selectedSubject)
                .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              }
            </select>
          </div>

          <div className="form-group">
            <label>Select Topic</label>
            <select 
              value={formData.topic_id} 
              onChange={e => setFormData({ ...formData, topic_id: e.target.value })}
              required
              disabled={!selectedChapter}
            >
              <option value="">Choose Topic</option>
              {topics
                .filter(t => t.chapter_id === selectedChapter)
                .map(t => <option key={t.id} value={t.id}>{t.name}</option>)
              }
            </select>
          </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select 
                value={formData.difficulty} 
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Exam Date</label>
              <input 
                type="date"
                value={formData.exam_date} 
                onChange={e => setFormData({ ...formData, exam_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Exam Shift</label>
              <input 
                placeholder="e.g. Shift 1"
                value={formData.exam_shift} 
                onChange={e => setFormData({ ...formData, exam_shift: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Question Type</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="mcq">MCQ</option>
                <option value="numeric">Integer / Numeric</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Question Text</label>
            <textarea 
              rows={4} 
              value={formData.text} 
              onChange={e => setFormData({ ...formData, text: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Question Image (Optional)</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
                <Upload size={18} />
                Upload Image
                <input type="file" hidden onChange={e => handleImageUpload(e, 'question_image_base64')} accept="image/*" />
              </label>
              {formData.question_image_base64 && (
                <button type="button" className="btn btn-danger" onClick={() => setFormData({...formData, question_image_base64: ''})}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            {formData.question_image_base64 && <img src={formData.question_image_base64} className="image-preview" alt="Preview" />}
          </div>

          {formData.type === 'mcq' && (
            <div className="form-group">
              <label>Options (Text & Images)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {formData.options.map((opt: any, i: number) => (
                  <div key={i} className="glass" style={{ padding: '12px', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                       <label style={{ margin: 0 }}>Option {String.fromCharCode(65 + i)}</label>
                       <label style={{ cursor: 'pointer' }}>
                         <Upload size={14} color="var(--primary)" />
                         <input type="file" hidden onChange={e => handleImageUpload(e, '', i)} accept="image/*" />
                       </label>
                    </div>
                    <input 
                      placeholder={`Option ${String.fromCharCode(65 + i)} Text`}
                      value={opt.text}
                      onChange={e => handleOptionChange(i, e.target.value)}
                      style={{ marginBottom: opt.image_base64 ? '8px' : '0' }}
                    />
                    {opt.image_base64 && (
                      <div style={{ position: 'relative' }}>
                        <img src={opt.image_base64} style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '4px' }} alt="Opt" />
                        <button 
                          type="button" 
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--danger)', border: 'none', borderRadius: '4px', padding: '2px' }}
                          onClick={() => {
                            const newOptions = [...formData.options];
                            newOptions[i] = { ...newOptions[i], image_base64: '' };
                            setFormData({ ...formData, options: newOptions });
                          }}
                        >
                          <X size={10} color="white" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}


          <div className="form-group">
            <label>Correct Answer</label>
            {formData.type === 'mcq' ? (
              <select 
                value={formData.correct_answer} 
                onChange={e => setFormData({ ...formData, correct_answer: e.target.value })}
                required
              >
                <option value="">Select Correct Option</option>
                {formData.options.map((opt: any, i: number) => (
                  <option key={i} value={opt.text || `Option ${String.fromCharCode(65 + i)}`}>
                    Option {String.fromCharCode(65 + i)} {opt.text ? `(${opt.text})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input 
                placeholder="Enter correct value"
                value={formData.correct_answer} 
                onChange={e => setFormData({ ...formData, correct_answer: e.target.value })}
                required
              />
            )}
          </div>

          <div className="form-group">
            <label>Solution Text</label>
            <textarea 
              rows={3} 
              value={formData.solution_text} 
              onChange={e => setFormData({ ...formData, solution_text: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Solution Image (Optional)</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
                <Upload size={18} />
                Upload Solution Image
                <input type="file" hidden onChange={e => handleImageUpload(e, 'solution_image_base64')} accept="image/*" />
              </label>
              {formData.solution_image_base64 && (
                <button type="button" className="btn btn-danger" onClick={() => setFormData({...formData, solution_image_base64: ''})}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            {formData.solution_image_base64 && <img src={formData.solution_image_base64} className="image-preview" alt="Preview" />}
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Save size={20} />
              Save Question
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default QuestionEditor;
