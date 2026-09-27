import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiOutlinePlus, HiOutlineDocumentText, HiOutlineTrash, HiOutlineClock, HiOutlinePencil } from 'react-icons/hi';
import ConfirmDialog from '../components/ConfirmDialog';
import './Quizzes.css';

const API_URL = 'http://localhost:3001/api';

function Quizzes() {
  const [quizBanks, setQuizBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, isBulk: false });
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizBanks();
  }, []);

  const fetchQuizBanks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/quizzes`);
      setQuizBanks(res.data);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách bộ câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/quizzes/${deleteDialog.id}`);
      setQuizBanks(quizBanks.filter(q => q.id !== deleteDialog.id));
      setSelectedIds(selectedIds.filter(id => id !== deleteDialog.id));
      setDeleteDialog({ isOpen: false, id: null, isBulk: false });
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi xóa bộ câu hỏi.');
    }
  };

  const handleMultiDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => axios.delete(`${API_URL}/quizzes/${id}`)));
      setQuizBanks(quizBanks.filter(q => !selectedIds.includes(q.id)));
      setSelectedIds([]);
      setDeleteDialog({ isOpen: false, id: null, isBulk: false });
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi xóa hàng loạt.');
    }
  };


  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (loading) return <div className="loading-state">Đang tải bộ câu hỏi...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="quizzes-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bộ câu hỏi trắc nghiệm</h1>
          <p className="page-subtitle">Luyện thi và làm bài tập trắc nghiệm tự động tạo bởi AI.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedIds.length > 0 && (
            <button className="btn btn-danger-outline" onClick={() => setDeleteDialog({ isOpen: true, id: null, isBulk: true })}>
              <HiOutlineTrash className="icon-btn" />
              Xóa {selectedIds.length} mục
            </button>
          )}
          <Link to="/quizzes/create" className="btn btn-primary">
            <HiOutlinePlus className="icon-btn" />
            Tạo bộ câu hỏi
          </Link>
        </div>
      </div>

      {quizBanks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <HiOutlineDocumentText className="empty-icon" />
          </div>
          <h3>Chưa có bộ câu hỏi nào</h3>
          <p>Hãy upload tài liệu để AI tạo ra các câu hỏi trắc nghiệm cho bạn luyện tập nhé.</p>
          <Link to="/quizzes/create" className="btn btn-primary mt-4">
            Bắt đầu ngay
          </Link>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizBanks.map((quiz) => (
            <div key={quiz.id} className={`quiz-card ${selectedIds.includes(quiz.id) ? 'selected' : ''}`}>
              <div className="quiz-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(quiz.id)} 
                    onChange={() => toggleSelect(quiz.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <h3 className="quiz-card-title">{quiz.title}</h3>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/quizzes/edit/${quiz.id}`);
                    }}
                    title="Sửa chi tiết bộ câu hỏi"
                  >
                    <HiOutlinePencil />
                  </button>
                  <button
                    className="btn-icon btn-danger-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialog({ isOpen: true, id: quiz.id });
                    }}
                    title="Xóa bộ câu hỏi"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
              
              <p className="quiz-card-desc">{quiz.description}</p>
              
              <div className="quiz-card-meta">
                <span className="meta-item">
                  <HiOutlineDocumentText />
                  {quiz.question_count || 0} câu hỏi
                </span>
                <span className="meta-item">
                  <HiOutlineClock />
                  {new Date(quiz.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              
              <div className="quiz-card-actions">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate(`/quizzes/study/${quiz.id}`)}
                  disabled={!quiz.question_count || quiz.question_count === 0}
                >
                  Bắt đầu luyện tập
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.isOpen}
        title={deleteDialog.isBulk ? "Xóa nhiều bộ câu hỏi" : "Xóa bộ câu hỏi"}
        message={deleteDialog.isBulk 
          ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} bộ câu hỏi đã chọn không? Dữ liệu này không thể khôi phục.`
          : "Bạn có chắc chắn muốn xóa bộ câu hỏi này không? Dữ liệu này không thể khôi phục."}
        onConfirm={deleteDialog.isBulk ? handleMultiDelete : handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null, isBulk: false })}
      />
    </div>
  );
}

export default Quizzes;
