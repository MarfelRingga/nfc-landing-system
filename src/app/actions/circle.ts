'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function verifyAndJoinCircle(circleId: string, userId: string, inviteCode: string) {
  try {
    // 1. Verify the invite code
    const { data: circle, error: circleError } = await supabaseAdmin
      .from('circles')
      .select('id')
      .eq('id', circleId)
      .eq('invite_code', inviteCode.toUpperCase())
      .maybeSingle();

    if (circleError) throw circleError;
    if (!circle) return { success: false, error: 'Invalid invite code' };

    // 2. Add user to circle
    const { error: joinError } = await supabaseAdmin
      .from('circle_members')
      .upsert({
        circle_id: circleId,
        profile_id: userId,
        role: 'Member'
      }, { onConflict: 'circle_id,profile_id' });

    if (joinError) throw joinError;

    return { success: true };
  } catch (err: any) {
    console.error('Error joining circle:', err);
    return { success: false, error: err.message || 'Failed to join circle' };
  }
}
