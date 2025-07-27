<script lang="ts">
  import type { PageData } from './$types';
  export let data;
</script>

<div class="pt-8">
  <a href="/" class="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to all posts</a>

  <article class="prose lg:prose-xl max-w-none">
    <h1>{data.post.title}</h1>

    <div class="text-sm text-gray-500 flex items-center gap-4">
      <span>
        Posted on: {new Date(data.post.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </span>
      {#if data.post.profiles?.username}
        <span>&bull;</span>
        <span>By: {data.post.profiles.username}</span>
      {/if}
    </div>
    <div class="mt-4">
      {@html data.post.content}
    </div>
  </article>
</div>