'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';
import {
  locationCrudSchema,
  projectCrudSchema,
  propertyConfigCrudSchema,
  amenityCrudSchema,
  landmarkCrudSchema,
  galleryCrudSchema,
  seoMetadataCrudSchema,
} from '@/lib/validation/crud';
import { isSlugUnique } from '@/lib/utils/slug';
import { ContentPageKey } from '@/types/database';

// Helper for type-safe Supabase table queries
async function getSupabaseAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await createAdminClient()) as any;
}

// -------------------------------------------------------------
// 1. LOCATIONS CRUD ACTIONS
// -------------------------------------------------------------
export async function saveLocationAction(data: Record<string, unknown>, id?: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const validated = locationCrudSchema.parse(data);

    const isUnique = await isSlugUnique('locations', validated.slug, id);
    if (!isUnique) {
      return { success: false, error: 'Slug is already in use or collision with reserved routes.' };
    }

    const supabase = await getSupabaseAdmin();

    let query;
    if (id) {
      query = supabase.from('locations').update({ ...validated, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      query = supabase.from('locations').insert(validated);
    }

    const { error } = await query;
    if (error) {
      console.error('Error saving location:', error.message);
      return { success: false, error: 'Database error saving location record.' };
    }

    revalidatePath('/locations');
    revalidatePath(`/locations/${validated.slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Validation error in saveLocationAction:', err);
    return { success: false, error: 'Validation error: Please check all required fields.' };
  }
}

export async function deleteLocationAction(id: string) {
  try {
    await requireAdmin(['super_admin']);
    const supabase = await getSupabaseAdmin();

    // Check project dependencies
    const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('location_id', id);
    if (count && count > 0) {
      return { success: false, error: `Cannot delete location: ${count} projects are assigned to this location.` };
    }

    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/locations');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Unauthorized or database deletion error.' };
  }
}

export async function togglePublishLocationAction(id: string, currentStatus: boolean) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase.from('locations').update({ published: !currentStatus }).eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/locations');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to toggle publication status.' };
  }
}

// -------------------------------------------------------------
// 2. PROJECTS CRUD ACTIONS
// -------------------------------------------------------------
export async function saveProjectAction(data: Record<string, unknown>, id?: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const validated = projectCrudSchema.parse(data);

    const isUnique = await isSlugUnique('projects', validated.slug, id);
    if (!isUnique) {
      return { success: false, error: 'Project slug is taken or clashes with reserved routes.' };
    }

    const supabase = await getSupabaseAdmin();

    let query;
    if (id) {
      query = supabase.from('projects').update({ ...validated, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      query = supabase.from('projects').insert(validated);
    }

    const { error } = await query;
    if (error) return { success: false, error: error.message };

    revalidatePath('/projects');
    revalidatePath(`/projects/${validated.slug}`);
    revalidatePath('/locations');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Validation failed for project entry.' };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await requireAdmin(['super_admin']);
    const supabase = await getSupabaseAdmin();

    // Check configuration dependencies
    const { count } = await supabase.from('property_configurations').select('*', { count: 'exact', head: true }).eq('project_id', id);
    if (count && count > 0) {
      return { success: false, error: `Cannot delete project: ${count} property configurations belong to this project.` };
    }

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete project.' };
  }
}

export async function togglePublishProjectAction(id: string, currentStatus: boolean) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase.from('projects').update({ published: !currentStatus }).eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to toggle publication status.' };
  }
}

// -------------------------------------------------------------
// 3. PROPERTY CONFIGURATIONS CRUD ACTIONS
// -------------------------------------------------------------
export async function savePropertyConfigAction(data: Record<string, unknown>, id?: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const validated = propertyConfigCrudSchema.parse(data);

    const isUnique = await isSlugUnique('property_configurations', validated.slug, id);
    if (!isUnique) {
      return { success: false, error: 'Property configuration slug is already taken.' };
    }

    const supabase = await getSupabaseAdmin();

    let query;
    if (id) {
      query = supabase.from('property_configurations').update({ ...validated, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      query = supabase.from('property_configurations').insert(validated);
    }

    const { error } = await query;
    if (error) return { success: false, error: error.message };

    revalidatePath('/properties');
    revalidatePath(`/properties/${validated.slug}`);
    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Validation failed for property configuration.' };
  }
}

export async function deletePropertyConfigAction(id: string) {
  try {
    await requireAdmin(['super_admin']);
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase.from('property_configurations').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/properties');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete configuration.' };
  }
}

// -------------------------------------------------------------
// 4. AMENITIES & LANDMARKS CRUD ACTIONS
// -------------------------------------------------------------
export async function saveAmenityAction(data: Record<string, unknown>, id?: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const validated = amenityCrudSchema.parse(data);
    const supabase = await getSupabaseAdmin();

    let query;
    if (id) {
      query = supabase.from('amenities').update(validated).eq('id', id);
    } else {
      query = supabase.from('amenities').insert(validated);
    }

    const { error } = await query;
    if (error) return { success: false, error: error.message };

    revalidatePath('/projects');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save amenity.' };
  }
}

export async function deleteAmenityAction(id: string) {
  try {
    await requireAdmin(['super_admin']);
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase.from('amenities').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/projects');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete amenity.' };
  }
}

export async function saveLandmarkAction(data: Record<string, unknown>, id?: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const validated = landmarkCrudSchema.parse(data);
    const supabase = await getSupabaseAdmin();

    let query;
    if (id) {
      query = supabase.from('landmarks').update(validated).eq('id', id);
    } else {
      query = supabase.from('landmarks').insert(validated);
    }

    const { error } = await query;
    if (error) return { success: false, error: error.message };

    revalidatePath('/projects');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save landmark.' };
  }
}

export async function deleteLandmarkAction(id: string) {
  try {
    await requireAdmin(['super_admin']);
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase.from('landmarks').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/projects');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete landmark.' };
  }
}

// -------------------------------------------------------------
// 5. GALLERY ITEMS CRUD ACTIONS
// -------------------------------------------------------------
export async function saveGalleryItemAction(data: Record<string, unknown>, id?: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const schema = id ? galleryCrudSchema.partial() : galleryCrudSchema;
    const validated = schema.parse(data);
    const supabase = await getSupabaseAdmin();

    // Map input media_type ('youtube' | 'instagram' | 'video' | 'image') to DB column rules:
    // Postgres check constraint requires media_type IN ('image', 'video').
    let dbMediaType: 'image' | 'video' | undefined;
    let dbEmbedType: 'supabase' | 'youtube' | 'instagram' | null | undefined;

    if (validated.media_type) {
      if (validated.media_type === 'youtube') {
        dbMediaType = 'video';
        dbEmbedType = 'youtube';
      } else if (validated.media_type === 'instagram') {
        dbMediaType = 'video';
        dbEmbedType = 'instagram';
      } else if (validated.media_type === 'video') {
        dbMediaType = 'video';
        dbEmbedType = 'supabase';
      } else {
        dbMediaType = 'image';
        dbEmbedType = null;
      }
    } else if (validated.embed_type) {
      dbEmbedType = validated.embed_type;
      dbMediaType = (dbEmbedType === 'youtube' || dbEmbedType === 'instagram' || dbEmbedType === 'supabase') ? 'video' : 'image';
    }

    const storageUrl = validated.storage_path_or_url ?? validated.video_url;
    const videoUrl = validated.video_url ?? validated.storage_path_or_url ?? null;

    const payload: Record<string, unknown> = {
      ...validated,
    };

    if (validated.project_id !== undefined) {
      payload.project_id = validated.project_id || null;
    }
    if (validated.location_id !== undefined) {
      payload.location_id = validated.location_id || null;
    }
    if (storageUrl !== undefined) {
      payload.storage_path_or_url = storageUrl;
    }
    if (videoUrl !== undefined) {
      payload.video_url = videoUrl;
    }

    if (dbMediaType !== undefined) {
      payload.media_type = dbMediaType;
      payload.embed_type = dbEmbedType;
    }

    let query;
    if (id) {
      query = supabase.from('gallery_items').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      // For insert, ensure required DB columns are present
      if (!payload.storage_path_or_url) {
        return { success: false, error: 'Media URL or file path is required.' };
      }
      if (!payload.media_type) {
        payload.media_type = 'image';
      }
      query = supabase.from('gallery_items').insert(payload);
    }

    const { error } = await query;
    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/gallery');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    if (err && err.errors && Array.isArray(err.errors)) {
      const messages = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Validation error: ${messages}` };
    }
    return { success: false, error: err?.message || 'Failed to save gallery item.' };
  }
}

