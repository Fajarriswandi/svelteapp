// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

// load function ini akan dijalankan di server untuk setiap request ke layout ini
// dan datanya akan tersedia di +layout.svelte
export const load: LayoutServerLoad = async ({ locals: { supabase, getSession } }) => {
    const session = await getSession();
    let profile = null;

    if (session) {
        // Jika ada sesi, coba ambil data profil dari tabel 'profiles'
        const { data, error } = await supabase
            .from('profiles')
            .select(`id, username, full_name, avatar_url, website`) // Pilih kolom yang dibutuhkan
            .eq('id', session.user.id) // Filter berdasarkan user ID yang login
            .single(); // Ambil hanya satu baris

        if (error) {
            console.error("Error fetching user profile:", error.message);
            // Pertimbangkan untuk menangani error ini, misalnya tampilkan pesan ke user
        } else {
            profile = data;
        }
    }

    return {
        session, // Sesi pengguna
        profile // Data profil pengguna
    };
};