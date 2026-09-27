import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import './QuizStudy.css';

const API_URL = 'http://localhost:3001/api';

function QuizStudy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizBank, setQuizBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // State for current question interactions
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const [bankRes, questionsRes] = await Promise.all([
        axios.get(`${API_URL}/quizzes/${id}`),
        axios.get(`${API_URL}/quizzes/${id}/questions`)
      ]);
      setQuizBank(bankRes.data);
      setQuestions(questionsRes.data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải dữ liệu bộ câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionToggle = (optionIndex) => {
    if (showResult) return;

    const currentQ = questions[currentIndex];
    
    if (currentQ.question_type === 'SINGLE_CHOICE') {
      setSelectedOptions([optionIndex]);
      checkAnswer([optionIndex], currentQ);
    } else {
      // MULTIPLE_CHOICE
      if (selectedOptions.includes(optionIndex)) {
        setSelectedOptions(selectedOptions.filter(idx => idx !== optionIndex));
      } else {
        setSelectedOptions([...selectedOptions, optionIndex]);
      }
    }
  };

  const handleCheckMultipleChoice = () => {
    const currentQ = questions[currentIndex];
    checkAnswer(selectedOptions, currentQ);
  };

  const checkAnswer = (selected, currentQ) => {
    const correctAnswers = currentQ.correct_answers || [];
    
    // Sort both arrays to compare
    const sortedSelected = [...selected].sort();
    const sortedCorrect = [...correctAnswers].sort();
    
    const correct = 
      sortedSelected.length === sortedCorrect.length && 
      sortedSelected.every((val, index) => val === sortedCorrect[index]);
      
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetState();
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedOptions([]);
    setShowResult(false);
    setIsCorrect(false);
  };

  if (loading) return <div className="loading-state">Đang tải câu hỏi...</div>;
  if (!questions.length) return <div className="error-state">Bộ câu hỏi này trống.</div>;

  if (isFinished) {
    return (
      <div className="quiz-study-page fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', width: '100%' }}>
          <HiOutlineCheckCircle style={{ fontSize: '64px', color: '#4caf50', marginBottom: '20px' }} />
          <h2>Hoàn thành xuất sắc!</h2>
          <p style={{ margin: '20px 0', fontSize: '1.1em', color: '#8b9bb4' }}>Bạn đã vượt qua bộ câu hỏi <strong>{quizBank?.title}</strong>.</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/quizzes')}>
              Về trang bộ câu hỏi
            </button>
            <button className="btn btn-primary" onClick={() => {
              setIsFinished(false);
              setCurrentIndex(0);
              resetState();
            }}>
              Làm lại từ đầu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isMultiple = currentQ.question_type === 'MULTIPLE_CHOICE';

  return (
    <div className="quiz-study-page fade-in">
      <div className="study-header">
        <button className="btn-back" onClick={() => navigate('/quizzes')}>
          <HiOutlineArrowLeft /> Quay lại
        </button>
        <h2 className="study-title">{quizBank?.title}</h2>
        <div className="study-progress-text">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="study-content">
        <div className="question-card">
          {isMultiple && (
            <div className="question-badge">Câu hỏi nhiều đáp án (Chọn tất cả đáp án đúng)</div>
          )}
          
          <h3 className="question-text">{currentQ.question_text}</h3>
          
          <div className="options-list">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOptions.includes(idx);
              const isCorrectOption = currentQ.correct_answers.includes(idx);
              
              let optionClass = 'option-item';
              if (isSelected) optionClass += ' selected';
              
              if (showResult) {
                if (isCorrectOption) optionClass += ' correct';
                else if (isSelected && !isCorrectOption) optionClass += ' wrong';
              }
              
              return (
                <div 
                  key={idx} 
                  className={optionClass}
                  onClick={() => handleOptionToggle(idx)}
                >
                  <div className="option-control">
                    {isMultiple ? (
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        readOnly
                        className="option-checkbox"
                      />
                    ) : (
                      <input 
                        type="radio" 
                        checked={isSelected}
                        readOnly
                        className="option-radio"
                      />
                    )}
                  </div>
                  <div className="option-text">{option}</div>
                </div>
              );
            })}
          </div>

          {isMultiple && !showResult && (
            <div className="multiple-choice-actions">
              <button 
                className="btn btn-primary"
                onClick={handleCheckMultipleChoice}
                disabled={selectedOptions.length === 0}
              >
                Kiểm tra đáp án
              </button>
            </div>
          )}

          {showResult && (
            <div className={`result-feedback ${isCorrect ? 'result-feedback-correct' : 'result-feedback-wrong'}`}>
              <div className="feedback-header">
                {isCorrect ? (
                  <><HiOutlineCheckCircle className="icon-correct" /> <strong>Tuyệt vời! Đáp án chính xác.</strong></>
                ) : (
                  <><HiOutlineXCircle className="icon-wrong" /> <strong>Sai rồi. Cố gắng lên!</strong></>
                )}
              </div>
              
              {currentQ.explanation && (
                <div className="feedback-explanation">
                  <strong>Giải thích:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{currentQ.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="study-navigation">
          <button 
            className="btn btn-secondary" 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
          >
            Câu trước
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={!showResult}
          >
            {currentIndex === questions.length - 1 ? 'Kết thúc' : 'Câu tiếp theo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizStudy;
