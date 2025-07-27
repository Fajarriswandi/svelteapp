// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase, getSession } }) => {
    const session = await getSession();

    if (!session) {
        throw redirect(303, '/login');
    }

    // --- Parameter Pencarian dan Paginasi dari URL ---
    const searchQuery = url.searchParams.get('q');
    const page = parseInt(url.searchParams.get('page') || '1'); // Default ke halaman 1
    const limit = parseInt(url.searchParams.get('limit') || '10'); // Default ke 10 item per halaman

    // Hitung offset
    const offset = (page - 1) * limit;

    // --- Ambil data Postingan Blog (tetap dipertahankan) ---
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
        .select('*', { count: 'exact' }) // Tambahkan { count: 'exact' } untuk mendapatkan total baris
        .order('evaluation_date', { ascending: false });

    // Terapkan filter pencarian jika ada searchQuery
    if (searchQuery) {
        evaluationsQuery = evaluationsQuery.ilike('caller_name', `%${searchQuery}%`);
    }

    // Terapkan limit dan offset untuk paginasi
    // Jika limit adalah 'all' (atau angka yang sangat besar), Supabase akan mengembalikan semua.
    // Kita gunakan .range(from, to) yang inklusif di kedua ujungnya
    // Contoh: range(0, 9) untuk 10 item pertama
    // Untuk 'all', kita tidak menerapkan limit/offset
    if (limit !== 0) { // Jika limit 0, anggap sebagai 'all'
        evaluationsQuery = evaluationsQuery.range(offset, offset + limit - 1);
    }

    const { data: evaluations, error: evaluationsError, count: totalCount } = await evaluationsQuery;

    if (evaluationsError) {
        console.error('Error fetching evaluations:', evaluationsError.message);
    }

    // --- CONSOLE.LOG UNTUK DEBUGGING (Opsional, bisa dihapus setelah yakin) ---
    console.log(`Pencarian: "${searchQuery || ''}", Halaman: ${page}, Limit: ${limit}, Offset: ${offset}, Total: ${totalCount}`);
    // -------------------------------------------------------------------------

    return {
        session,
        posts: posts ?? [],
        evaluations: evaluations ?? [],
        searchQuery: searchQuery ?? '',
        currentPage: page, // Kirim kembali halaman saat ini
        itemsPerPage: limit, // Kirim kembali item per halaman
        totalItems: totalCount ?? 0 // Kirim kembali total item yang cocok
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