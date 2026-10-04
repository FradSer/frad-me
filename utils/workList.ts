import fs from 'node:fs';
import { WORKS_PATH } from '@/utils/workContent';

const STATIC_WORKS = ['bearychat', 'eye-protection-design-handbook', 'pachino'] as const;

export function getAllWorkSlugs(): string[] {
  try {
    return fs
      .readdirSync(WORKS_PATH)
      .filter((fileName) => fileName.endsWith('.mdx'))
      .map((fileName) => fileName.slice(0, -4));
  } catch {
    return [...STATIC_WORKS];
  }
}
