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

    const { data, error } = await supabaseAdmin
      .from('nfc_tags')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ tags: data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { token: newToken } = await request.json();
    if (!newToken) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('nfc_tags')
      .insert({
        token: newToken.trim(),
        status: 'active'
      });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This token already exists.' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('nfc_tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
