import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { formatIndonesianPhoneNumber } from '@/lib/phone';

export async function POST(request: Request) {
  try {
    const { phone, code: rawCode, newPassword } = await request.json();

    if (!phone || !rawCode || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const code = rawCode.trim();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error. Missing service role key.' },
        { status: 500 }
      );
    }

    // Create a Supabase client with the Service Role Key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Clean phone number (remove spaces and dashes)
    const formattedPhone = formatIndonesianPhoneNumber(phone);
    const phoneWithoutPlus = formattedPhone.startsWith('+') ? formattedPhone.substring(1) : formattedPhone;
    const localPhone = phoneWithoutPlus.startsWith('62') ? '0' + phoneWithoutPlus.substring(2) : phoneWithoutPlus;

    console.log(`[Reset Password] Searching for phone: '${formattedPhone}', '${phoneWithoutPlus}', or '${localPhone}', code: '${code}'`);

    // 1. Verify the code in reset_codes table
    // We fetch by secret_code first, then filter by phone in JS to handle any phone formatting in the database
    const { data: resetRecords, error: resetError } = await supabaseAdmin
      .from('reset_codes')
      .select('*')
      .eq('secret_code', code)
      .not('is_used', 'eq', true);

    if (resetError) {
      console.error('[Reset Password] Database error:', resetError);
      return NextResponse.json(
        { error: `Database error: ${resetError.message}. Did you run the SQL script?` },
        { status: 500 }
      );
    }

    // Find a record where the cleaned phone matches
    const resetRecord = resetRecords?.find(record => {
      if (!record.phone) return false;
      const dbPhoneStr = String(record.phone);
      
      // Clean both phones (remove all non-digits)
      let dbPhoneCleaned = dbPhoneStr.replace(/\D/g, '');
      let inputPhoneCleaned = phone.replace(/\D/g, '');
      
      // Strip leading country codes or local prefixes
      if (dbPhoneCleaned.startsWith('62')) dbPhoneCleaned = dbPhoneCleaned.substring(2);
      else if (dbPhoneCleaned.startsWith('0')) dbPhoneCleaned = dbPhoneCleaned.substring(1);
      
      if (inputPhoneCleaned.startsWith('62')) inputPhoneCleaned = inputPhoneCleaned.substring(2);
      else if (inputPhoneCleaned.startsWith('0')) inputPhoneCleaned = inputPhoneCleaned.substring(1);
      
      return dbPhoneCleaned === inputPhoneCleaned;
    });

    if (!resetRecord) {
      console.log(`[Reset Password] No match found. Make sure the database has phone='${formattedPhone}' or '${phoneWithoutPlus}' and secret_code='${code}' and is_used=false`);
      return NextResponse.json(
        { error: 'Invalid or expired reset code. Please check your phone number and code.' },
        { status: 400 }
      );
    }

    // 2. Get the user ID using our secure RPC function
    // Try with '+' first (standard E.164 format)
    let { data: userId, error: rpcError } = await supabaseAdmin.rpc('get_user_id_by_phone', {
      phone_number: formattedPhone
    });

    // If not found, try without '+' (in case it was saved differently during registration)
    if (!userId && !rpcError) {
      console.log(`[Reset Password] User not found with '${formattedPhone}', trying '${phoneWithoutPlus}'...`);
      const fallbackResult = await supabaseAdmin.rpc('get_user_id_by_phone', {
        phone_number: phoneWithoutPlus
      });
      userId = fallbackResult.data;
      rpcError = fallbackResult.error;
    }

    // If still not found, try local format (08...)
    if (!userId && !rpcError) {
      console.log(`[Reset Password] User not found with '${phoneWithoutPlus}', trying '${localPhone}'...`);
      const localResult = await supabaseAdmin.rpc('get_user_id_by_phone', {
        phone_number: localPhone
      });
      userId = localResult.data;
      rpcError = localResult.error;
    }

    // If still not found, try raw phone without prefix (8...)
    if (!userId && !rpcError) {
      const rawPhone = phoneWithoutPlus.startsWith('62') ? phoneWithoutPlus.substring(2) : phoneWithoutPlus;
      console.log(`[Reset Password] User not found with '${localPhone}', trying '${rawPhone}'...`);
      const rawResult = await supabaseAdmin.rpc('get_user_id_by_phone', {
        phone_number: rawPhone
      });
      userId = rawResult.data;
      rpcError = rawResult.error;
    }

    if (rpcError) {
      console.error('RPC error when getting user ID:', rpcError);
      return NextResponse.json(
        { error: `RPC error: ${rpcError.message}. Did you create the get_user_id_by_phone function?` },
        { status: 500 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User account not found for this phone number in the authentication system.' },
        { status: 404 }
      );
    }

    // 3. Update the user's password using Admin API
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateAuthError) {
      return NextResponse.json(
        { error: updateAuthError.message },
        { status: 400 }
      );
    }

    // 4. Mark code as used
    await supabaseAdmin
      .from('reset_codes')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', resetRecord.id);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
