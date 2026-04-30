import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendWelcomeEmail } from '@/lib/sendEmail';
import { sendTelegramNotification } from '@/lib/sendTelegram';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting protection
    let ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    if (isRateLimited(ip, 5, 60000)) { // Max 5 registrations per minute per IP
      return NextResponse.json({ error: 'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.' }, { status: 429 });
    }

    const body = await req.json();
    const { email, phone, password, username, nfcTagCode } = body;

    if (!email || !phone || !password || !username || !nfcTagCode) {
      return NextResponse.json({ error: 'Data pendaftaran tidak lengkap.' }, { status: 400 });
    }

    // 1. Check if username is taken (Case-insensitive)
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .ilike('username', username.trim())
      .maybeSingle();

    if (profileCheckError) {
      console.error('Profile check error:', profileCheckError);
      return NextResponse.json({ error: 'Gagal memvalidasi username.' }, { status: 500 });
    }

    if (existingProfile) {
      return NextResponse.json({ error: 'Username ini sudah digunakan.' }, { status: 400 });
    }

    // 2. Validate NFC Tag
    const { data: tag, error: tagError } = await supabaseAdmin
      .from('nfc_tags')
      .select('id, user_id')
      .ilike('token', nfcTagCode.trim())
      .maybeSingle();

    if (tagError) {
      console.error('Tag validation error:', tagError);
      return NextResponse.json({ error: 'Gagal memvalidasi tag NFC.' }, { status: 500 });
    }

    if (!tag) {
      return NextResponse.json({ error: 'Kode tag NFC tidak valid.' }, { status: 400 });
    }

    if (tag.user_id) {
      return NextResponse.json({ error: 'Tag ini sudah terhubung dengan akun lain.' }, { status: 400 });
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

    // 3. Link tag to the newly created user
    const { error: tagLinkError } = await supabaseAdmin
      .from('nfc_tags')
      .update({ 
        user_id: data.user!.id,
        status: 'active',
        tag_name: 'Tag Utama'
      })
      .eq('id', tag.id);

    if (tagLinkError) {
      console.error('Failed to link tag during registration:', tagLinkError);
      // We still proceed since user is created, but we could notify admin or log it heavily.
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
    
    // Notify Telegram about the error
    sendTelegramNotification(
      `💥 <b>Server Error during Registration</b>\n\n<b>Message:</b> ${error.message}`
    ).catch(e => console.error('Failed to send error to telegram:', e));

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
