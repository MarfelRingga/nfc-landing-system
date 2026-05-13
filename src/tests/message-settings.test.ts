import { describe, it, expect } from 'vitest';
import { encodeMessageSettings, decodeMessageSettings } from '../lib/messageSettings';

describe('Message Settings Utility', () => {
  it('should encode correctly when disabled', () => {
    const result = encodeMessageSettings('Your Name', false);
    expect(result).toBe('__DISABLED__Your Name');
  });

  it('should encode correctly when enabled', () => {
    const result = encodeMessageSettings('Your Name', true);
    expect(result).toBe('Your Name');
  });

  it('should not add prefix multiple times', () => {
    const result = encodeMessageSettings('__DISABLED__Your Name', false);
    expect(result).toBe('__DISABLED__Your Name');
  });

  it('should decode correctly when disabled', () => {
    const result = decodeMessageSettings('__DISABLED__Your Name');
    expect(result.isEnabled).toBe(false);
    expect(result.cleanName).toBe('Your Name');
  });

  it('should decode correctly when enabled', () => {
    const result = decodeMessageSettings('Your Name');
    expect(result.isEnabled).toBe(true);
    expect(result.cleanName).toBe('Your Name');
  });
});
