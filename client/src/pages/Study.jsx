import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineChevronLeft, HiOutlineRefresh } from 'react-icons/hi';
import FlashcardItem from '../components/FlashcardItem';
import { getFlashcards } from '../services/flashcardService';
import { getDeck } from '../services/deckService';
import './Study.css';

function Study() {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getDeck(deckId), getFlashcards(deckId)])
            .then(([deckData, cardsData]) => {
                setDeck(deckData);
                setCards(cardsData);
            })
            .catch((err) => console.error('Failed to load study data:', err))
            .finally(() => setLoading(false));
    }, [deckId]);

    const goNext = () => {
        if (currentIndex < cards.length - 1) setCurrentIndex((i) => i + 1);
    };

    const goPrev = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    const restart = () => setCurrentIndex(0);

    if (loading) {
        return (
            <div className="study-page">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải bộ từ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="study-page animate-fade-in">
            {/* Header bar */}
            <div className="study-header">
                <button className="btn btn-secondary" onClick={() => navigate('/decks')}>
                    <HiOutlineChevronLeft />
                    Quay lại
                </button>
                <div className="study-header-info">
                    <h2>{deck?.name || 'Bộ từ'}</h2>
                    {cards.length > 0 && (
                        <span className="badge">
                            {currentIndex + 1} / {cards.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            {cards.length > 0 && (
                <div className="study-progress">
                    <div
                        className="study-progress-fill"
                        style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                    />
                </div>
            )}

            {/* Flashcard area */}
            {cards.length === 0 ? (
                <div className="empty-state card">
                    <h3>Bộ từ này chưa có flashcard nào</h3>
                    <p>Hãy upload tài liệu và dùng AI để tạo flashcard!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/upload')}>
                        Upload tài liệu
                    </button>
                </div>
            ) : (
                <>
                    <div className="study-card-area">
                        <FlashcardItem key={currentIndex} card={cards[currentIndex]} />
                    </div>

                    {/* Navigation */}
                    <div className="study-controls">
                        <button
                            className="btn btn-secondary"
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                        >
                            <HiOutlineArrowLeft />
                            Trước
                        </button>

                        <button className="btn-icon" onClick={restart} title="Làm lại từ đầu">
                            <HiOutlineRefresh />
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={goNext}
                            disabled={currentIndex === cards.length - 1}
                        >
                            Tiếp
                            <HiOutlineArrowRight />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Study;
