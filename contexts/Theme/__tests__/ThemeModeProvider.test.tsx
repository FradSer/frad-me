/**
 * BDD: tests/features/theme/no-client-script-error.feature
 *
 * RED before fix: ThemeModeProvider wrapped next-themes' ThemeProvider,
 * which renders a <script> via dangerouslySetInnerHTML inside a Client
 * Component — React 19 + Next 16 flag it as
 * "Encountered a script tag while rendering React component" at
 * app/client-layout.tsx:31 (StandardLayout -> ThemeModeProvider).
 * GREEN after fix: provider no longer renders any <script>; the FOUC
 * script lives in the Server Component ThemeScript (app/layout.tsx).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('ThemeModeProvider — tests/features/theme/no-client-script-error.feature', () => {
  const providerSrc = readFileSync(
    join(process.cwd(), 'contexts/Theme/ThemeModeProvider.tsx'),
    'utf8',
  );
  const layoutSrc = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');
  const themeScriptSrc = readFileSync(join(process.cwd(), 'components/ThemeScript.tsx'), 'utf8');

  it('Scenario: Theme provider must not trigger script-tag console error', () => {
    // Must not import or render next-themes inside a Client Component
    // (next-themes renders <script> via dangerouslySetInnerHTML inside
    // the client tree -> React 19 error). Check import line specifically.
    expect(providerSrc).not.toMatch(/from\s+['"]next-themes['"]/);
    expect(providerSrc).not.toContain('NextThemesProvider');
    // Must not render any <script> tag itself (ignore comments)
    const nonComment = providerSrc
      .split('\n')
      .filter((l) => !l.trim().startsWith('//'))
      .join('\n');
    expect(nonComment).not.toMatch(/<script/i);
    expect(nonComment).not.toContain('dangerouslySetInnerHTML');
  });

  it('And no script tag is rendered inside a client component subtree', () => {
    // FOUC script must live in Server Component (app/layout.tsx -> ThemeScript)
    expect(layoutSrc).toContain('ThemeScript');
    expect(layoutSrc).toContain('<ThemeScript');
    // External scripts remain via next/script outside the client subtree
    expect(layoutSrc).toContain('next/script');
    expect(themeScriptSrc).toContain('dangerouslySetInnerHTML');
    // Server Component must not be marked as client
    expect(themeScriptSrc).not.toContain("'use client'");
  });
});
