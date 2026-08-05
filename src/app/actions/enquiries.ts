'use server';

import { contactMessageSchema, siteVisitSchema } from '@/lib/validation/messages';
import { createPublicClient } from '@/lib/supabase/server';

interface EnquiryQueryBuilder extends PromiseLike<{ data?: unknown; error?: { message: string } | null }> {
  select(columns: string): EnquiryQueryBuilder;
  insert(data: unknown): EnquiryQueryBuilder;
  eq(column: string, value: unknown): EnquiryQueryBuilder;
  maybeSingle(): Promise<{ data: unknown | null; error: { message: string } | null }>;
}

interface EnquirySupabaseClient {
  from(table: string): EnquiryQueryBuilder;
}

// In-memory rate limiting map for production environments
const ipRateLimitMap = new Map<string, number>();

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const lastTime = ipRateLimitMap.get(identifier);
  if (lastTime && now - lastTime < 5000) {
    return true;
  }
  ipRateLimitMap.set(identifier, now);
  return false;
}

export async function submitContactEnquiryAction(formData: {
  name: string;
  phone: string;
  email?: string;
  location_id?: string;
  project_id?: string;
  property_configuration_id?: string;
  message?: string;
  consent: boolean;
  website_url?: string;
  source_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}) {
  try {
    // 1. Silent Honeypot Check
    if (formData.website_url && formData.website_url.trim().length > 0) {
      return { success: true };
    }

    // 2. Rate Limiting Check
    const rateKey = `${formData.phone.replace(/[^0-9]/g, '')}_contact`;
    if (isRateLimited(rateKey)) {
      return { success: false, error: 'Please wait a few seconds before submitting again.' };
    }

    // 3. Zod Validation
    const validated = contactMessageSchema.parse(formData);

    // 4. Data Normalization
    const normalizedPhone = validated.phone.replace(/[^0-9+]/g, '');
    const normalizedEmail = validated.email ? validated.email.trim().toLowerCase() : null;

    const supabase = createPublicClient() as unknown as EnquirySupabaseClient;

    // 5. Server-side Entity Verification
    let validLocationId: string | null = null;
    let validProjectId: string | null = null;
    let validConfigId: string | null = null;

    if (validated.location_id) {
      const res = await supabase.from('locations').select('id').eq('id', validated.location_id).eq('published', true).maybeSingle();
      const loc = res.data as { id: string } | null;
      if (loc) validLocationId = loc.id;
    }

    if (validated.project_id) {
      const res = await supabase.from('projects').select('id').eq('id', validated.project_id).eq('published', true).maybeSingle();
      const proj = res.data as { id: string } | null;
      if (proj) validProjectId = proj.id;
    }

    if (validated.property_configuration_id) {
      const res = await supabase.from('property_configurations').select('id').eq('id', validated.property_configuration_id).eq('published', true).maybeSingle();
      const config = res.data as { id: string } | null;
      if (config) validConfigId = config.id;
    }

    // 6. Secure Supabase Insertion
    const insertPayload = {
      message_type: 'contact' as const,
      name: validated.name.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      location_id: validLocationId,
      project_id: validProjectId,
      property_configuration_id: validConfigId,
      message: validated.message ? validated.message.trim() : null,
      source_page: validated.source_page || '/contact-us',
      utm_source: validated.utm_source || null,
      utm_medium: validated.utm_medium || null,
      utm_campaign: validated.utm_campaign || null,
      status: 'new' as const,
      assigned_admin_id: null,
      admin_notes: null,
      read_at: null,
    };

    const { error } = await supabase.from('messages').insert(insertPayload);

    if (error) {
      console.error('Database error storing contact enquiry:', error.message);
      return { success: false, error: 'Unable to record your message. Please call us directly.' };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error('Validation error processing contact enquiry:', err);
    return { success: false, error: 'Please check your name, phone number, and consent check.' };
  }
}

export async function submitSiteVisitBookingAction(formData: {
  name: string;
  phone: string;
  email?: string;
  location_id?: string;
  project_id?: string;
  property_configuration_id?: string;
  preferred_visit_date: string;
  preferred_visit_time: string;
  message?: string;
  consent: boolean;
  website_url?: string;
  source_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}) {
  try {
    // 1. Silent Honeypot Check
    if (formData.website_url && formData.website_url.trim().length > 0) {
      return { success: true };
    }

    // 2. Rate Limiting Check
    const rateKey = `${formData.phone.replace(/[^0-9]/g, '')}_visit`;
    if (isRateLimited(rateKey)) {
      return { success: false, error: 'Please wait a few seconds before submitting again.' };
    }

    // 3. Zod Validation
    const validated = siteVisitSchema.parse(formData);

    // 4. Data Normalization
    const normalizedPhone = validated.phone.replace(/[^0-9+]/g, '');
    const normalizedEmail = validated.email ? validated.email.trim().toLowerCase() : null;

    const supabase = createPublicClient() as unknown as EnquirySupabaseClient;

    // 5. Server-side Entity Verification
    let validLocationId: string | null = null;
    let validProjectId: string | null = null;
    let validConfigId: string | null = null;

    if (validated.location_id) {
      const res = await supabase.from('locations').select('id').eq('id', validated.location_id).eq('published', true).maybeSingle();
      const loc = res.data as { id: string } | null;
      if (loc) validLocationId = loc.id;
    }

    if (validated.project_id) {
      const res = await supabase.from('projects').select('id').eq('id', validated.project_id).eq('published', true).maybeSingle();
      const proj = res.data as { id: string } | null;
      if (proj) validProjectId = proj.id;
    }

    if (validated.property_configuration_id) {
      const res = await supabase.from('property_configurations').select('id').eq('id', validated.property_configuration_id).eq('published', true).maybeSingle();
      const config = res.data as { id: string } | null;
      if (config) validConfigId = config.id;
    }

    // 6. Secure Supabase Insertion
    const insertPayload = {
      message_type: 'site_visit' as const,
      name: validated.name.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      location_id: validLocationId,
      project_id: validProjectId,
      property_configuration_id: validConfigId,
      preferred_visit_date: validated.preferred_visit_date || null,
      preferred_visit_time: validated.preferred_visit_time || null,
      message: validated.message ? validated.message.trim() : null,
      source_page: validated.source_page || '/contact-us',
      utm_source: validated.utm_source || null,
      utm_medium: validated.utm_medium || null,
      utm_campaign: validated.utm_campaign || null,
      status: 'new' as const,
      assigned_admin_id: null,
      admin_notes: null,
      read_at: null,
    };

    const { error } = await supabase.from('messages').insert(insertPayload);

    if (error) {
      console.error('Database error storing site visit booking:', error.message);
      return { success: false, error: 'Unable to schedule site visit appointment. Please call us.' };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error('Validation error processing site visit booking:', err);
    return { success: false, error: 'Please check your name, phone number, and visit date.' };
  }
}
