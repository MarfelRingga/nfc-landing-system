import { NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/sendTelegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, stack, url, customContext } = body;

    const botMessage = `💥 <b>App Error / Web Down Notification</b>\n\n<b>URL:</b> ${url || 'Unknown'}\n<b>Context:</b> ${customContext || 'Frontend Error'}\n\n<b>Message:</b>\n<pre>${message}</pre>\n\n<b>Stack:</b>\n<pre>${stack ? stack.slice(0, 500) + '...' : 'No stack provided'}</pre>`;

    await sendTelegramNotification(botMessage);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to process error notification:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
