// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase, getSession } }) => {
    const session = await getSession();

    if (!session) {
        // Redirect ke halaman login jika tidak ada sesi
        throw redirect(303, '/login');
    }

    // Ambil query pencarian dari URL (misal: /dashboard?q=keyword)
    const searchQuery = url.searchParams.get('q');

    // --- Ambil data Postingan Blog (tetap dipertahankan) ---
    // (Ini untuk halaman /dashboard/posts, bukan untuk tabel evaluasi)
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
            id,
            title,
            slug,
            created_at,
            cover_image_url,
            content,
            profiles (
                username
            )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

    if (postsError) {
        console.error('Error fetching posts:', postsError.message);
    }

    // --- Ambil data Evaluasi AI dari tabel 'evaluations' ---
    let evaluationsQuery = supabase
        .from('evaluations')
        .select('*') // Ambil semua kolom dari tabel evaluations
        .order('evaluation_date', { ascending: false }); // Urutkan berdasarkan tanggal terbaru

    // Terapkan filter pencarian jika ada searchQuery
    if (searchQuery) {
        // Menerapkan filter ilike pada kolom caller_name
        // Anda bisa menambahkan kolom lain untuk dicari menggunakan .or() jika diperlukan
        evaluationsQuery = evaluationsQuery.ilike('caller_name', `%${searchQuery}%`);
    }

    const { data: evaluations, error: evaluationsError } = await evaluationsQuery;

    if (evaluationsError) {
        console.error('Error fetching evaluations:', evaluationsError.message);
    }

    // --- SANGAT PENTING: CONSOLE.LOG UNTUK DEBUGGING PENCARIAN ---
    // Output ini akan muncul di terminal tempat `npm run dev` berjalan
    console.log(`Pencarian untuk: "${searchQuery}"`);
    console.log("Data Evaluations setelah filter:", evaluations);
    // -----------------------------------------------------------

    return {
        session,
        posts: posts ?? [], // Pastikan selalu mengembalikan array kosong jika tidak ada data
        evaluations: evaluations ?? [], // Kembalikan data evaluasi yang sudah difilter
        searchQuery: searchQuery ?? '' // Kirim kembali searchQuery ke UI untuk mengisi input
    };
};

// Actions untuk menghapus postingan (tetap dipertahankan)
export const actions: Actions = {
    deletePost: async ({ request, locals: { supabase, getSession } }) => {
        const session = await getSession();
        if (!session) {
            throw redirect(303, '/login');
        }

        const formData = await request.formData();
        const postId = formData.get('id');

        if (!postId) {
            return { status: 400, body: { error: 'ID Postingan tidak ditemukan.' } };
        }

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', session.user.id);

        if (error) {
            console.error('Error deleting post:', error.message);
            return { success: false, error: 'Gagal menghapus postingan.' };
        }

        return { success: true };
    }
};