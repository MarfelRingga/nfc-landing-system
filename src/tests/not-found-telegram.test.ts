import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('404 Telegram Notification Test', () => {
  it('should have a not-found.tsx file that notifies telegram', () => {
    const filePath = path.resolve(__dirname, '../app/not-found.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain("await fetch('/api/notify-error'");
    expect(content).toContain("404 Page Not Found");
  });
});
