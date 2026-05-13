import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Profile Schema', () => {
  it('should list columns', async () => {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    console.log(data ? Object.keys(data[0]) : error);
  });
});
