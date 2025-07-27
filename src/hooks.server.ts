// src/hooks.server.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get(key: string) { return event.cookies.get(key); },
            set(key: string, value: string, options: CookieOptions) { event.cookies.set(key, value, { ...options, path: '/' }); },
            remove(key: string, options: CookieOptions) { event.cookies.delete(key, { ...options, path: '/' }); }
        }
    });

    // --- HAPUS SELURUH BLOK INI ---
    // event.locals.getSession = async () => {
    //     const { data: { session } } = await event.locals.supabase.auth.getSession();
    //     return session;
    // };
    // --------------------------------

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version';
        }
    });
};