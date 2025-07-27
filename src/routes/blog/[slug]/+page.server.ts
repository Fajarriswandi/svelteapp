import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const { data: post, error: dbError } = await supabase
		.from('posts')
		.select('*, profiles(username)') // <--- UBAH BARIS INI
		.eq('slug', params.slug)
		.single();

	if (dbError) {
		console.error('Error fetching post:', dbError);
		throw error(404, 'Post not found');
	}

	return { post };
};