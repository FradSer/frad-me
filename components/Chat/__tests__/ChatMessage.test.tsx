import { execFileSync } from 'node:child_process';
import { within } from '@testing-library/react';

// Jest ignores ESM Markdown dependencies. Native Node renders the actual component
// with installed ReactMarkdown/GFM; assertions inspect that production HTML in jsdom.
const cases = {
  exact: '**Code Terrier** (**`https://codeterrier.com`**)',
  http: '`http://example.com/path?q=1&x=2`',
  ordinary: '**Product** [Pachino](/works/pachino) and [External](https://example.com)',
  code: '`const x = 1` and `visit https://example.com`',
  fenced: '```text\nhttps://codeterrier.com\n```',
  linked: '[`https://codeterrier.com`](https://codeterrier.com)',
  unsafe: '`javascript:alert(1)` `data:text/html,test` `/works/pachino` `https://`',
  user: '**Code Terrier** (`https://codeterrier.com`)',
};
let rendered: Record<keyof typeof cases, string>;

beforeAll(() => {
  const script = `
    (async () => {
      const fs = require('node:fs');
      const path = require('node:path');
      const Module = require('node:module');
      const swc = require('next/dist/build/swc');
      await swc.loadBindings();
      const filename = path.resolve('components/Chat/ChatMessage.tsx');
      const compiled = swc.transformSync(fs.readFileSync(filename, 'utf8'), {
        filename, jsc: { parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } } }, module: { type: 'commonjs' }
      });
      const componentModule = new Module(filename);
      componentModule.filename = filename;
      componentModule.paths = Module._nodeModulePaths(path.dirname(filename));
      componentModule._compile(compiled.code, filename);
      const React = require('react');
      const { renderToStaticMarkup } = require('react-dom/server');
      const cases = ${JSON.stringify(cases)};
      const output = {};
      for (const [name, text] of Object.entries(cases)) {
        output[name] = renderToStaticMarkup(React.createElement(componentModule.exports.default, {
          message: { id: name, role: name === 'user' ? 'user' : 'assistant', parts: [{ type: 'text', text }] }
        }));
      }
      process.stdout.write(JSON.stringify(output));
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `;
  rendered = JSON.parse(execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' }));
});

function answer(name: keyof typeof cases) {
  const container = document.createElement('div');
  container.innerHTML = rendered[name];
  return { container, view: within(container) };
}

describe('Assistant Markdown links', () => {
  it('makes the exact code-styled Code Terrier address clickable', () => {
    const { container, view } = answer('exact');
    const link = view.getByRole('link', { name: 'https://codeterrier.com' });
    expect(link).toHaveAttribute('href', 'https://codeterrier.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('code')).toHaveTextContent('https://codeterrier.com');
    expect(container.querySelector('strong')).toHaveTextContent('Code Terrier');
  });

  it('also supports full HTTP URLs without changing their query', () => {
    expect(answer('http').view.getByRole('link')).toHaveAttribute(
      'href',
      'http://example.com/path?q=1&x=2',
    );
  });

  it('preserves normal Markdown links and strong formatting', () => {
    const { container, view } = answer('ordinary');
    expect(view.getByRole('link', { name: 'Pachino' })).toHaveAttribute('href', '/works/pachino');
    expect(view.getByRole('link', { name: 'External' })).toHaveAttribute('target', '_blank');
    expect(container.querySelector('strong')).toHaveTextContent('Product');
  });

  it('leaves ordinary inline code and fenced code unlinked', () => {
    const inline = answer('code');
    expect(inline.container.querySelectorAll('code')).toHaveLength(2);
    expect(inline.view.queryByRole('link')).not.toBeInTheDocument();
    const fenced = answer('fenced');
    expect(fenced.container.querySelector('pre code')).toHaveTextContent('https://codeterrier.com');
    expect(fenced.view.queryByRole('link')).not.toBeInTheDocument();
  });

  it('does not create nested links for an existing code-styled link label', () => {
    const { container, view } = answer('linked');
    expect(view.getAllByRole('link')).toHaveLength(1);
    expect(container.querySelector('a a')).toBeNull();
    expect(container.querySelector('a code')).toHaveTextContent('https://codeterrier.com');
  });

  it('does not link unsafe protocols, relative paths, or incomplete URLs', () => {
    const { container, view } = answer('unsafe');
    expect(container.querySelectorAll('code')).toHaveLength(4);
    expect(view.queryByRole('link')).not.toBeInTheDocument();
  });

  it('preserves literal user text without Markdown links', () => {
    const { container, view } = answer('user');
    expect(container.textContent).toContain(cases.user);
    expect(view.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelector('code')).toBeNull();
  });
});
