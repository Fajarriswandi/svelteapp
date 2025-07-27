import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: posts, error } = await supabase.from('posts').select('*');

	if (error) {
		console.error('Error fetching posts:', error);
		return { posts: [] };
	}

	return { posts };
};