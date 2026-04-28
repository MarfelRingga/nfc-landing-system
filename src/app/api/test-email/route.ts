import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/sendEmail';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Tolong sertakan parameter email. Contoh: /api/test-email?email=kamu@domain.com' },
      { status: 400 }
    );
  }

  try {
    const result = await sendWelcomeEmail(email, 'Test User');
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Berhasil mengirim email ke ${email}`, 
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
