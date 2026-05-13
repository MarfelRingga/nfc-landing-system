import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get('queue_id');

    if (!queueId) {
      return NextResponse.json({ success: false, error: 'Queue ID is required' }, { status: 400 });
    }

    const { data: queue, error: queueErr } = await supabaseAdmin
      .from('queues')
      .select('*')
      .eq('id', queueId)
      .single();

    if (queueErr || !queue) {
      return NextResponse.json({ success: false, error: 'Antrean tidak ditemukan' }, { status: 404 });
    }

    let queue_ahead = 0;
    if (queue.status === 'WAITING') {
      const { count } = await supabaseAdmin
        .from('queues')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', queue.event_id)
        .eq('status', 'WAITING')
        .lt('queue_number', queue.queue_number);
      queue_ahead = count || 0;
    }

    return NextResponse.json({
      success: true,
      queue: {
        id: queue.id,
        event_id: queue.event_id,
        queue_number: queue.queue_number,
        status: queue.status,
        queue_ahead
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
