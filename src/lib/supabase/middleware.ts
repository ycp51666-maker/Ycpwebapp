import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/types/database';

interface RedirectSettingsClient {
  from(table: 'site_settings'): {
    select(columns: string): {
      eq(column: string, value: unknown): {
        maybeSingle(): Promise<{ data: { value: unknown } | null; error: { message: string } | null }>;
      };
    };
  };
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');

  // Check custom URL redirects for public pages before auth routing
  if (
    !isAdminRoute &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api') &&
    !pathname.includes('.')
  ) {
    try {
      const { data: redirectSetting } = await (supabase as unknown as RedirectSettingsClient)
        .from('site_settings')
        .select('*')
        .eq('key', 'url_redirects')
        .maybeSingle();

      if (redirectSetting && Array.isArray(redirectSetting.value)) {
        const redirects = (redirectSetting.value as unknown) as Array<{
          source: string;
          destination: string;
          permanent?: boolean;
        }>;
        const normalizedPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
        
        const matchingRedirect = redirects.find((r) => {
          if (!r.source || !r.destination) return false;
          // Protect homepage and prevent self-redirect loops
          if (r.source === '/' || r.source === '' || r.source === r.destination) return false;
          const rSourceNorm = r.source.endsWith('/') && r.source !== '/' ? r.source.slice(0, -1) : r.source;
          return rSourceNorm.toLowerCase() === normalizedPath.toLowerCase();
        });

        if (matchingRedirect && matchingRedirect.destination) {
          const status = matchingRedirect.permanent !== false ? 301 : 302;
          return NextResponse.redirect(new URL(matchingRedirect.destination, request.url), status);
        }
      }
    } catch (e) {
      console.error('Dynamic redirect error:', e);
    }
  }

  // Skip auth check entirely for public routes — saves 50-150ms per request
  if (!isAdminRoute) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isPublicAuthRoute =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password' ||
    pathname === '/admin/unauthorized';

  if (isAdminRoute && !isPublicAuthRoute) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }

    // Verify active admin profile existence
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('id, is_active')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!profile) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isPublicAuthRoute && user && pathname === '/admin/login') {
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('id, is_active')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (profile) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/admin';
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return supabaseResponse;
}
