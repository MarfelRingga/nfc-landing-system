import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper for sending messages back to Telegram
async function sendMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    }),
  });
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if it's a message
    if (!body.message || !body.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.trim();

    // Verification (Optional but recommended): only respond to authorized chat ID
    if (chatId.toString() !== process.env.TELEGRAM_CHAT_ID) {
      // You might want to ignore messages from unauthorized chats
      return NextResponse.json({ ok: true });
    }

    if (text === '/ping' || text === '/status') {
      // IDE 1: Cek Status Server / Layanan
      await sendMessage(chatId, "🟢 <b>Bot Active</b>\nSistem monitoring dan backup sedang berjalan.");
    } 
    else if (text === '/logs' || text === '/stats') {
      // IDE 2: Laporan / Log Terakhir
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      );

      const { data, error } = await supabaseAdmin
        .from('backup_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        await sendMessage(chatId, "⚠️ Gagal mengambil log backup dari database.");
      } else if (!data || data.length === 0) {
        await sendMessage(chatId, "Tidak ada data log backup.");
      } else {
        let msg = "📊 <b>5 Log Backup Terakhir:</b>\n\n";
        data.forEach((log: any, index: number) => {
          const statusIcon = log.status === 'success' ? '✅' : (log.status === 'running' ? '⏳' : '❌');
          const date = new Date(log.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
          msg += `${index + 1}. ${statusIcon} <b>${log.status.toUpperCase()}</b>\n`;
          msg += `📅 ${date}\n`;
          if (log.file_size) msg += `📦 Ukuran: ${formatBytes(log.file_size)}\n`;
          if (log.error_message) msg += `⚠️ Error: <code>${log.error_message.substring(0, 50)}...</code>\n`;
          msg += "\n";
        });
        await sendMessage(chatId, msg);
      }
    }
    else if (text === '/backup') {
      // IDE 3: Memicu backup manual via GitHub Actions
      const githubToken = process.env.GITHUB_PAT;
      const githubRepo = process.env.GITHUB_REPO; // e.g. "username/nfc-landing-system"

      if (!githubToken || !githubRepo) {
        await sendMessage(chatId, "⚠️ Konfigurasi <code>GITHUB_PAT</code> atau <code>GITHUB_REPO</code> belum di-set di environment.");
        return NextResponse.json({ ok: true });
      }

      const res = await fetch(`https://api.github.com/repos/${githubRepo}/actions/workflows/supabase_backup.yml/dispatches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ref: 'main' })
      });

      if (res.ok) {
        await sendMessage(chatId, "🚀 <b>Backup Triggered!</b>\nWorkflow GitHub Actions telah dijalankan. Tunggu notifikasi hasil backupnya.");
      } else {
        const err = await res.text();
        await sendMessage(chatId, `❌ <b>Gagal memicu backup.</b>\nResponse: <code>${err}</code>`);
      }
    } else {
      // Tampilkan menu jika perintah tidak dikenali
      const helpMsg = "🤖 <b>Menu Bot Rifelo Backup</b>\n\n" +
                      "/ping - Cek status bot\n" +
                      "/logs - Lihat 5 log backup terakhir\n" +
                      "/backup - Mulai backup sekarang (Manual Trigger)";
      
      await sendMessage(chatId, helpMsg);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
