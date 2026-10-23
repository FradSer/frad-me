import { DEFAULT_THEME, THEME_STORAGE_KEY } from '@/contexts/Theme/constants';

// Inline FOUC-prevention script. It resolves the stored preference before
// hydration and applies the same light/dark contract that ThemeModeProvider
// enforces after mount, so the first paint already matches the active theme.
const THEME_SCRIPT = `(function(){try{var root=document.documentElement,stored=localStorage.getItem('${THEME_STORAGE_KEY}'),preference=stored||'${DEFAULT_THEME}',resolved=preference==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):preference;root.classList.remove('light','dark');root.classList.add(resolved);root.style.colorScheme=resolved;}catch{}})();`;

export default function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      // biome-ignore lint/security/noDangerouslySetInnerHtml: inline theme script must run before hydration to prevent FOUC
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
