import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queue_id, action } = body;

    if (!queue_id) return NextResponse.json({ success: false, error: 'Queue ID required' }, { status: 400 });

    const status = action || 'SKIPPED';
    
    // Check if queue exists
    const { data: queue, error: getErr } = await supabaseAdmin
      .from('queues')
      .select('*')
      .eq('id', queue_id)
      .single();

    if (getErr || !queue) {
      return NextResponse.json({ success: false, error: 'Queue not found' }, { status: 404 });
    }

    // Process status update
    // If we are calling someone 'CALLED', ensure we mark any existing 'CALLED' as 'DONE' or something.
    // The DB constraint unique_called_per_event ensures only one is CALLED. We need to handle that if needed, 
    // but this is mostly for 'SKIPPED' anyway.
    const { data, error } = await supabaseAdmin
      .from('queues')
      .update({ status: status })
      .eq('id', queue_id)
      .select()
      .single();

    if (error) {
       console.error("Queue Skip Update Error:", error);
       return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queue_id = searchParams.get('queue_id');

    if (!queue_id) {
       return NextResponse.json({ success: false, error: 'Queue ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('queues')
      .delete()
      .eq('id', queue_id);

    if (error) {
       return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Queue successfully deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
