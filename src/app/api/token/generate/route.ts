import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { event_id } = await request.json();
    if (!event_id) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const tokenCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // expires_at (e.g. 1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const { data: tokenData, error } = await supabaseAdmin.rpc('pb_generate_token', {
      p_event_id: event_id,
      p_code: tokenCode,
      p_expires_at: expiresAt.toISOString()
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, token: tokenData.code });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
