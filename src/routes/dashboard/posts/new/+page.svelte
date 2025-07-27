<script lang="ts">
	import PostForm from '$lib/components/PostForm.svelte';
	import type { ActionData } from './$types';
	export let form: ActionData;
  </script>
  
  <h1 class="text-3xl font-bold mb-6">Tulis Postingan Baru</h1>
  
  <PostForm {form} />