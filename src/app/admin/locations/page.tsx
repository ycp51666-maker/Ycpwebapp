import React from 'react';
import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';
import { LocationsClientManager } from './LocationsClientManager';

export const dynamic = 'force-dynamic';

export default async function AdminLocationsPage() {
  await requireAdmin(['super_admin', 'content_admin']);

  const supabase = await createAdminClient();
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('display_order', { ascending: true });

  return <LocationsClientManager initialLocations={locations || []} />;
}
