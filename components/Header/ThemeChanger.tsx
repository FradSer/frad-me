import { useTheme } from 'next-themes';

export default function ThemeChanger() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <div>
      {theme !== undefined && (
        <button onClick={() => toggleTheme()} className="hover:cursor-none">
          {isDark ? 'light' : 'dark'}
        </button>
      )}
    </div>
  );
}
