import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
export type ColorTheme = 'blue' | 'green' | 'purple' | 'red' | 'orange';

interface ThemeContextType {
    theme: Theme;
    colorTheme: ColorTheme;
    toggleTheme: () => void;
    setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as Theme) || 'light';
    });

    const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
        const saved = localStorage.getItem('colorTheme');
        return (saved as ColorTheme) || 'blue';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('colorTheme', colorTheme);
        document.documentElement.setAttribute('data-theme', colorTheme);
    }, [colorTheme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const setColorTheme = (color: ColorTheme) => setColorThemeState(color);

    return (
        <ThemeContext.Provider value={{ theme, colorTheme, toggleTheme, setColorTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
