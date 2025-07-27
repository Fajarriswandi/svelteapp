<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import { supabase } from '$lib/supabaseClient';
	import '../app.css';
  
	export let data: PageData;
  
	let { session } = data;
  
	$: session = data.session;
  
	onMount(() => {
	  const {
		data: { subscription }
	  } = supabase.auth.onAuthStateChange((event, _session) => {
		if (_session?.expires_at !== session?.expires_at) {
		  // invalidateAll() akan memuat ulang semua data dari server,
		  // menyinkronkan sesi di seluruh aplikasi.
		  invalidateAll();
		}
	  });
  
	  return () => subscription.unsubscribe();
	});
  </script>
  
  <div class="min-h-screen bg-gray-50 text-gray-800">
	<Header {session} />
  
	<main class="container mx-auto p-4">
	  <slot />
	</main>
  </div>