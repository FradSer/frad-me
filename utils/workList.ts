import fs from 'node:fs';
import { WORKS_PATH } from '@/utils/workContent';

const STATIC_WORKS = ['bearychat', 'eye-protection-design-handbook', 'pachino'] as const;

export function getAllWorkSlugs(): string[] {
  try {
    return fs
      .readdirSync(WORKS_PATH)
      .filter((fileName) => /\.mdx?$/.test(fileName))
      .map((fileName) => fileName.replace(/\.mdx?$/, ''));
  } catch {
    return [...STATIC_WORKS];
  }
}
