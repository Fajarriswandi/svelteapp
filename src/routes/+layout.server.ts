// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit'; // Tambahkan impor redirect jika belum ada

export const load: LayoutServerLoad = async ({ locals: { supabase } }) => { // Hapus getSession dari destructuring locals
    // --- Pola baru: Dapatkan user dan session langsung dari supabase.auth ---
    const { data: { user } } = await supabase.auth.getUser(); // Dapatkan user yang terverifikasi
    const { data: { session } } = await supabase.auth.getSession(); // Dapatkan session lengkap

    // Redirect jika tidak ada user TERVERIFIKASI, meskipun ada session
    // (ini menangani kasus di mana session ada tapi tokennya tidak valid/expired)
    if (!user) { 
        throw redirect(303, '/login');
    }

    let profile = null;
    if (user) { // Pastikan user ada sebelum mengambil profilnya
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
        session, // Objek session lengkap
        profile // Data profil pengguna
    };
};