export async function deleteGalleryItemAction(id: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase.from('gallery_items').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/gallery');
    revalidatePath('/');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete gallery item.' };
  }
}

// -------------------------------------------------------------
// 6. CONTENT PAGES & SEO METADATA ACTIONS
// -------------------------------------------------------------
export async function saveContentPageAction(
  pageKey: ContentPageKey,
  title: string,
  content: Record<string, unknown>,
  published = true
) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const supabase = await getSupabaseAdmin();

    const slugMap: Record<string, string> = {
      home: 'home',
      about: 'about-us',
      services: 'services',
      contact: 'contact-us',
      privacy: 'privacy-policy',
      terms: 'terms-and-conditions',
    };

    const slug = slugMap[pageKey] || pageKey;

    const { error } = await supabase.from('content_pages').upsert(
      {
        page_key: pageKey,
        slug,
        title,
        content: content as unknown as Record<string, string>,
        published,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'page_key' }
    );

    if (error) return { success: false, error: error.message };

    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/about-us');
    revalidatePath('/services');
    revalidatePath('/contact');
    revalidatePath('/contact-us');
    revalidatePath('/privacy-policy');
    revalidatePath('/terms-and-conditions');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update content page.';
    return { success: false, error: message };
  }
}

export async function saveSeoMetadataAction(data: Record<string, unknown>, id?: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const validated = seoMetadataCrudSchema.parse(data);
    const supabase = await getSupabaseAdmin();

    let query;
    if (id) {
      query = supabase.from('seo_metadata').update({ ...validated, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      query = supabase.from('seo_metadata').insert(validated);
    }

    const { error } = await query;
    if (error) return { success: false, error: error.message };

    // Revalidate all relevant routes
    revalidatePath('/', 'layout');
    revalidatePath('/sitemap.xml');
    revalidatePath('/robots.txt');
    revalidatePath('/about-us');
    revalidatePath('/contact-us');
    revalidatePath('/services');
    revalidatePath('/gallery');
    revalidatePath('/locations');
    revalidatePath('/projects');
    revalidatePath('/properties');
    revalidatePath('/privacy-policy');
    revalidatePath('/terms-and-conditions');
    revalidatePath('/plots-for-sale-in-namakkal');
    revalidatePath('/dtcp-approved-plots-in-paramathi-velur');
    revalidatePath('/villas-for-sale-in-namakkal');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save SEO metadata entry.' };
  }
}

export async function deleteSeoMetadataAction(id: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const supabase = await getSupabaseAdmin();
    const { error } = await supabase.from('seo_metadata').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/', 'layout');
    revalidatePath('/sitemap.xml');
    revalidatePath('/robots.txt');
    revalidatePath('/about-us');
    revalidatePath('/contact-us');
    revalidatePath('/services');
    revalidatePath('/gallery');
    revalidatePath('/locations');
    revalidatePath('/projects');
    revalidatePath('/properties');
    revalidatePath('/privacy-policy');
    revalidatePath('/terms-and-conditions');
    revalidatePath('/plots-for-sale-in-namakkal');
    revalidatePath('/dtcp-approved-plots-in-paramathi-velur');
    revalidatePath('/villas-for-sale-in-namakkal');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete SEO metadata entry.' };
  }
}

