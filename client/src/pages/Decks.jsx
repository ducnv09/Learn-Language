import { useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import DeckCard from '../components/DeckCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { getDecks, createDeck, updateDeck, deleteDeck } from '../services/deckService';
import './Decks.css';

function Decks() {
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newDeck, setNewDeck] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

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
        if (!deleteTarget) return;
        try {
            await deleteDeck(deleteTarget.id);
            fetchDecks();
        } catch (err) {
            console.error('Failed to delete deck:', err);
        } finally {
            setDeleteTarget(null);
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
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? <HiOutlineX /> : <HiOutlinePlus />}
                    {showForm ? 'Hủy' : 'Tạo bộ từ mới'}
                </button>
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
                        />
                    ))}
                </div>
            )}

            {/* Delete confirm dialog */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Xóa bộ từ vựng"
                message={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Tất cả flashcard và bài tập trong bộ này cũng sẽ bị xóa vĩnh viễn.`}
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

