import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendWelcomeEmail } from '@/lib/sendEmail';
import { sendTelegramNotification } from '@/lib/sendTelegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, password, username } = body;

    if (!email || !phone || !password || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use admin endpoint to create user with BOTH email and phone identities.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      phone,
      password,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        username: username,
        full_name: username,
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Await the email sending so the server doesn't terminate before it completes.
    // Wrap in try-catch so registration still succeeds even if email fails.
    try {
      const emailPromise = sendWelcomeEmail(email, username);
      
      const telegramMessage = `🚀 <b>New User Registration!</b>\n\n<b>Username:</b> ${username}\n<b>Email:</b> ${email}\n<b>Phone:</b> ${phone}`;
      const telegramPromise = sendTelegramNotification(telegramMessage);

      const [emailResult, telegramResult] = await Promise.all([emailPromise, telegramPromise]);
      
      if (!emailResult.success) {
        console.error('Failed to send welcome email:', emailResult.error);
      }
      
      if (!telegramResult.success) {
        console.error('Failed to send Telegram notification:', telegramResult.error);
      }
    } catch (err) {
      console.error('Exception during notifications:', err);
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
