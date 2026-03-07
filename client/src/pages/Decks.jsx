import { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineX, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi';
import DeckCard from '../components/DeckCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { getDecks, createDeck, updateDeck, deleteDeck, deleteManyDecks } from '../services/deckService';
import './Decks.css';

function Decks() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newDeck, setNewDeck] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedDecks, setSelectedDecks] = useState([]);

    const fetchDecks = () => {
        getDecks()
            .then(setDecks)
            .catch(() => setDecks([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchDecks();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newDeck.name.trim()) return;

        setCreating(true);
        try {
            await createDeck(newDeck);
            setNewDeck({ name: '', description: '' });
            setShowForm(false);
            fetchDecks();
        } catch (err) {
            console.error('Failed to create deck:', err);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteClick = (id) => {
        const deck = decks.find(d => d.id === id);
        setDeleteTarget(deck);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (selectionMode && selectedDecks.length > 0) {
                await deleteManyDecks(selectedDecks);
                setSelectedDecks([]);
                setSelectionMode(false);
            } else if (deleteTarget) {
                await deleteDeck(deleteTarget.id);
            } else {
                return;
            }
            fetchDecks();
        } catch (err) {
            console.error('Failed to delete deck(s):', err);
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleSelectDeck = (id) => {
        setSelectedDecks(prev =>
            prev.includes(id)
                ? prev.filter(deckId => deckId !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedDecks.length === decks.length) {
            setSelectedDecks([]);
        } else {
            setSelectedDecks(decks.map(d => d.id));
        }
    };

    const handleRename = async (id, newName) => {
        try {
            await updateDeck(id, { name: newName });
            fetchDecks();
        } catch (err) {
            console.error('Failed to rename deck:', err);
        }
    };

    return (
        <div className="decks-page animate-fade-in">
            <div className="page-header">
                <h1>Bộ Từ Vựng</h1>
                <p>Quản lý các bộ từ vựng của bạn</p>
            </div>

            <div className="decks-toolbar">
                {selectionMode ? (
                    <div className="selection-toolbar animate-fade-in">
                        <span className="selection-count">
                            Đã chọn {selectedDecks.length} bộ từ
                        </span>
                        <div className="selection-actions">
                            <button className="btn btn-secondary" onClick={handleSelectAll}>
                                {selectedDecks.length === decks.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                            {selectedDecks.length > 0 && (
                                <button className="btn btn-danger" onClick={() => setDeleteTarget({ isBulk: true })}>
                                    <HiOutlineTrash />
                                    Xóa đã chọn
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={() => {
                                setSelectionMode(false);
                                setSelectedDecks([]);
                            }}>
                                Xong
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="normal-toolbar animate-fade-in">
                        {decks.length > 0 && (
                            <button className="btn btn-secondary" onClick={() => setSelectionMode(true)}>
                                <HiOutlineCheck />
                                Chọn nhiều
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                            {showForm ? <HiOutlineX /> : <HiOutlinePlus />}
                            {showForm ? 'Hủy' : 'Tạo bộ từ mới'}
                        </button>
                    </div>
                )}
            </div>

            {/* Create form */}
            {showForm && (
                <form className="deck-create-form card animate-fade-in" onSubmit={handleCreate}>
                    <h3>Tạo bộ từ vựng mới</h3>
                    <input
                        type="text"
                        placeholder="Tên bộ từ (vd: Business English)"
                        value={newDeck.name}
                        onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
                        autoFocus
                    />
                    <textarea
                        placeholder="Mô tả (tùy chọn)"
                        value={newDeck.description}
                        onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
                        rows={3}
                    />
                    <button className="btn btn-primary" type="submit" disabled={creating || !newDeck.name.trim()}>
                        {creating ? 'Đang tạo...' : 'Tạo bộ từ'}
                    </button>
                </form>
            )}

            {/* Deck list */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải...</p>
                </div>
            ) : decks.length === 0 ? (
                <div className="empty-state card">
                    <h3>Chưa có bộ từ nào</h3>
                    <p>Nhấn "Tạo bộ từ mới" để bắt đầu!</p>
                </div>
            ) : (
                <div className="deck-grid stagger-children">
                    {decks.map((deck) => (
                        <DeckCard
                            key={deck.id}
                            deck={deck}
                            onDelete={handleDeleteClick}
                            onRename={handleRename}
                            selectionMode={selectionMode}
                            isSelected={selectedDecks.includes(deck.id)}
                            onSelect={handleSelectDeck}
                        />
                    ))}
                </div>
            )}

            {/* Delete confirm dialog */}
            <ConfirmDialog
                open={!!deleteTarget}
                title={deleteTarget?.isBulk ? "Xóa nhiều bộ từ vựng" : "Xóa bộ từ vựng"}
                message={deleteTarget?.isBulk
                    ? `Bạn có chắc muốn xóa ${selectedDecks.length} bộ từ vựng đã chọn? Tất cả flashcard và bài tập trong các bộ này sẽ bị xóa vĩnh viễn.`
                    : `Bạn có chắc muốn xóa "${deleteTarget?.name}"? Tất cả flashcard và bài tập trong bộ này cũng sẽ bị xóa vĩnh viễn.`
                }
                confirmText="Xóa"
                cancelText="Hủy"
                danger
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}

export default Decks;

