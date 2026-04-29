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
      .from('circles')
      .select(`
        *,
        circle_members (count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ circles: data });
  } catch (error: any) {
    console.error('Error fetching admin circles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { name, description, slug, invite_code } = await request.json();

    const { data: circle, error: insertError } = await supabaseAdmin
      .from('circles')
      .insert({
        name,
        description,
        slug,
        invite_code: invite_code.toUpperCase(),
        owner_id: authResult.user.id
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505' && insertError.message.includes('slug')) {
        return NextResponse.json({ error: 'This Custom URL (slug) is already taken. Please choose another one.' }, { status: 400 });
      }
      throw insertError;
    }
    
    // Add creator as admin member
    if (circle) {
      const { error: memberError } = await supabaseAdmin
        .from('circle_members')
        .insert({
          circle_id: circle.id,
          profile_id: authResult.user.id,
          role: 'Admin'
        });
      
      if (memberError) throw memberError;
    }

    return NextResponse.json({ success: true, circle });
  } catch (error: any) {
    console.error('Error creating admin circle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await verifyAdmin(request);
    if ('error' in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Circle ID is required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('circles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting admin circle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
