import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type SubTheme = string;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  lightSub: SubTheme;
  setLightSub: (s: SubTheme) => void;
  darkSub: SubTheme;
  setDarkSub: (s: SubTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', setTheme: () => {}, lightSub: 'default', setLightSub: () => {}, darkSub: 'default', setDarkSub: () => {} });

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const LIGHT_SUBS: Record<string, Record<string, string>> = {
  default: {},
  warm: {
    '--background': '30 50% 97%',
    '--card': '30 50% 100%',
    '--muted': '30 30% 94%',
    '--accent': '30 30% 94%',
    '--secondary': '30 30% 94%',
  },
  cool: {
    '--background': '210 60% 97%',
    '--card': '210 60% 100%',
    '--muted': '210 40% 94%',
    '--accent': '210 40% 94%',
    '--secondary': '210 40% 94%',
  },
  paper: {
    '--background': '40 40% 95%',
    '--card': '40 40% 99%',
    '--muted': '40 25% 90%',
    '--accent': '40 25% 90%',
    '--secondary': '40 25% 90%',
  },
  medium: {
    '--background': '220 30% 92%',
    '--card': '220 30% 96%',
    '--muted': '220 20% 88%',
    '--accent': '220 20% 88%',
    '--secondary': '220 20% 88%',
    '--border': '220 20% 85%',
    '--input': '220 20% 85%',
  },
};

const DARK_SUBS: Record<string, Record<string, string>> = {
  default: {},
  midnight: {
    '--background': '230 50% 6%',
    '--card': '230 50% 9%',
    '--muted': '230 33% 17%',
    '--accent': '230 33% 17%',
    '--secondary': '230 33% 17%',
    '--border': '230 33% 17%',
    '--input': '230 33% 17%',
  },
  amoled: {
    '--background': '0 0% 0%',
    '--card': '0 0% 3%',
    '--muted': '0 0% 10%',
    '--accent': '0 0% 10%',
    '--secondary': '0 0% 10%',
    '--border': '0 0% 12%',
    '--input': '0 0% 12%',
  },
  forest: {
    '--background': '150 40% 5%',
    '--card': '150 40% 8%',
    '--muted': '150 25% 14%',
    '--accent': '150 25% 14%',
    '--secondary': '150 25% 14%',
    '--border': '150 25% 16%',
    '--input': '150 25% 16%',
  },
  medium: {
    '--background': '220 10% 12%',
    '--card': '220 10% 15%',
    '--muted': '220 8% 20%',
    '--accent': '220 8% 20%',
    '--secondary': '220 8% 20%',
    '--border': '220 8% 22%',
    '--input': '220 8% 22%',
  },
};

function applySubTheme(resolved: 'light' | 'dark', lightSub: string, darkSub: string) {
  const root = document.documentElement;
  // Clear any previously applied sub-theme vars
  const allVars = new Set([
    ...Object.values(LIGHT_SUBS).flatMap(o => Object.keys(o)),
    ...Object.values(DARK_SUBS).flatMap(o => Object.keys(o)),
  ]);
  allVars.forEach(v => root.style.removeProperty(v));

  const vars = resolved === 'dark' ? DARK_SUBS[darkSub] || {} : LIGHT_SUBS[lightSub] || {};
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('razehub-theme') as Theme) || 'light';
  });
  const [lightSub, setLightSubState] = useState(() => localStorage.getItem('razehub-light-sub') || 'default');
  const [darkSub, setDarkSubState] = useState(() => localStorage.getItem('razehub-dark-sub') || 'default');

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('razehub-theme', t);
  };
  const setLightSub = (s: SubTheme) => { setLightSubState(s); localStorage.setItem('razehub-light-sub', s); };
  const setDarkSub = (s: SubTheme) => { setDarkSubState(s); localStorage.setItem('razehub-dark-sub', s); };

  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    applySubTheme(resolved, lightSub, darkSub);
  }, [theme, lightSub, darkSub]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = mq.matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', mq.matches);
      applySubTheme(resolved, lightSub, darkSub);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, lightSub, darkSub]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, lightSub, setLightSub, darkSub, setDarkSub }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
