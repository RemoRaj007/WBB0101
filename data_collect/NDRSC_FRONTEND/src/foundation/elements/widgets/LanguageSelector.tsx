import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
    className?: string;
}

const LanguageSelector = ({ className }: LanguageSelectorProps) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {isOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors z-20 relative ${className || 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <Globe className="w-5 h-5" />
                <span className="uppercase text-sm font-medium">{i18n.language.split('-')[0]}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${i18n.language.startsWith('en') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => changeLanguage('si')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${i18n.language.startsWith('si') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                        සිංහල
                    </button>
                    <button
                        onClick={() => changeLanguage('ta')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${i18n.language.startsWith('ta') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                        தமிழ்
                    </button>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
