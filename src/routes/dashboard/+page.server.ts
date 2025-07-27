import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();

	if (session) {
		const { data: posts } = await supabase
			.from('posts')
			.select('*')
			.eq('user_id', session.user.id)
			.order('created_at', { ascending: false });

		return { posts: posts ?? [] };
	}

	return { posts: [] };
};

export const actions: Actions = {
	deletePost: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const postId = formData.get('id') as string;

		const { error } = await supabase
			.from('posts')
			.delete()
			.eq('id', postId) // Hapus post dengan id yang cocok
			.eq('user_id', session.user.id); // dan pastikan milik user ini

		if (error) {
			return fail(500, { error: 'Failed to delete post.' });
		}

		return { success: true };
	}
};