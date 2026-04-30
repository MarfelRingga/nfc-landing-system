import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isRateLimited } from '@/lib/rate-limit';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { tagName, interactionMode, redirectUrl, circleId } = body;

    // Verify ownership
    const { data: tag, error: findError } = await supabaseAdmin
      .from('nfc_tags')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (findError || !tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    if (tag.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { error: updateError } = await supabaseAdmin
      .from('nfc_tags')
      .update({ 
        tag_name: tagName?.trim() || 'My NFC Tag',
        interaction_mode: interactionMode,
        redirect_url: redirectUrl?.trim() || null,
        circle_id: circleId || null
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Join circle automatically
    if (circleId) {
      await supabaseAdmin
        .from('circle_members')
        .upsert({
          circle_id: circleId,
          profile_id: user.id,
          role: 'Member'
        }, { onConflict: 'circle_id,profile_id' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Tag API Error:', error);
    try {
      const { sendTelegramNotification } = await import('@/lib/sendTelegram');
      await sendTelegramNotification(`💥 *API Error (Tags Update)*\n\n*Error:*\n${error.message}`);
    } catch(e) {}
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    if (isRateLimited(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const { id } = await params;
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const { data: tag, error: findError } = await supabaseAdmin
      .from('nfc_tags')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (findError || !tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    if (tag.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // "Delete" for tags means detaching user_id (setting it to null)
    const { error: updateError } = await supabaseAdmin
      .from('nfc_tags')
      .update({ user_id: null })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Tag API Error:', error);
    try {
      const { sendTelegramNotification } = await import('@/lib/sendTelegram');
      await sendTelegramNotification(`💥 *API Error (Tags Detach)*\n\n*Error:*\n${error.message}`);
    } catch(e) {}
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
