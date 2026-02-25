import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineChevronLeft, HiOutlineRefresh, HiOutlineAcademicCap } from 'react-icons/hi';
import ExerciseCard from '../components/ExerciseCard';
import { getExercisesByDeck } from '../services/exerciseService';
import { getDeck } from '../services/deckService';
import './Exercise.css';

function Exercise() {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const [deck, setDeck] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        Promise.all([getDeck(deckId), getExercisesByDeck(deckId)])
            .then(([deckData, exerciseData]) => {
                setDeck(deckData);
                setExercises(exerciseData);
            })
            .catch((err) => console.error('Failed to load exercises:', err))
            .finally(() => setLoading(false));
    }, [deckId]);

    const handleNext = (isCorrect) => {
        if (isCorrect) setScore((s) => s + 1);

        if (currentIndex >= exercises.length - 1) {
            setFinished(true);
        } else {
            setCurrentIndex((i) => i + 1);
        }
    };

    const restart = () => {
        setCurrentIndex(0);
        setScore(0);
        setFinished(false);
    };

    if (loading) {
        return (
            <div className="exercise-page">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải bài tập...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="exercise-page animate-fade-in">
            <div className="exercise-header">
                <button className="btn btn-secondary" onClick={() => navigate('/decks')}>
                    <HiOutlineChevronLeft />
                    Quay lại
                </button>
                <div className="exercise-header-info">
                    <h2>Luyện tập: {deck?.name || 'Bộ từ'}</h2>
                    {exercises.length > 0 && !finished && (
                        <span className="badge">
                            {currentIndex + 1} / {exercises.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress */}
            {exercises.length > 0 && (
                <div className="study-progress">
                    <div
                        className="study-progress-fill"
                        style={{ width: `${(finished ? 1 : (currentIndex + 1) / exercises.length) * 100}%` }}
                    />
                </div>
            )}

            {exercises.length === 0 ? (
                <div className="empty-state card">
                    <HiOutlineAcademicCap className="empty-state-icon" />
                    <h3>Chưa có bài tập nào</h3>
                    <p>Upload tài liệu và xử lý bằng AI để tạo bài tập!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/upload')}>
                        Upload tài liệu
                    </button>
                </div>
            ) : finished ? (
                /* Score screen */
                <div className="exercise-score card animate-fade-in">
                    <div className="exercise-score-icon">🎉</div>
                    <h2>Hoàn thành!</h2>
                    <div className="exercise-score-value">
                        <span className="exercise-score-number">{score}</span>
                        <span className="exercise-score-total">/ {exercises.length}</span>
                    </div>
                    <p className="exercise-score-label">câu trả lời đúng</p>

                    <div className="exercise-score-bar">
                        <div
                            className="exercise-score-bar-fill"
                            style={{ width: `${(score / exercises.length) * 100}%` }}
                        />
                    </div>

                    <p className="exercise-score-message">
                        {score === exercises.length
                            ? 'Xuất sắc! Bạn đã trả lời đúng tất cả! 🏆'
                            : score >= exercises.length * 0.7
                                ? 'Rất tốt! Hãy tiếp tục ôn luyện! 💪'
                                : 'Cần luyện tập thêm. Đừng bỏ cuộc! 📚'}
                    </p>

                    <div className="exercise-score-actions">
                        <button className="btn btn-primary" onClick={restart}>
                            <HiOutlineRefresh />
                            Làm lại
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate(`/study/${deckId}`)}>
                            Xem Flashcard
                        </button>
                    </div>
                </div>
            ) : (
                <ExerciseCard
                    key={currentIndex}
                    exercise={exercises[currentIndex]}
                    onNext={handleNext}
                />
            )}
        </div>
    );
}

export default Exercise;
