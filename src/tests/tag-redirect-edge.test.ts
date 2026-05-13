import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Tag Redirect Edge Runtime Test', () => {
  it('should not use edge runtime to avoid broken connection issues', () => {
    const filePath = path.resolve(__dirname, '../app/(public)/t/[token]/page.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // It should not contain export const runtime = 'edge';
    expect(content).not.toContain("export const runtime = 'edge';");
  });
});
