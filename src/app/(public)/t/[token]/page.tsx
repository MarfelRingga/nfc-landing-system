import { redirect, notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Removed edge runtime due to connection drop on initial load.
export const dynamic = 'force-dynamic';

export async function fetchTokenDestination(token: string) {
  try {
    // 1. Find the tag and related data in ONE query (except profiles)
    const { data: tag, error: tagError } = await supabaseAdmin
      .from('nfc_tags')
      .select(`
        user_id, 
        status, 
        interaction_mode, 
        redirect_url, 
        circle_id,
        circles (slug, invite_code)
      `)
      .eq('token', token.trim())
      .maybeSingle();

    if (tagError || !tag || tag.status !== 'active') {
      return { isValid: false, destination: null };
    }

    // 2. Handle redirect mode
    if (tag.interaction_mode === 'redirect' && tag.redirect_url) {
      let finalUrl = tag.redirect_url;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      return { isValid: true, destination: finalUrl, isExternal: true };
    }

    // 2.5 Handle queue mode
    if (tag.interaction_mode === 'photobooth' && tag.redirect_url) {
      let finalUrl = tag.redirect_url;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      return { isValid: true, destination: finalUrl, isExternal: true };
    }

    // 3. Handle circle mode
    if (tag.interaction_mode === 'circle') {
      if (tag.redirect_url) {
        return { isValid: true, destination: `/c/${tag.redirect_url}`, isExternal: false };
      }
      
      const circleData = tag.circles as any;
      const target = circleData?.slug || circleData?.invite_code;
      if (target) {
        return { isValid: true, destination: `/c/${target}`, isExternal: false };
      }
    }

    // 4. Handle profile mode (default)
    if (tag.user_id) {
      // Manually fetch the username from profiles
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('id', tag.user_id)
        .maybeSingle();
        
      if (profileData?.username) {
        return { isValid: true, destination: `/u/${profileData.username}`, isExternal: false };
      }
      return { isValid: true, destination: '/', isExternal: false };
    }

    // Tag is active but not claimed
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
  const { token } = await params;
  const destination = await fetchTokenDestination(token);
  
  if (destination.isValid && destination.destination) {
    redirect(destination.destination);
  } else {
    notFound();
  }
}

