import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCollection, HiOutlinePlay, HiOutlineAcademicCap, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import './DeckCard.css';

function DeckCard({ deck, onDelete, onRename }) {
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(deck.name);

    const handleRename = () => {
        if (!editName.trim() || editName === deck.name) {
            setEditing(false);
            setEditName(deck.name);
            return;
        }
        onRename(deck.id, editName.trim());
        setEditing(false);
    };

    return (
        <div className="deck-card card">
            <div className="deck-card-header">
                <div className="deck-card-icon-wrapper">
                    <HiOutlineCollection className="deck-card-icon" />
                </div>
                <div className="deck-card-actions">
                    <span className="badge">{deck.card_count || 0} từ</span>
                    <button
                        className="deck-action-btn"
                        title="Đổi tên"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditing(true);
                        }}
                    >
                        <HiOutlinePencil />
                    </button>
                    <button
                        className="deck-action-btn deck-action-btn--danger"
                        title="Xóa"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(deck.id);
                        }}
                    >
                        <HiOutlineTrash />
                    </button>
                </div>
            </div>

            {editing ? (
                <div className="deck-card-edit animate-fade-in">
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                            if (e.key === 'Escape') {
                                setEditing(false);
                                setEditName(deck.name);
                            }
                        }}
                        autoFocus
                    />
                    <div className="deck-card-edit-actions">
                        <button className="deck-action-btn deck-action-btn--success" onClick={handleRename}>
                            <HiOutlineCheck />
                        </button>
                        <button className="deck-action-btn" onClick={() => {
                            setEditing(false);
                            setEditName(deck.name);
                        }}>
                            <HiOutlineX />
                        </button>
                    </div>
                </div>
            ) : (
                <h3 className="deck-card-title" onClick={() => navigate(`/study/${deck.id}`)}>
                    {deck.name}
                </h3>
            )}

            {deck.description && (
                <p className="deck-card-desc">{deck.description}</p>
            )}

            <div className="deck-card-footer">
                <button className="btn btn-primary btn-sm" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/study/${deck.id}`);
                }}>
                    <HiOutlinePlay />
                    Flashcard
                </button>
                <button className="btn btn-secondary btn-sm" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/exercise/${deck.id}`);
                }}>
                    <HiOutlineAcademicCap />
                    Luyện tập
                </button>
            </div>
        </div>
    );
}

export default DeckCard;
