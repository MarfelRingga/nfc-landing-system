import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    let ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token: tagToken, tagName } = body;

    if (!tagToken) {
      return NextResponse.json({ error: 'Tag token is required' }, { status: 400 });
    }

    // Find the tag by token where user_id is null
    const { data: tag, error: findError } = await supabaseAdmin
      .from('nfc_tags')
      .select('id, circle_id, user_id')
      .ilike('token', tagToken.trim())
      .maybeSingle();

    if (findError) {
      console.error('[Claim Tag] Find error:', findError);
      return NextResponse.json({ error: 'Failed to find tag' }, { status: 500 });
    }

    if (!tag) {
      return NextResponse.json({ error: 'Invalid token or tag not found.' }, { status: 400 });
    }

    if (tag.user_id) {
      return NextResponse.json({ error: 'Tag is already claimed.' }, { status: 400 });
    }

    // Claim the tag
    const { error: updateError } = await supabaseAdmin
      .from('nfc_tags')
      .update({ 
        user_id: user.id,
        tag_name: (tagName || '').trim() || 'My NFC Tag',
        status: 'active'
      })
      .eq('id', tag.id);

    if (updateError) {
      console.error('[Claim Tag] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to claim tag' }, { status: 500 });
    }

    // If tag has a circle_id, join the user to that circle automatically
    if (tag.circle_id) {
      await supabaseAdmin
        .from('circle_members')
        .upsert({
          circle_id: tag.circle_id,
          profile_id: user.id,
          role: 'Member'
        }, { onConflict: 'circle_id,profile_id' });
    }

    return NextResponse.json({ success: true, tag });

  } catch (error: any) {
    console.error('[Claim Tag API] Error:', error);
    // Send Telegram Notification
    try {
      const { sendTelegramNotification } = await import('@/lib/sendTelegram');
      await sendTelegramNotification(`💥 *API Error (Tags Claim)*\n\n*Error:*\n${error.message}\n\n*Token:*\n${error.stack ? error.stack.slice(0, 150) : '-'}`);
    } catch(e) {}
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
