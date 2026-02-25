import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineChevronLeft, HiOutlineRefresh, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import FlashcardItem from '../components/FlashcardItem';
import { getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } from '../services/flashcardService';
import { getDeck } from '../services/deckService';
import ConfirmDialog from '../components/ConfirmDialog';
import FlashcardModal from '../components/FlashcardModal';
import './Study.css';

function Study() {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingCard, setEditingCard] = useState(null);

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

    const handleAddClick = () => {
        setModalMode('add');
        setEditingCard(null);
        setModalOpen(true);
    };

    const handleEditClick = (card) => {
        setModalMode('edit');
        setEditingCard(card);
        setModalOpen(true);
    };

    const handleModalSave = async (cardData) => {
        try {
            if (modalMode === 'add') {
                const created = await createFlashcard({ ...cardData, deck_id: parseInt(deckId) });
                setCards([...cards, created]);
            } else {
                const updated = await updateFlashcard(cardData.id, cardData);
                setCards(cards.map(c => c.id === updated.id ? updated : c));
            }
            setModalOpen(false);
        } catch (err) {
            console.error('Failed to save card:', err);
        }
    };

    const handleDeleteCard = async () => {
        if (!deleteTarget) return;
        try {
            await deleteFlashcard(deleteTarget.id);
            const newCards = cards.filter(c => c.id !== deleteTarget.id);
            setCards(newCards);
            if (currentIndex >= newCards.length && currentIndex > 0) {
                setCurrentIndex(newCards.length - 1);
            }
        } catch (err) {
            console.error('Failed to delete card:', err);
        } finally {
            setDeleteTarget(null);
        }
    };

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
                    {cards.length > 0 && !editMode && (
                        <span className="badge">
                            {currentIndex + 1} / {cards.length}
                        </span>
                    )}
                </div>
                <button 
                    className={`btn ${editMode ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => setEditMode(!editMode)}
                >
                    {editMode ? <HiOutlineX /> : <HiOutlinePencil />}
                    {editMode ? 'Hủy' : 'Chỉnh sửa'}
                </button>
            </div>

            {/* Progress bar */}
            {cards.length > 0 && !editMode && (
                <div className="study-progress">
                    <div
                        className="study-progress-fill"
                        style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                    />
                </div>
            )}

            {/* Edit Mode UI */}
            {editMode ? (
                <div className="edit-mode">
                    <div className="edit-mode-header">
                        <h3>Quản lý từ vựng ({cards.length} từ)</h3>
                        <button className="btn btn-primary" onClick={handleAddClick}>
                            <HiOutlinePlus />
                            Thêm từ mới
                        </button>
                    </div>

                    <div className="card-list">
                        {cards.map((card, index) => (
                            <div key={card.id} className="card-list-item">
                                <div className="card-list-number">{index + 1}</div>
                                <div className="card-list-content">
                                    <div className="card-list-word">{card.word}</div>
                                    {card.definition && <div className="card-list-def">{card.definition}</div>}
                                    {card.translation && <div className="card-list-trans">🇻🇳 {card.translation}</div>}
                                </div>
                                <div className="card-list-actions">
                                    <button 
                                        className="btn-icon" 
                                        title="Chỉnh sửa"
                                        onClick={() => handleEditClick(card)}
                                    >
                                        <HiOutlinePencil />
                                    </button>
                                    <button 
                                        className="btn-icon btn-icon--danger" 
                                        title="Xóa"
                                        onClick={() => setDeleteTarget(card)}
                                    >
                                        <HiOutlineTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
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
                </>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Xóa từ vựng"
                message={`Bạn có chắc muốn xóa từ "${deleteTarget?.word}"?`}
                confirmText="Xóa"
                cancelText="Hủy"
                danger
                onConfirm={handleDeleteCard}
                onCancel={() => setDeleteTarget(null)}
            />

            <FlashcardModal
                open={modalOpen}
                mode={modalMode}
                card={editingCard}
                onSave={handleModalSave}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
}

export default Study;
