import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Rate Limiting protection
    let ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Verify admin status
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Process Request
    const body = await request.json();
    const { is_admin } = body;

    if (typeof is_admin !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_admin })
      .eq('id', id);

    if (updateError) {
      console.error('[Admin Role Toggle API] DB Update Error:', updateError.message);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ success: true, is_admin });

  } catch (error: any) {
    console.error('[Admin Role Toggle API] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
