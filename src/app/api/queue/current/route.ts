import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });

    const { data: queues, error } = await supabaseAdmin
      .from('queues')
      .select('*')
      .eq('event_id', eventId)
      .in('status', ['WAITING', 'CALLED'])
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    
    // Map data
    const mapQueueRow = (q: any) => ({
      id: q.id,
      queue_number: q.queue_number,
      status: q.status,
      user_name: q.customer_name || `Pelanggan #${q.queue_number}`
    });

    const current_queue = queues?.find(q => q.status === 'CALLED');
    const next_queues = (queues?.filter(q => q.status === 'WAITING') || []).slice(0, 50);

    return NextResponse.json({
      success: true,
      current_queue: current_queue ? mapQueueRow(current_queue) : null,
      next_queues: next_queues.map(mapQueueRow)
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
