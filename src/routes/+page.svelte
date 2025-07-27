<script lang="ts">
    import type { PageData } from './$types';
    export let data;
  </script>
  
  <div class="space-y-8 pt-8">
    <h1 class="text-4xl font-extrabold text-center text-gray-800">Welcome to SupaBlog</h1>
  
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#if data.posts && data.posts.length > 0}
        {#each data.posts as post}
          <a href="/blog/{post.slug}" class="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">{post.title}</h5>
            <p class="font-normal text-gray-700 line-clamp-3">{post.content}</p>
          </a>
        {/each}
      {:else}
        <p class="text-center md:col-span-2 lg:col-span-3 text-gray-500">
          No posts yet. Be the first to write!
        </p>
      {/if}
    </div>
  </div>