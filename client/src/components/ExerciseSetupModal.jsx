import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { HiOutlineX, HiOutlineCheck, HiOutlineCollection } from 'react-icons/hi';
import './ExerciseSetupModal.css';

function ExerciseSetupModal({ open, cards, onStart, onClose }) {
    const [exerciseType, setExerciseType] = useState('multiple_choice');
    const [selectedCards, setSelectedCards] = useState([]);
    const [selectMode, setSelectMode] = useState('all');

    useEffect(() => {
        if (open) {
            setSelectedCards(cards.map(c => c.id));
        }
    }, [open, cards]);

    if (!open) return null;

    const handleToggleCard = (cardId) => {
        setSelectedCards(prev => 
            prev.includes(cardId) 
                ? prev.filter(id => id !== cardId)
                : [...prev, cardId]
        );
    };

    const handleSelectAll = () => {
        setSelectedCards(cards.map(c => c.id));
        setSelectMode('all');
    };

    const handleSelectNone = () => {
        setSelectedCards([]);
        setSelectMode('none');
    };

    const handleStart = () => {
        if (selectedCards.length === 0) return;
        const selectedCardsData = cards.filter(c => selectedCards.includes(c.id));
        onStart(exerciseType, selectedCardsData);
    };

    const currentCards = selectMode === 'none' 
        ? cards.filter(c => selectedCards.includes(c.id))
        : cards;

    return createPortal(
        <div className="exercise-setup-overlay" onClick={onClose}>
            <div className="exercise-setup-modal animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="exercise-setup-header">
                    <h3>Thiết lập bài luyện tập</h3>
                    <button className="exercise-setup-close" onClick={onClose}>
                        <HiOutlineX />
                    </button>
                </div>

                <div className="exercise-setup-content">
                    <div className="exercise-setup-section">
                        <label className="exercise-setup-label">Loại bài tập</label>
                        <div className="exercise-type-options">
                            <button
                                className={`exercise-type-option ${exerciseType === 'multiple_choice' ? 'exercise-type-option--active' : ''}`}
                                onClick={() => setExerciseType('multiple_choice')}
                            >
                                <span className="exercise-type-icon">🔘</span>
                                <span className="exercise-type-text">Trắc nghiệm</span>
                                <span className="exercise-type-desc">Chọn đáp án đúng</span>
                            </button>
                            <button
                                className={`exercise-type-option ${exerciseType === 'fill_blank' ? 'exercise-type-option--active' : ''}`}
                                onClick={() => setExerciseType('fill_blank')}
                            >
                                <span className="exercise-type-icon">✍️</span>
                                <span className="exercise-type-text">Tự luận</span>
                                <span className="exercise-type-desc">Điền từ vào chỗ trống</span>
                            </button>
                        </div>
                    </div>

                    <div className="exercise-setup-section">
                        <div className="exercise-setup-label-row">
                            <label className="exercise-setup-label">Chọn từ luyện tập</label>
                            <div className="exercise-setup-select-actions">
                                <button 
                                    className="exercise-setup-select-btn"
                                    onClick={handleSelectAll}
                                    disabled={selectMode === 'all'}
                                >
                                    Chọn tất cả
                                </button>
                                <button 
                                    className="exercise-setup-select-btn"
                                    onClick={handleSelectNone}
                                    disabled={selectMode === 'none'}
                                >
                                    Bỏ chọn tất cả
                                </button>
                            </div>
                        </div>
                        <div className="exercise-setup-cards">
                            {cards.map(card => (
                                <label 
                                    key={card.id} 
                                    className={`exercise-setup-card-item ${selectedCards.includes(card.id) ? 'exercise-setup-card-item--selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCards.includes(card.id)}
                                        onChange={() => handleToggleCard(card.id)}
                                    />
                                    <span className="exercise-setup-card-word">{card.word}</span>
                                    {card.translation && (
                                        <span className="exercise-setup-card-trans">🇻🇳 {card.translation}</span>
                                    )}
                                </label>
                            ))}
                        </div>
                        <p className="exercise-setup-count">
                            Đã chọn: {selectedCards.length} / {cards.length} từ
                        </p>
                    </div>
                </div>

                <div className="exercise-setup-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={handleStart}
                        disabled={selectedCards.length === 0}
                    >
                        <HiOutlineCheck />
                        Bắt đầu luyện tập
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ExerciseSetupModal;