export async function saveRobotsConfigAction(rulesJson: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    let parsed: unknown;
    try {
      parsed = JSON.parse(rulesJson);
    } catch {
      return { success: false, error: 'Invalid JSON in robots configuration.' };
    }
    const supabase = await getSupabaseAdmin();
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'robots_config', value: parsed, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) return { success: false, error: error.message };
    revalidatePath('/robots.txt');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save robots configuration.' };
  }
}

export async function updateAdminUserAction(
  id: string,
  data: { full_name: string; role: 'super_admin' | 'content_admin' | 'sales_admin'; is_active: boolean }
) {
  try {
    await requireAdmin(['super_admin']);
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from('admin_profiles')
      .update({
        full_name: data.full_name,
        role: data.role,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating admin profile:', error.message);
      return { success: false, error: 'Database error updating admin profile.' };
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    console.error('Permission or error in updateAdminUserAction:', err);
    return { success: false, error: 'Permission denied or update error.' };
  }
}

export async function saveSiteSettingAction(key: string, value: Record<string, unknown> | unknown[]) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (error) {
      console.error('Error saving site setting:', error.message);
      return { success: false, error: 'Database error saving site setting.' };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Permission error in saveSiteSettingAction:', err);
    return { success: false, error: 'Permission denied or update error.' };
  }
}

export async function getProjectAmenitiesAction(projectId: string) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const supabase = await getSupabaseAdmin();

    const { data, error } = await supabase
      .from('project_amenities')
      .select('*, amenity:amenities(*)')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch {
    return { success: false, error: 'Failed to fetch project amenities.' };
  }
}

export async function saveProjectAmenitiesAction(
  projectId: string,
  amenities: Array<{ amenity_id: string; custom_description?: string; display_order: number }>
) {
  try {
    await requireAdmin(['super_admin', 'content_admin']);
    const supabase = await getSupabaseAdmin();

    // Delete existing links
    const { error: deleteError } = await supabase
      .from('project_amenities')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) return { success: false, error: deleteError.message };

    // Insert new links if any
    if (amenities.length > 0) {
      const inserts = amenities.map((am) => ({
        project_id: projectId,
        amenity_id: am.amenity_id,
        custom_description: am.custom_description || null,
        display_order: am.display_order,
      }));

      const { error: insertError } = await supabase
        .from('project_amenities')
        .insert(inserts);

      if (insertError) return { success: false, error: insertError.message };
    }

    revalidatePath('/projects');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save project amenities.' };
  }
}

export async function getInstagramThumbnailAction(url: string): Promise<string | null> {
  try {
    if (!url) return null;
    const match = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/);
    if (!match || !match[1]) return null;
    const id = match[1];

    // Attempt 1: Fetch Instagram oEmbed endpoint
    try {
      const oembedRes = await fetch(`https://api.instagram.com/oembed?url=https://www.instagram.com/p/${id}/`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        next: { revalidate: 86400 },
      });
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.thumbnail_url) return data.thumbnail_url;
      }
    } catch {
      // ignore and try fallback
    }

    // Attempt 2: Follow media redirect to CDN image URL
    try {
      const mediaRes = await fetch(`https://www.instagram.com/p/${id}/media/?size=l`, {
        method: 'HEAD',
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      });
      if (mediaRes.ok && mediaRes.url && mediaRes.url.includes('cdninstagram.com')) {
        return mediaRes.url;
      }
    } catch {
      // ignore
    }

    return null;
  } catch {
    return null;
  }
}
