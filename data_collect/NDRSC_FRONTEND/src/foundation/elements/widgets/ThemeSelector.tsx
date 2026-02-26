import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../state_hubs/ThemeContext';
import { Check, Moon, Sun, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ThemeSelector = () => {
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 bg-card text-text-muted hover:bg-main hover:text-primary-600 rounded-2xl transition-all border border-border group shadow-sm flex items-center gap-2"
                title={t('changeTheme') || "Change Theme"}
            >
                {theme === 'light' ? (
                    <Sun size={20} className="group-hover:rotate-12 transition-transform" />
                ) : (
                    <Moon size={20} className="group-hover:rotate-12 transition-transform" />
                )}
                <span className="hidden xl:inline text-sm font-bold uppercase tracking-wider">{theme}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">Display Mode</p>
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                if (theme === 'dark') toggleTheme();
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${theme === 'light'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Sun size={16} className="mr-3" />
                            Light Mode
                            {theme === 'light' && <Check size={14} className="ml-auto" />}
                        </button>
                        <button
                            onClick={() => {
                                if (theme === 'light') toggleTheme();
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${theme === 'dark'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Moon size={16} className="mr-3" />
                            Dark Mode
                            {theme === 'dark' && <Check size={14} className="ml-auto" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSelector;
