'use server';

import { revalidatePath } from 'next/cache';
import { isRateLimited } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function revalidateProfile(username: string) {
  const headersList = await headers();
  let ip = headersList.get('x-forwarded-for') || '127.0.0.1';
  if (ip.includes(',')) ip = ip.split(',')[0].trim();
  
  if (isRateLimited(ip)) {
    throw new Error('Rate limit exceeded');
  }

  // Prevent directory traversal or strange chars
  const sanitizedUsername = username?.trim().split('/')[0];
  if (!sanitizedUsername) return;

  revalidatePath(`/u/${sanitizedUsername}`);
}
