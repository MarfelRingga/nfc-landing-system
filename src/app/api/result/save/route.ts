import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queue_id, result_url } = body;

    if (!queue_id) {
      return NextResponse.json({ success: false, error: 'Queue ID is required' }, { status: 400 });
    }

    if (result_url) {
      const { error: insertErr } = await supabaseAdmin
        .from('results')
        .insert({ queue_id, result_url });

      if (insertErr) {
        return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
      }
    }

    // Update queue status to DONE
    await supabaseAdmin
      .from('queues')
      .update({ status: 'DONE' })
      .eq('id', queue_id);

    return NextResponse.json({
      success: true,
      message: 'Result saved successfully'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
