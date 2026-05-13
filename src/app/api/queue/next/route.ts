import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = body.event_id;

    if (!eventId) return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });

    const { data: queueData, error: rpcErr } = await supabaseAdmin.rpc('pb_next_queue', {
      p_event_id: eventId
    });

    if (rpcErr) {
      console.error(rpcErr);
      return NextResponse.json({ success: false, error: 'Failed to call next queue' }, { status: 500 });
    }

    if (!queueData) {
      return NextResponse.json({ success: true, queue: null, message: 'No more waiting queues' });
    }

    return NextResponse.json({
      success: true,
      queue: queueData
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
