import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard, PlusCircle, TrendingUp, Users, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import styles from '../../styles/components/Navigation.module.css';

const navItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, id: 'nav-dashboard' },
    { path: ROUTES.CREATE_CAMPAIGN, label: 'Create', icon: PlusCircle, id: 'nav-create' },
    { path: ROUTES.TRENDS, label: 'Trends', icon: TrendingUp, id: 'nav-trends' },
    { path: ROUTES.INFLUENCERS, label: 'Influencers', icon: Users, id: 'nav-influencers' },
    { path: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3, id: 'nav-analytics' },
];

export default function Navigation() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <nav className={styles.nav} role="navigation" aria-label="Main navigation">
            <div className={styles.navInner}>
                <Link to="/" className={styles.logo} aria-label="Virale home">
                    <span className={styles.logoIcon}>V</span>
                    Virale
                </Link>

                {isAuthenticated && (
                    <ul className={styles.desktopLinks}>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    id={item.id}
                                    className={({ isActive }) =>
                                        `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                                    }
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                )}

                <div className={styles.userSection}>
                    {isAuthenticated && (
                        <>
                            <button
                                className={styles.hamburger}
                                onClick={() => setMobileOpen(!mobileOpen)}
                                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={mobileOpen}
                            >
                                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </>
                    )}

                    {!isAuthenticated && (
                        <Link to={ROUTES.LOGIN} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '6px', background: 'var(--color-coffee)', color: 'var(--color-brass)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile overlay */}
            {isAuthenticated && (
                <>
                    <div
                        className={`${styles.mobileOverlay} ${mobileOpen ? styles.mobileOverlayOpen : ''}`}
                        onClick={() => setMobileOpen(false)}
                        aria-hidden="true"
                    />
                    <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={styles.mobileLink}
                                onClick={() => setMobileOpen(false)}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </NavLink>
                        ))}
                        <button
                            className={styles.mobileLink}
                            onClick={() => { logout(); setMobileOpen(false); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </>
            )}
        </nav>
    );
}
