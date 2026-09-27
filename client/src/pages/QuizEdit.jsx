import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiOutlineArrowLeft, HiOutlineTrash, HiOutlinePlus, HiOutlineSave } from 'react-icons/hi';
import './QuizEdit.css';

const API_URL = 'http://localhost:3001/api';

function QuizEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quizBank, setQuizBank] = useState({ title: '', description: '' });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bankRes, questionsRes] = await Promise.all([
        axios.get(`${API_URL}/quizzes/${id}`),
        axios.get(`${API_URL}/quizzes/${id}/questions`)
      ]);
      setQuizBank({
        title: bankRes.data.title || '',
        description: bankRes.data.description || ''
      });
      // Map API questions to edit state
      setQuestions(questionsRes.data.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: [...q.options],
        correct_answers: [...q.correct_answers],
        explanation: q.explanation || ''
      })));
    } catch (err) {
      console.error(err);
      alert('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `new-${Date.now()}`,
        question_text: '',
        options: ['', '', '', ''],
        correct_answers: [0],
        explanation: ''
      }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectToggle = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    const q = newQuestions[qIndex];
    if (q.correct_answers.includes(optIndex)) {
      // Don't allow 0 correct answers
      if (q.correct_answers.length > 1) {
        q.correct_answers = q.correct_answers.filter(i => i !== optIndex);
      }
    } else {
      q.correct_answers.push(optIndex);
    }
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    const q = newQuestions[qIndex];
    if (q.options.length <= 2) {
      alert('Một câu hỏi phải có ít nhất 2 đáp án.');
      return;
    }
    q.options.splice(optIndex, 1);
    // Adjust correct answers
    q.correct_answers = q.correct_answers
      .filter(i => i !== optIndex)
      .map(i => (i > optIndex ? i - 1 : i));
    if (q.correct_answers.length === 0) q.correct_answers = [0];
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!quizBank.title.trim()) {
      alert('Vui lòng nhập tên bộ câu hỏi.');
      return;
    }
    try {
      setSaving(true);
      await axios.put(`${API_URL}/quizzes/${id}`, quizBank);
      await axios.put(`${API_URL}/quizzes/${id}/questions`, { questions });
      alert('Lưu thành công!');
      navigate('/quizzes');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Đang tải...</div>;

  return (
    <div className="quiz-edit-page fade-in">
      <div className="edit-header">
        <button className="btn-back" onClick={() => navigate('/quizzes')}>
          <HiOutlineArrowLeft /> Quay lại
        </button>
        <h2>Chỉnh sửa Bộ câu hỏi</h2>
      </div>

      <div className="edit-section">
        <h3>Thông tin chung</h3>
        <div className="form-group">
          <label>Tên bộ câu hỏi</label>
          <input 
            type="text" 
            className="form-control"
            value={quizBank.title}
            onChange={e => setQuizBank({ ...quizBank, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Mô tả</label>
          <textarea 
            className="form-control"
            rows="2"
            value={quizBank.description}
            onChange={e => setQuizBank({ ...quizBank, description: e.target.value })}
          />
        </div>
      </div>

      <div className="edit-section">
        <h3>Danh sách câu hỏi ({questions.length})</h3>
        
        <div className="question-list">
          {questions.map((q, qIndex) => (
            <div key={q.id || qIndex} className="question-edit-card">
              <div className="question-edit-header">
                <h4>Câu hỏi {qIndex + 1}</h4>
                <button className="btn-icon btn-danger-outline" onClick={() => handleRemoveQuestion(qIndex)}>
                  <HiOutlineTrash />
                </button>
              </div>
              
              <div className="form-group">
                <textarea 
                  className="form-control"
                  rows="2"
                  placeholder="Nhập nội dung câu hỏi..."
                  value={q.question_text}
                  onChange={e => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                />
              </div>

              <div className="options-edit-list">
                <label style={{ color: '#a0aec0', fontSize: '0.9em' }}>Đáp án (Tích chọn vào đáp án đúng)</label>
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="option-edit-item">
                    <input 
                      type="checkbox"
                      className="option-correct-toggle"
                      checked={q.correct_answers.includes(optIndex)}
                      onChange={() => handleCorrectToggle(qIndex, optIndex)}
                      title="Đánh dấu là đáp án đúng"
                    />
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder={`Đáp án ${optIndex + 1}`}
                      value={opt}
                      onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)}
                    />
                    <button className="btn-icon" onClick={() => handleRemoveOption(qIndex, optIndex)}>
                      <HiOutlineTrash />
                    </button>
                  </div>
                ))}
                <div className="add-btn" onClick={() => handleAddOption(qIndex)} style={{ width: 'max-content' }}>
                  <HiOutlinePlus /> Thêm đáp án
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label style={{ color: '#a0aec0', fontSize: '0.9em' }}>Giải thích (Tùy chọn)</label>
                <textarea 
                  className="form-control"
                  rows="1"
                  placeholder="Giải thích vì sao lại chọn đáp án này..."
                  value={q.explanation}
                  onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <button className="add-btn" onClick={handleAddQuestion} style={{ width: '100%', marginTop: '20px' }}>
          <HiOutlinePlus /> Thêm câu hỏi mới
        </button>
      </div>

      <div className="save-actions">
        <button className="btn btn-secondary" onClick={() => navigate('/quizzes')} disabled={saving}>Hủy</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <HiOutlineSave /> {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>
    </div>
  );
}

export default QuizEdit;
