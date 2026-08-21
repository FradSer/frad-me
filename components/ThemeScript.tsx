// Server Component — renders the same inline script that next-themes
// would otherwise render inside the Client Component tree, but from the
// Server Component boundary so React 19 does NOT emit
// "Encountered a script tag while rendering React component".
// Keep this in sync with contexts/Theme/constants.ts and the props used
// in contexts/Theme/ThemeModeProvider.tsx.
const STORAGE_KEY = 'theme';
const DEFAULT_THEME = 'system';

type Props = {
  attribute?: string;
  storageKey?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
};

const THEME_SCRIPT = `(e,i,s,u,m,a,l,h)=>{let d=document.documentElement,w=["light","dark"];function p(n){(Array.isArray(e)?e:[e]).forEach(y=>{let k=y==="class",S=k&&a?m.map(f=>a[f]||f):m;k?(d.classList.remove(...S),d.classList.add(a&&a[n]?a[n]:n)):d.setAttribute(y,n)}),R(n)}function R(n){h&&w.includes(n)&&(d.style.colorScheme=n)}function c(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(u)p(u);else try{let n=localStorage.getItem(i)||s,y=l&&n==="system"?c():n;p(y)}catch(n){}}`;

export default function ThemeScript({
  attribute = 'class',
  storageKey = STORAGE_KEY,
  defaultTheme = DEFAULT_THEME,
  enableSystem = true,
}: Props) {
  void enableSystem;
  const args = JSON.stringify([
    attribute,
    storageKey,
    defaultTheme,
    null,
    ['light', 'dark'],
    null,
    true,
    'theme',
  ]).slice(1, -1);

  return (
    <script
      suppressHydrationWarning
      // biome-ignore lint/security/noDangerouslySetInnerHtml: inline theme script mirrors next-themes; required for FOUC-free SSR and must live in Server Component
      dangerouslySetInnerHTML={{ __html: `(${THEME_SCRIPT})(${args})` }}
    />
  );
}
