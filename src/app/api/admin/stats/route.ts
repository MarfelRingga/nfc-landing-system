import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isRateLimited } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    // Rate Limiting
    let ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Verify admin status
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

    // Process Request
    const { count: usersCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: tagsCount } = await supabaseAdmin
      .from('nfc_tags')
      .select('*', { count: 'exact', head: true });

    const { data: latestBackup } = await supabaseAdmin
      .from('backup_logs')
      .select('status')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      stats: {
        users: usersCount || 0,
        tags: tagsCount || 0,
        backups: latestBackup?.status || 'no logs'
      }
    });

  } catch (error: any) {
    console.error('[Admin Stats API] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
