import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('NFC Tag Page Edits Test', () => {
  it('should not contain the "No circles found" text', () => {
    const filePath = path.resolve(__dirname, '../app/(dashboard)/tags/page.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    expect(content).not.toContain('Circle Protocol (No circles found)');
    expect(content).toContain('Circle ({userCircles[0].name})');
    expect(content).toContain("setRedirectUrl('https://')");
  });
});
