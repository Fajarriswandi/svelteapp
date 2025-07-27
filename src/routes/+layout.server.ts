// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ url, locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();

    // --- Perbaikan untuk ERR_TOO_MANY_REDIRECTS ---
    // Definisikan rute yang tidak memerlukan autentikasi (publik)
    const unprotectedRoutes = ['/login', '/register', '/']; // Tambahkan '/' jika halaman landing utama juga publik

    // Periksa apakah pengguna tidak login DAN rute saat ini BUKAN rute yang tidak dilindungi
    if (!user && !unprotectedRoutes.includes(url.pathname)) {
        // Jika user tidak login dan mencoba akses rute yang dilindungi, redirect ke /login
        throw redirect(303, '/login');
    }
    // Jika user tidak login TAPI berada di rute tidak dilindungi (misal /login), biarkan akses.
    // Data session dan profile akan null, dan UI Header akan menampilkannya.
    // Redirect setelah login berhasil akan ditangani oleh actions login.
    // -----------------------------------------------

    let profile = null;
    // Hanya ambil profil jika user terverifikasi ada
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
        session, // Objek session lengkap (akan null jika user tidak login)
        profile // Data profil pengguna (akan null jika user tidak login atau profil tidak ditemukan)
    };
};