import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isRateLimited } from '@/lib/rate-limit';

async function verifyAdmin(request: Request) {
  let ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (ip.includes(',')) ip = ip.split(',')[0].trim();
  if (isRateLimited(ip)) {
    return { error: 'Too many requests', status: 429 };
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return { error: 'Missing authorization header', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user };
}

export async function GET(request: Request) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { data: logs, error } = await supabaseAdmin
      .from('backup_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error fetching admin backups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
