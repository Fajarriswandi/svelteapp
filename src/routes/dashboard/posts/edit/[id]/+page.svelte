<script lang="ts">
    import PostForm from '$lib/components/PostForm.svelte';
    import type { PageData, ActionData } from './$types';
    export let data: PageData;
    export let form: ActionData;
  </script>
  
  <h1 class="text-3xl font-bold mb-6">Edit Postingan</h1>
  
  <PostForm post={data.post} {form} />