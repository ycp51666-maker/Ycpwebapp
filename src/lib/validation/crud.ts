import { z } from 'zod';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const uuidSchema = (msg?: string) => z.string().regex(uuidRegex, msg || 'Invalid UUID');

export const locationCrudSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(100),
  short_description: z.string().max(300).optional().or(z.literal('')),
  full_description: z.string().optional().or(z.literal('')),
  hero_image_path: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  map_url: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  display_order: z.number().int().default(0),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  location_status: z.enum(['current', 'upcoming']).default('current'),
  show_in_navigation: z.boolean().default(true),
});

export const projectCrudSchema = z.object({
  location_id: uuidSchema('Please select a valid location'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(150),
  short_description: z.string().max(500).optional().or(z.literal('')),
  full_description: z.string().optional().or(z.literal('')),
  project_status: z.enum(['Upcoming', 'Ongoing', 'Completed']).default('Ongoing'),
  approval_type: z.string().optional().or(z.literal('')),
  approval_number: z.string().optional().or(z.literal('')),
  total_area: z.string().optional().or(z.literal('')),
  total_plots: z.number().int().optional().nullable(),
  total_villas: z.number().int().optional().nullable(),
  starting_price: z.number().optional().nullable(),
  address: z.string().optional().or(z.literal('')),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  map_url: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  hero_image_path: z.string().optional().or(z.literal('')),
  hero_video_path: z.string().optional().or(z.literal('')),
  display_order: z.number().int().default(0),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const propertyConfigCrudSchema = z.object({
  project_id: uuidSchema('Please select a valid project'),
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  property_type: z.enum(['Plot', 'Villa', 'Apartment', 'Commercial']),
  bhk: z.number().int().optional().nullable(),
  plot_area: z.string().optional().or(z.literal('')),
  built_up_area: z.string().optional().or(z.literal('')),
  bedrooms: z.number().int().optional().nullable(),
  bathrooms: z.number().int().optional().nullable(),
  parking: z.string().optional().or(z.literal('')),
  floors: z.number().int().optional().nullable(),
  starting_price: z.number().optional().nullable(),
  price_display_mode: z.enum(['Fixed', 'Starting From', 'On Request']).default('Starting From'),
  availability_status: z.enum(['Available', 'Sold Out', 'Fast Filling']).default('Available'),
  short_description: z.string().optional().or(z.literal('')),
  full_description: z.string().optional().or(z.literal('')),
  feature_list: z.union([z.array(z.string()), z.string()]).optional(),
  hero_image_path: z.string().optional().or(z.literal('')),
  gallery_images: z.union([z.array(z.string()), z.string()]).optional(),
  display_order: z.number().int().default(0),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const amenityCrudSchema = z.object({
  name: z.string().min(2, 'Amenity name required'),
  icon_key: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  category: z.enum(['land', 'house', 'general']).default('general'),
  active: z.boolean().default(true),
});


export const landmarkCrudSchema = z.object({
  project_id: uuidSchema('Project is required'),
  name: z.string().min(2, 'Landmark name is required'),
  distance_label: z.string().min(1, 'Distance label required (e.g. 5 Mins)'),
  travel_time_label: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  image_url: z.string().optional().or(z.literal('')),
  display_order: z.number().int().default(0),
});

export const galleryCrudSchema = z.object({
  title: z.string().optional().or(z.literal('')),
  media_type: z.enum(['image', 'video', 'youtube', 'instagram']).default('image'),
  storage_path_or_url: z.string().optional().or(z.literal('')),
  thumbnail_path: z.string().optional().or(z.literal('')),
  alt_text: z.string().optional().or(z.literal('')),
  caption: z.string().optional().or(z.literal('')),
  project_id: uuidSchema().optional().or(z.literal('')).nullable(),
  location_id: uuidSchema().optional().or(z.literal('')).nullable(),
  category: z.string().optional().or(z.literal('')).default('Overview'),
  video_url: z.string().optional().or(z.literal('')),
  embed_type: z.enum(['supabase', 'youtube', 'instagram']).optional().nullable(),
  display_order: z.number().int().default(0),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const seoMetadataCrudSchema = z.object({
  entity_type: z.string().min(2),
  entity_id: z.string().optional().nullable(),
  meta_title: z.string().min(5, 'Meta title required'),
  meta_description: z.string().min(10, 'Meta description required'),
  meta_keywords: z.string().optional().or(z.literal('')),
  canonical_url: z.string().optional().or(z.literal('')),
  open_graph_title: z.string().optional().or(z.literal('')),
  open_graph_description: z.string().optional().or(z.literal('')),
  open_graph_image_path: z.string().optional().or(z.literal('')),
  index_enabled: z.boolean().default(true),
  sitemap_priority: z.number().min(0).max(1).nullable().optional(),
  sitemap_change_frequency: z
    .enum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])
    .nullable()
    .optional(),
  json_ld_override: z.any().optional().nullable(),
  robots_directives: z.string().optional().nullable(),
  og_type: z.string().optional().nullable(),
  twitter_card: z.string().optional().nullable(),
  focus_keyword: z.string().optional().nullable(),
  redirect_url: z.string().optional().or(z.literal('')).nullable(),
  redirect_type: z.number().optional().nullable(),
  open_graph_image_alt: z.string().optional().or(z.literal('')).nullable(),
  custom_tracking_script: z.string().optional().or(z.literal('')).nullable(),
});

