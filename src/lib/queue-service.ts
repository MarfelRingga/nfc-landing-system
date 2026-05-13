import { supabase } from './supabase';

export async function joinQueue(eventId: number, customerName: string, tokenCode: string) {
  if (!tokenCode || !eventId || !customerName) {
    return { success: false, error: "Data tidak lengkap" };
  }

  // 1. Cek Token
  const { data: tokenData, error: tokenError } = await supabase
    .from('tokens')
    .select('id, event_id, is_used, expires_at')
    .eq('code', tokenCode)
    .single();

  if (tokenError || !tokenData) {
    return { success: false, error: "Token tidak valid atau tidak ditemukan" };
  }

  if (tokenData.is_used) {
    return { success: false, error: "Token sudah digunakan (One-time use)" };
  }

  if (new Date() > new Date(tokenData.expires_at)) {
    return { success: false, error: "Token sudah kedaluwarsa" };
  }

  if (tokenData.event_id !== eventId) {
    return { success: false, error: "Token bukan untuk event ini" };
  }

  // 2. Mark Token As Used & Insert to Queue (Ideally within an RPC or Transaction)
  // Fallback simplified logic for TDD
  await supabase
    .from('tokens')
    .update({ is_used: true })
    .eq('id', tokenData.id);

  const { data: queueData, error: queueError } = await supabase
    .from('queues')
    .insert({
      event_id: eventId,
      customer_name: customerName,
      token_id: tokenData.id,
      status: 'WAITING',
    })
    .select('id, status')
    .single();

  if (queueError) {
    return { success: false, error: "Gagal masuk antrean: " + queueError.message };
  }

  return {
    success: true,
    queue: queueData,
  };
}

export async function nextQueue(eventId: number) {
  // Ideally executed via the optimized raw query inside an RPC:
  // e.g. await supabase.rpc('next_queue_atomic', { p_event_id: eventId })
  
  // Basic TDD simulation logic
  const { data, error } = await supabase
    .from('queues')
    .select('id, customer_name, status')
    .eq('event_id', eventId)
    .eq('status', 'WAITING')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    return { success: false, error: "Tidak ada antrean WAITING" };
  }

  const { data: updated, error: updateError } = await supabase
    .from('queues')
    .update({ status: 'CALLED' })
    .eq('id', data.id)
    .select('id, customer_name, status')
    .single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, queue: updated };
}

export async function updateQueueStatus(queueId: number, targetStatus: 'DONE' | 'SKIPPED') {
  const { error } = await supabase
    .from('queues')
    .update({ status: targetStatus })
    .eq('id', queueId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Status antrean diperbarui" };
}

export async function getCurrentQueue(eventId: number) {
  const { data: currentQueue } = await supabase
    .from('queues')
    .select('id, customer_name, status, queue_number')
    .eq('event_id', eventId)
    .eq('status', 'CALLED')
    .order('queue_number', { ascending: true })
    .limit(1)
    .single();

  const { data: nextQueues } = await supabase
    .from('queues')
    .select('id, customer_name, queue_number')
    .eq('event_id', eventId)
    .eq('status', 'WAITING')
    .order('queue_number', { ascending: true })
    .limit(5);

  return {
    success: true,
    current_queue: currentQueue || null,
    next_queues: nextQueues || [],
  };
}

export async function saveResult(queueId: number, fileUrl: string) {
  if (!queueId || !fileUrl) {
    return { success: false, error: "Data tidak lengkap" };
  }

  const { data, error } = await supabase
    .from('results')
    .insert({
      queue_id: queueId,
      result_url: fileUrl,
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Get the event ID to form user link
  const { data: qData } = await supabase.from('queues').select('event_id').eq('id', queueId).single();
  const eventId = qData?.event_id || 1;

  const user_link = `/q/${eventId}/result/${queueId}`;

  return {
    success: true,
    data: {
      result_id: data.id,
      shareable_link: user_link
    }
  };
}
