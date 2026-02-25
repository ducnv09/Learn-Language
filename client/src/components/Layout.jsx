import { NavLink, Outlet } from 'react-router-dom';
import { HiOutlineHome, HiOutlineCloudUpload, HiOutlineCollection, HiOutlineSparkles } from 'react-icons/hi';
import { useState } from 'react';
import './Layout.css';

const navItems = [
    { path: '/', icon: <HiOutlineHome />, label: 'Trang chủ' },
    { path: '/upload', icon: <HiOutlineCloudUpload />, label: 'Upload tài liệu' },
    { path: '/decks', icon: <HiOutlineCollection />, label: 'Bộ từ vựng' },
];

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app">
            {/* Mobile overlay */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <HiOutlineSparkles className="sidebar-logo-icon" />
                        <span className="sidebar-logo-text">LearnLang AI</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            <span className="sidebar-link-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-footer-card">
                        <HiOutlineSparkles />
                        <span>AI Powered</span>
                    </div>
                </div>
            </aside>

            {/* Mobile toggle */}
            <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Main content */}
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
