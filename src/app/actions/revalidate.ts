'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateProfile(username: string) {
  revalidatePath(`/u/${username}`);
}
