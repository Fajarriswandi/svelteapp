<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { invalidateAll } from '$app/navigation';

	async function handleLogout() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			alert(error.message);
		} else {
			// Refresh all data on the page
			await invalidateAll();
		}
	}
</script>

<slot />
