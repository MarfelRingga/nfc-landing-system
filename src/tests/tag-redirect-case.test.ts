import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Tag Redirect Case Sensitivity Test', () => {
  it('should use .eq() instead of .ilike() for token querying', () => {
    const filePath = path.resolve(__dirname, '../app/(public)/t/[token]/page.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // It should contain .eq instead of .ilike
    expect(content).not.toContain(".ilike('token'");
    expect(content).toContain(".eq('token'");
  });
});
