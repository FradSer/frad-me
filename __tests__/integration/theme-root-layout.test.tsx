import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('@vercel/analytics/react', () => ({
  Analytics: function AnalyticsMock() {
    return null;
  },
}));

jest.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: function SpeedInsightsMock() {
    return null;
  },
}));

jest.mock('next/script', () => function ScriptMock() {
  return null;
});

jest.mock('@/app/client-layout', () => ({
  __esModule: true,
  default: function ClientLayoutMock({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <>{children}</>;
  },
}));

describe('RootLayout theme integration', () => {
  it('should expose body classes required for dark/light theme background', async () => {
    const RootLayout = (await import('@/app/layout')).default;

    const markup = renderToStaticMarkup(
      <RootLayout>
        <div>Theme Test</div>
      </RootLayout>,
    );

    expect(markup).toMatch(
      /<body class="[^"]*bg-white[^"]*dark:bg-black[^"]*"[^>]*>/,
    );
    expect(markup).toContain('style="color-scheme:light dark"');
  });
});
