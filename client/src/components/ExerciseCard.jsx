import { useState } from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowRight, HiOutlineRefresh } from 'react-icons/hi';
import './ExerciseCard.css';

function ExerciseCard({ exercise, onNext }) {
    const [selected, setSelected] = useState(null);
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const isCorrect = exercise.type === 'multiple_choice'
        ? selected === exercise.correct_answer
        : answer.trim().toLowerCase() === exercise.correct_answer.toLowerCase();

    const handleSubmit = () => {
        if (exercise.type === 'multiple_choice' && !selected) return;
        if (exercise.type === 'fill_blank' && !answer.trim()) return;
        setSubmitted(true);
    };

    const handleNext = () => {
        setSelected(null);
        setAnswer('');
        setSubmitted(false);
        onNext(isCorrect);
    };

    return (
        <div className="exercise-card card">
            <div className="exercise-type-badge">
                {exercise.type === 'multiple_choice' ? '🔘 Trắc nghiệm' : '✍️ Điền từ'}
            </div>

            <h3 className="exercise-question">{exercise.question}</h3>

            {/* Multiple Choice */}
            {exercise.type === 'multiple_choice' && exercise.options && (
                <div className="exercise-options">
                    {(typeof exercise.options === 'string' ? JSON.parse(exercise.options) : exercise.options).map((option, i) => {
                        let className = 'exercise-option';
                        if (submitted) {
                            if (option === exercise.correct_answer) className += ' exercise-option--correct';
                            else if (option === selected) className += ' exercise-option--wrong';
                        } else if (option === selected) {
                            className += ' exercise-option--selected';
                        }

                        return (
                            <button
                                key={i}
                                className={className}
                                onClick={() => !submitted && setSelected(option)}
                                disabled={submitted}
                            >
                                <span className="exercise-option-letter">{String.fromCharCode(65 + i)}</span>
                                {option}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Fill in the blank */}
            {exercise.type === 'fill_blank' && (
                <div className="exercise-fill">
                    <input
                        type="text"
                        placeholder="Nhập từ vào đây..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={submitted}
                        onKeyDown={(e) => e.key === 'Enter' && !submitted && handleSubmit()}
                        autoFocus
                    />
                    {submitted && (
                        <p className="exercise-correct-answer">
                            Đáp án đúng: <strong>{exercise.correct_answer}</strong>
                        </p>
                    )}
                </div>
            )}

            {/* Result feedback */}
            {submitted && (
                <div className={`exercise-feedback ${isCorrect ? 'exercise-feedback--correct' : 'exercise-feedback--wrong'}`}>
                    {isCorrect ? (
                        <><HiOutlineCheckCircle /> Chính xác! 🎉</>
                    ) : (
                        <><HiOutlineXCircle /> Sai rồi! Đáp án đúng: <strong>{exercise.correct_answer}</strong></>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="exercise-actions">
                {!submitted ? (
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Kiểm tra
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={handleNext}>
                        Câu tiếp <HiOutlineArrowRight />
                    </button>
                )}
            </div>
        </div>
    );
}

export default ExerciseCard;
