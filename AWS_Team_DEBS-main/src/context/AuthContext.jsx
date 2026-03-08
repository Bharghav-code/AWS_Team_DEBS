import { createContext, useState, useEffect, useCallback } from 'react';
import { signIn, signUp, signOut, getCurrentSession, confirmSignUp } from '../services/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount — wrapped in try/catch to survive
    // missing Cognito config (placeholder env vars, no .env file, etc.)
    useEffect(() => {
        let cancelled = false;

        async function checkSession() {
            try {
                const session = await getCurrentSession();
                if (!cancelled) setUser(session);
            } catch {
                // Expected when Cognito is not configured or no session exists.
                // This is NOT an error — just means user is logged out.
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        checkSession();

        return () => {
            cancelled = true;
        };
    }, []);

    const login = useCallback(async (email, password) => {
        const session = await signIn(email, password);
        setUser(session);
        return session;
    }, []);

    const register = useCallback(async (email, password, name) => {
        const result = await signUp(email, password, name);
        return result;
    }, []);

    const confirm = useCallback(async (email, code) => {
        const result = await confirmSignUp(email, code);
        return result;
    }, []);

    const logout = useCallback(() => {
        signOut();
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        confirm,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
