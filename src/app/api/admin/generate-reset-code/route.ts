import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
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
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: insertError } = await supabaseAdmin
      .from('reset_codes')
      .insert({
        phone: phone,
        secret_code: code,
        is_used: false,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('[Admin Reset Code API] DB Insert Error:', insertError.message);
      return NextResponse.json({ error: 'Failed to save reset code' }, { status: 500 });
    }

    return NextResponse.json({ success: true, code });

  } catch (error: any) {
    console.error('[Admin Reset Code API] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
