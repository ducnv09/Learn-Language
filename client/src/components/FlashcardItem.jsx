import { useState } from 'react';
import './FlashcardItem.css';

function FlashcardItem({ card }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div
            className={`flashcard ${flipped ? 'flashcard--flipped' : ''}`}
            onClick={() => setFlipped(!flipped)}
        >
            <div className="flashcard-inner">
                {/* Front */}
                <div className="flashcard-face flashcard-front">
                    <span className="flashcard-label">Từ vựng</span>
                    <h2 className="flashcard-word">{card.word}</h2>
                    {card.pronunciation && (
                        <p className="flashcard-pronunciation">{card.pronunciation}</p>
                    )}
                    <span className="flashcard-hint">Nhấn để lật thẻ</span>
                </div>

                {/* Back */}
                <div className="flashcard-face flashcard-back">
                    <span className="flashcard-label">Nghĩa</span>
                    <p className="flashcard-definition">{card.definition}</p>
                    {card.translation && (
                        <p className="flashcard-translation">🇻🇳 {card.translation}</p>
                    )}
                    {card.example_sentence && (
                        <div className="flashcard-example">
                            <span className="flashcard-example-label">Ví dụ:</span>
                            <p>{card.example_sentence}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FlashcardItem;
