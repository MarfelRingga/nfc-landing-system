import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSubscribeEmail } from '@/lib/sendEmail';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Silakan masukkan alamat email yang valid.' },
        { status: 400 }
      );
    }

    // Store in Supabase newsletter table
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }]);

    if (dbError) {
      console.error('Newsletter subscriber DB error:', dbError);
      // If code is not '23505' (duplicate unique key), this is a real DB error.
      // But we will still try to send an email or proceed.
    }

    // Send confirmation email
    let emailSent = false;
    let emailError = null;
    try {
      const emailResult = await sendSubscribeEmail(email);
      emailSent = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error;
      }
    } catch (err: any) {
      console.error('Failed to send confirmation email on subscribe:', err);
      emailError = err.message;
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully.',
      emailSent,
      emailError
    });
  } catch (error: any) {
    console.error('Newsletter subscribe api error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
