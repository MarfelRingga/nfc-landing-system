import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import UnifiedCirclePage from './UnifiedCirclePage';

export const revalidate = 60;

export default async function CircleRouterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Fetch circle by slug
  const { data: circle, error: circleError } = await supabaseAdmin
    .from('circles')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .maybeSingle();

  if (!circle) {
    redirect('/');
  }

  // 2. Fetch lead info for public view
  const { data: lead } = await supabaseAdmin
    .from('circle_members')
    .select('profiles(full_name, username)')
    .eq('circle_id', circle.id)
    .eq('role', 'Admin')
    .maybeSingle();

  const leadProfile = lead?.profiles || null;

  // 3. Fetch all members for public view
  const { data: members } = await supabaseAdmin
    .from('circle_members')
    .select('id, role, color, profiles(id, full_name, username, avatar_url)')
    .eq('circle_id', circle.id);

  // 4. Fetch vault items for public view
  const { data: vaultItems } = await supabaseAdmin
    .from('vault_items')
    .select('*')
    .eq('circle_id', circle.id)
    .order('created_at', { ascending: false });

  return (
    <UnifiedCirclePage 
      circle={circle} 
      isMember={false} 
      userRole={null}
      session={null}
      leadProfile={leadProfile}
      initialMembers={members || []}
      initialVaultItems={vaultItems || []}
    />
  );
}
