// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ url, locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();

    // --- Perbaikan: Logika Redirect Halaman Utama ('/') ---
    // Jika pengguna mencoba mengakses '/'
    if (url.pathname === '/') {
        if (user) {
            // Jika user sudah login, arahkan ke dashboard
            throw redirect(303, '/dashboard');
        } else {
            // Jika user belum login, arahkan ke halaman login
            throw redirect(303, '/login');
        }
    }
    // ----------------------------------------------------

    // Definisikan rute yang tidak memerlukan autentikasi (publik, selain '/')
    const unprotectedRoutes = ['/login', '/register']; // '/' sudah ditangani di atas

    // Periksa apakah pengguna tidak login DAN rute saat ini BUKAN rute yang tidak dilindungi
    if (!user && !unprotectedRoutes.includes(url.pathname)) {
        throw redirect(303, '/login');
    }

    let profile = null;
    if (user) { 
        const { data, error } = await supabase
            .from('profiles')
            .select(`id, username, full_name, avatar_url, website`)
            .eq('id', user.id)
            .single();

        if (error) {
            console.error("Error fetching user profile:", error.message);
        } else {
            profile = data;
        }
    }

    return {
        session,
        profile
    };
};