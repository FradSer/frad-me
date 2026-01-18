import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

describe('package.json scripts', () => {
  it('only reference existing local script files', () => {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      scripts?: Record<string, string>;
    };

    const missingScriptPaths = Object.values(packageJson.scripts ?? {}).flatMap((command) => {
      const matches = Array.from(command.matchAll(/\.?\/?scripts\/[^\s'"&|]+/g));
      if (matches.length === 0) {
        return [];
      }

      return matches.flatMap((match) => {
        const scriptRelativePath = match[0].startsWith('./') ? match[0].slice(2) : match[0];
        const scriptAbsolutePath = path.join(__dirname, '..', scriptRelativePath);
        return existsSync(scriptAbsolutePath) ? [] : [scriptRelativePath];
      });
    });

    expect(missingScriptPaths).toHaveLength(0);
  });
});
