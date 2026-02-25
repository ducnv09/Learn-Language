import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineChevronLeft, HiOutlineRefresh, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineX, HiOutlineSelector } from 'react-icons/hi';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import FlashcardItem from '../components/FlashcardItem';
import { getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } from '../services/flashcardService';
import { getDeck } from '../services/deckService';
import ConfirmDialog from '../components/ConfirmDialog';
import FlashcardModal from '../components/FlashcardModal';
import './Study.css';

function SortableCardItem({ card, index, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className={`card-list-item ${isDragging ? 'card-list-item--dragging' : ''}`}>
            <div className="card-list-drag" {...attributes} {...listeners}>
                <HiOutlineSelector />
            </div>
            <div className="card-list-number">{index + 1}</div>
            <div className="card-list-content">
                <div className="card-list-word">{card.word}</div>
                {card.definition && <div className="card-list-def">{card.definition}</div>}
                {card.translation && <div className="card-list-trans">🇻🇳 {card.translation}</div>}
            </div>
            <div className="card-list-actions">
                <button className="btn-icon" title="Chỉnh sửa" onClick={() => onEdit(card)}>
                    <HiOutlinePencil />
                </button>
                <button className="btn-icon btn-icon--danger" title="Xóa" onClick={() => onDelete(card)}>
                    <HiOutlineTrash />
                </button>
            </div>
        </div>
    );
}

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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

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

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setCards((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
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

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            <div className="card-list">
                                {cards.map((card, index) => (
                                    <SortableCardItem 
                                        key={card.id} 
                                        card={card} 
                                        index={index}
                                        onEdit={handleEditClick}
                                        onDelete={setDeleteTarget}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
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
