import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmCode, setConfirmCode] = useState('');
    const [step, setStep] = useState('register'); // 'register' | 'confirm'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, confirm } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || name.length < 2) { setError('Name is required'); return; }
        if (!email) { setError('Username is required'); return; }
        if (!password) { setError('Password is required'); return; }

        setLoading(true);
        try {
            await register(email, password, name);
            // In demo mode, skip verify — go straight to login
            navigate(ROUTES.LOGIN);
        } catch (err) {
            setError(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await confirm(email, confirmCode);
            navigate(ROUTES.LOGIN);
        } catch (err) {
            setError(err.message || 'Confirmation failed.');
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
            <div style={{ width: '100%', maxWidth: '420px' }}>
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
                        <UserPlus size={28} />
                    </div>
                    <h1>{step === 'register' ? 'Create account' : 'Verify email'}</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)' }}>
                        {step === 'register' ? 'Start your viral marketing journey' : 'Enter the verification code sent to your email'}
                    </p>
                </div>

                {step === 'register' ? (
                    <form onSubmit={handleRegister} className="card" style={{ padding: 'var(--space-lg)' }}>
                        {error && (
                            <div style={{
                                padding: 'var(--space-sm) var(--space-md)',
                                background: 'rgba(114, 75, 57, 0.15)',
                                color: 'var(--color-error)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--font-size-caption)',
                                marginBottom: 'var(--space-md)',
                            }}>{error}</div>
                        )}

                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label htmlFor="reg-name">Full Name</label>
                            <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                        </div>

                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label htmlFor="reg-email">Username</label>
                            <input id="reg-email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Choose a username" autoComplete="username" required />
                        </div>

                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label htmlFor="reg-password">Password</label>
                            <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" autoComplete="new-password" required />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</> : 'Create Account'}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: 'var(--space-md)', marginBottom: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-caption)' }}>
                            Already have an account? <Link to={ROUTES.LOGIN} style={{ fontWeight: 600 }}>Sign in</Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleConfirm} className="card" style={{ padding: 'var(--space-lg)' }}>
                        {error && (
                            <div style={{ padding: 'var(--space-sm) var(--space-md)', background: 'rgba(114, 75, 57, 0.15)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-caption)', marginBottom: 'var(--space-md)' }}>{error}</div>
                        )}

                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label htmlFor="confirm-code">Verification Code</label>
                            <input id="confirm-code" type="text" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} placeholder="Enter 6-digit code" required />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</> : 'Verify Email'}
                        </button>
                    </form>
                )}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
