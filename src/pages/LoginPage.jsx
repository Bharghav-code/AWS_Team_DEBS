import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword } from '../utils/validators';
import { ROUTES } from '../utils/constants';

export default function LoginPage() {
    const [email, setEmail] = useState('divisha');
    const [password, setPassword] = useState('divisha');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            navigate(ROUTES.DASHBOARD);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-enter" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - var(--nav-height) - 100px)',
            padding: 'var(--space-xl)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: 'var(--radius-xl)',
                        background: 'var(--color-jet)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-md)',
                        color: 'var(--color-professional-blue)',
                    }}>
                        <LogIn size={28} />
                    </div>
                    <h1>Welcome back</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)' }}>
                        Sign in to your Virale account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-lg)' }}>
                    {error && (
                        <div style={{
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'rgba(114, 75, 57, 0.15)',
                            color: 'var(--color-error)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-caption)',
                            marginBottom: 'var(--space-md)',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'var(--color-jet)',
                        color: 'var(--color-brass)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-caption)',
                        marginBottom: 'var(--space-md)',
                        textAlign: 'center',
                    }}>
                        Demo credentials: <strong>divisha</strong> / <strong>divisha</strong>
                    </div>

                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label htmlFor="login-email">Username</label>
                        <input
                            id="login-email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="divisha"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</> : 'Sign In'}
                    </button>

                    <p style={{
                        textAlign: 'center',
                        marginTop: 'var(--space-md)',
                        marginBottom: 0,
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-caption)',
                    }}>
                        Don't have an account?{' '}
                        <Link to={ROUTES.REGISTER} style={{ fontWeight: 600 }}>Sign up</Link>
                    </p>
                </form>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
