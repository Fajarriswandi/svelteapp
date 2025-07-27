// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser();

    let session = null;
    if (user) {
        const { data: { session: fullSession } } = await supabase.auth.getSession();
        session = fullSession;
    }

    if (!user) {
        throw redirect(303, '/login');
    }

    const searchQuery = url.searchParams.get('q');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const startDateParam = url.searchParams.get('start_date');
    const endDateParam = url.searchParams.get('end_date');

    console.log("DEBUG Server: Received start_date:", startDateParam);
    console.log("DEBUG Server: Received end_date:", endDateParam);

    const offset = (page - 1) * limit;

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (postsError) {
        console.error('Error fetching posts:', postsError.message);
    }

    // --- PERBAIKAN DI SINI: Hapus Komentar dari Parameter Select ---
    let evaluationsQuery = supabase
        .from('evaluations')
        .select(`
            *,
            evaluation_details (
                *
            )
        `, { count: 'exact' })
        .order('evaluation_date', { ascending: false });
    // ---------------------------------------------------------------

    if (searchQuery) {
        evaluationsQuery = evaluationsQuery.ilike('caller_name', `%${searchQuery}%`);
    }

    if (startDateParam) {
        evaluationsQuery = evaluationsQuery.gte('evaluation_date', startDateParam);
    }
    if (endDateParam) {
        evaluationsQuery = evaluationsQuery.lte('evaluation_date', endDateParam);
    }

    if (limit !== 0) {
        evaluationsQuery = evaluationsQuery.range(offset, offset + limit - 1);
    }

    const { data: evaluations, error: evaluationsError, count: totalCount } = await evaluationsQuery;

    if (evaluationsError) {
        console.error('Error fetching evaluations:', evaluationsError.message);
    }

    console.log("DEBUG Server: Filtered Evaluations data (with details):", evaluations);
    console.log(`Pencarian: "${searchQuery || ''}", Halaman: ${page}, Limit: ${limit}, Offset: ${offset}, Total: ${totalCount}`);

    return {
        session,
        posts: posts ?? [],
        evaluations: evaluations ?? [],
        searchQuery: searchQuery ?? '',
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalCount ?? 0,
        startDate: startDateParam ?? null,
        endDate: endDateParam ?? null
    };
};

export const actions: Actions = {
    deletePost: async ({ request, locals: { supabase } }) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();

        if (!user) {
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
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting post:', error.message);
            return { success: false, error: 'Gagal menghapus postingan.' };
        }

        return { success: true };
    }
};