import { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        try {
            return localStorage.getItem('virale_theme') === 'dark';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        try {
            localStorage.setItem('virale_theme', darkMode ? 'dark' : 'light');
        } catch {
            // Ignore
        }
    }, [darkMode]);

    const toggleTheme = useCallback(() => {
        setDarkMode((prev) => !prev);
    }, []);

    const value = {
        darkMode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
