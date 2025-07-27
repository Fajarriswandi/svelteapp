export type Post = {
	id: number;
	created_at: string;
	title: string;
	content: string;
	slug: string;
	user_id: string;
	cover_image_url?: string | null;
};
