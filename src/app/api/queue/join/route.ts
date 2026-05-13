import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { event_id, token, name } = await request.json();
    if (!event_id || !token || !name) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const { data: queueData, error: rpcErr } = await supabaseAdmin.rpc('pb_join_queue', {
      p_token_code: token,
      p_event_id: event_id,
      p_customer_name: name
    });

    if (rpcErr || !queueData) {
      console.error(rpcErr);
      return NextResponse.json({ success: false, error: rpcErr?.message || 'Failed to join queue or token invalid' }, { status: 400 });
    }

    return NextResponse.json({ success: true, queue_id: queueData.queue_id, queue_number: queueData.queue_number });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
