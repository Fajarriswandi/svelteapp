<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import '../app.scss';

	import type { LayoutData } from './$types'; // Gunakan LayoutData, bukan PageData untuk layout
	import Header from '$lib/components/Header.svelte';
	import { supabase } from '$lib/supabaseClient';

	export let data: LayoutData;

	let { session, profile } = data;
	$: session = data.session;

	$: profile = data.profile;

	onMount(() => {
		import('bootstrap/dist/js/bootstrap.bundle.min.js');

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidateAll();
			}

			session = _session;
		});

		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<link
		href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
		rel="stylesheet"
	/>
</svelte:head>

<div class="d-flex flex-column min-vh-100 text-dark">
	<Header {session} {profile} />

	<main class="flex-grow-1 container py-4">
		<slot />
	</main>
</div>
