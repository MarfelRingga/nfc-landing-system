import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) return NextResponse.json({ success: false, error: 'Code required' }, { status: 400 });

    // Try to find the event where name contains the code
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('id, name')
      .ilike('name', `%"event_code":"${code}"%`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }
    
    if (!events) {
       // fallback for non json names?
       const { data: fallback, error: e2 } = await supabaseAdmin
         .from('events')
         .select('id')
         .eq('name', code)
         .limit(1)
         .maybeSingle();
       
       if (fallback) {
         return NextResponse.json({ success: true, event_id: fallback.id });
       }
       return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, event_id: events.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
