<script lang="ts">
	import type { Session } from '@supabase/supabase-js';

	export let session: Session | null;
</script>

<header class="border-b p-4">
	<div class="container mx-auto flex items-center justify-between">
		<a href="/" class="text-2xl font-bold text-gray-800 hover:text-blue-600">
			Supa<span class="text-blue-500">Blog</span>
		</a>
		<nav class="flex items-center space-x-4">
			{#if session}
				<a href="/dashboard" class="hover:text-blue-500">Dashboard</a>
				<a href="/dashboard/profile" class="hover:text-blue-500">Edit Profile</a>
				<form action="/logout" method="POST">
					<button type="submit" class="hover:text-blue-500">Logout</button>
				</form>
			{:else}
				<a href="/login" class="hover:text-blue-500">Login</a>
				<a href="/register" class="hover:text-blue-500">Register</a>
			{/if}
		</nav>
	</div>
</header>
