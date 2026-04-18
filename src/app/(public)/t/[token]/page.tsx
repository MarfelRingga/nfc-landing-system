import { redirect, notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

async function fetchTokenDestination(token: string) {
  console.log(`[t/${token}] Fetching destination for token: "${token}"`);
  try {
    // 1. Find the tag by token (case-insensitive)
    const { data: tag, error: tagError } = await supabaseAdmin
      .from('nfc_tags')
      .select('user_id, status, interaction_mode, redirect_url')
      .ilike('token', token.trim())
      .maybeSingle();

    console.log(`[t/${token}] Tag fetch result:`, { tag, tagError });

    if (tagError || !tag) {
      return { isValid: false, destination: null };
    }

    // 2. Check if tag is active
    if (tag.status !== 'active') {
      return { isValid: false, destination: null };
    }

    // 3. Handle redirect mode
    if (tag.interaction_mode === 'redirect' && tag.redirect_url) {
      let finalUrl = tag.redirect_url;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      return { isValid: true, destination: finalUrl, isExternal: true };
    }

    // 4. Handle circle mode
    if (tag.interaction_mode === 'circle' && tag.redirect_url) {
      return { isValid: true, destination: `/c/${tag.redirect_url}`, isExternal: false };
    }

    // 5. Handle profile mode (default)
    if (tag.user_id) {
      // Get the user's profile to find their username
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('id', tag.user_id)
        .maybeSingle();

      console.log(`[t/${token}] Profile fetch result for user_id ${tag.user_id}:`, { profile, profileError });

      if (profileError || !profile || !profile.username) {
        return { isValid: false, destination: null };
      }

      return { isValid: true, destination: `/u/${profile.username}`, isExternal: false };
    }

    // Tag is valid but not claimed
    return { isValid: true, destination: `/claim?token=${token}`, isExternal: false };
  } catch (error) {
    console.error('Error fetching token destination:', error);
    return { isValid: false, destination: null };
  }
}

export default async function NFCTagRedirectPage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  // In Next.js 15, params is a Promise and must be awaited
  const { token } = await params;
  
  const destination = await fetchTokenDestination(token);
  console.log(`[t/${token}] Redirecting to:`, destination);
  
  if (destination.isValid && destination.destination) {
    if (destination.isExternal) {
      // For external URLs, we can't use Next.js redirect directly if it's a full URL
      // We'll use a meta refresh or standard redirect
      redirect(destination.destination);
    } else {
      // Redirect to the Digital ID / Public Profile
      redirect(destination.destination);
    }
  } else {
    // Redirect to a 404 or claim page if the token is invalid or unassigned
    notFound();
  }
}

