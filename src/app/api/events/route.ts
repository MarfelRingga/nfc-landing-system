import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { name, event_code, contact, require_attachment, display_theme } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }
    
    if (!event_code) {
      return NextResponse.json({ error: 'Event code is required' }, { status: 400 });
    }

    const payload = JSON.stringify({ 
      name, 
      event_code, 
      contact,
      require_attachment: require_attachment !== false,
      display_theme: display_theme || { backgroundColor: "#111827", textColor: "#ffffff", primaryColor: "#4f46e5" }
    });

    const { data: insertedData, error } = await supabaseAdmin
      .from('events')
      .insert({ name: payload })
      .select()
      .single();

    if (error) {
      console.error('Error inserting event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let parsed = { name: insertedData.name, event_code: '', contact: '' };
    try {
      parsed = JSON.parse(insertedData.name);
    } catch (e) {}

    const data = {
      id: insertedData.id,
      ...parsed,
      created_at: insertedData.created_at
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { data: rawEvents, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const data = (rawEvents || []).map(event => {
      let parsed = { name: event.name, event_code: '', contact: '', require_attachment: true, display_theme: null };
      try {
        const p = JSON.parse(event.name);
        if (p.name) parsed = { ...parsed, ...p };
      } catch (e) {
         // ignore
      }
      return {
        id: event.id,
        created_at: event.created_at,
        ...parsed
      };
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
