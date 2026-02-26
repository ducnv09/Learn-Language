import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineChevronLeft, HiOutlineRefresh, HiOutlineAcademicCap } from 'react-icons/hi';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseSetupModal from '../components/ExerciseSetupModal';
import { getExercisesByDeck } from '../services/exerciseService';
import { getDeck } from '../services/deckService';
import { getFlashcards } from '../services/flashcardService';
import './Exercise.css';

function Exercise() {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [allExercises, setAllExercises] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);
    const [showSetup, setShowSetup] = useState(true);

    useEffect(() => {
        Promise.all([getDeck(deckId), getFlashcards(deckId), getExercisesByDeck(deckId)])
            .then(([deckData, cardsData, exerciseData]) => {
                setDeck(deckData);
                setCards(cardsData);
                setAllExercises(exerciseData);
            })
            .catch((err) => console.error('Failed to load data:', err))
            .finally(() => setLoading(false));
    }, [deckId]);

    const handleStartExercise = (exerciseType, selectedCards) => {
        const filteredExercises = allExercises.filter(ex => 
            selectedCards.some(card => ex.question.includes(card.word))
        );
        
        let finalExercises = filteredExercises;
        
        if (exerciseType === 'multiple_choice') {
            finalExercises = filteredExercises
                .filter(ex => ex.type === 'multiple_choice')
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.min(selectedCards.length * 2, filteredExercises.length));
        } else {
            finalExercises = filteredExercises
                .filter(ex => ex.type === 'fill_blank')
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.min(selectedCards.length * 2, filteredExercises.length));
        }

        if (finalExercises.length === 0) {
            finalExercises = selectedCards.map((card, index) => {
                if (exerciseType === 'multiple_choice') {
                    const wrongOptions = cards
                        .filter(c => c.id !== card.id)
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 3)
                        .map(c => c.definition || c.translation || c.word);
                    
                    const options = [card.definition || card.translation || card.word, ...wrongOptions]
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .sort(() => Math.random() - 0.5);
                    
                    return {
                        id: 1000 + index,
                        type: 'multiple_choice',
                        question: `Từ "${card.word}" có nghĩa là gì?`,
                        options: JSON.stringify(options),
                        correct_answer: card.definition || card.translation || card.word
                    };
                } else {
                    return {
                        id: 1000 + index,
                        type: 'fill_blank',
                        question: `Điền từ thích hợp: "${card.translation || card.definition || ''}"`,
                        correct_answer: card.word
                    };
                }
            });
        }

        setExercises(finalExercises);
        setShowSetup(false);
        setCurrentIndex(0);
        setScore(0);
        setFinished(false);
    };

    const handleNext = (isCorrect) => {
        if (isCorrect) setScore((s) => s + 1);

        if (currentIndex >= exercises.length - 1) {
            setFinished(true);
        } else {
            setCurrentIndex((i) => i + 1);
        }
    };

    const restart = () => {
        setShowSetup(true);
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
            {showSetup ? (
                <>
                    <div className="exercise-header">
                        <button className="btn btn-secondary" onClick={() => navigate('/decks')}>
                            <HiOutlineChevronLeft />
                            Quay lại
                        </button>
                        <div className="exercise-header-info">
                            <h2>Luyện tập: {deck?.name || 'Bộ từ'}</h2>
                        </div>
                    </div>
                    
                    {cards.length === 0 ? (
                        <div className="empty-state card">
                            <HiOutlineAcademicCap className="empty-state-icon" />
                            <h3>Chưa có từ vựng nào</h3>
                            <p>Hãy thêm từ vựng trước khi luyện tập!</p>
                            <button className="btn btn-primary" onClick={() => navigate(`/study/${deckId}`)}>
                                Thêm từ vựng
                            </button>
                        </div>
                    ) : (
                        <ExerciseSetupModal
                            open={true}
                            cards={cards}
                            onStart={handleStartExercise}
                            onClose={() => navigate('/decks')}
                        />
                    )}
                </>
            ) : (
                <>
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

                    {exercises.length > 0 && (
                        <div className="study-progress">
                            <div
                                className="study-progress-fill"
                                style={{ width: `${(finished ? 1 : (currentIndex + 1) / exercises.length) * 100}%` }}
                            />
                        </div>
                    )}

                    {finished ? (
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
                                    Luyện tập lại
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
                </>
            )}
        </div>
    );
}

export default Exercise;
