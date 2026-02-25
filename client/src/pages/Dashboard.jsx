import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCloudUpload, HiOutlineCollection, HiOutlineLightningBolt, HiOutlineAcademicCap } from 'react-icons/hi';
import DeckCard from '../components/DeckCard';
import { getDecks } from '../services/deckService';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDecks()
            .then(setDecks)
            .catch(() => setDecks([]))
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { icon: <HiOutlineCollection />, label: 'Bộ từ vựng', value: decks.length, color: 'var(--accent-primary)' },
        { icon: <HiOutlineLightningBolt />, label: 'Tổng từ', value: decks.reduce((sum, d) => sum + (d.card_count || 0), 0), color: 'var(--accent-secondary)' },
        { icon: <HiOutlineAcademicCap />, label: 'Đã học', value: 0, color: 'var(--accent-success)' },
    ];

    return (
        <div className="dashboard animate-fade-in">
            {/* Hero */}
            <section className="dashboard-hero">
                <div className="dashboard-hero-content">
                    <h1 className="dashboard-hero-title">
                        Học Tiếng Anh<br />
                        <span>với sức mạnh AI ✨</span>
                    </h1>
                    <p className="dashboard-hero-desc">
                        Upload tài liệu, AI sẽ tự động tạo flashcard và bài tập luyện tập cho bạn.
                        Học mọi lúc, mọi nơi.
                    </p>
                    <div className="dashboard-hero-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
                            <HiOutlineCloudUpload />
                            Upload tài liệu
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/decks')}>
                            <HiOutlineCollection />
                            Xem bộ từ
                        </button>
                    </div>
                </div>
                <div className="dashboard-hero-visual">
                    <div className="hero-orb hero-orb-1"></div>
                    <div className="hero-orb hero-orb-2"></div>
                    <div className="hero-orb hero-orb-3"></div>
                </div>
            </section>

            {/* Stats */}
            <section className="dashboard-stats stagger-children">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card card">
                        <div className="stat-icon" style={{ color: stat.color, background: `${stat.color}15` }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </section>

            {/* Recent Decks */}
            <section className="dashboard-recent">
                <div className="section-header">
                    <h2>Bộ từ gần đây</h2>
                    {decks.length > 0 && (
                        <button className="btn btn-secondary" onClick={() => navigate('/decks')}>
                            Xem tất cả
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Đang tải...</p>
                    </div>
                ) : decks.length === 0 ? (
                    <div className="empty-state card">
                        <HiOutlineCollection className="empty-state-icon" />
                        <h3>Chưa có bộ từ nào</h3>
                        <p>Hãy upload tài liệu để AI tạo flashcard cho bạn!</p>
                        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
                            <HiOutlineCloudUpload />
                            Upload ngay
                        </button>
                    </div>
                ) : (
                    <div className="deck-grid stagger-children">
                        {decks.slice(0, 6).map((deck) => (
                            <DeckCard key={deck.id} deck={deck} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
