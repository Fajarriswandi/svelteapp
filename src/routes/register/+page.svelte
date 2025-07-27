<script lang="ts">
	import type { ActionData } from '../login/$types';
	export let form: ActionData;
</script>

<div class="flex flex-col items-center pt-16">
	<h1 class="mb-4 text-3xl font-bold">Create an Account</h1>
	<div class="card w-full max-w-md rounded-lg bg-white p-8 shadow-md">
		<form method="POST" action="?/register" class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					required
				/>
			</div>
			<div>
				<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					required
				/>
			</div>
			{#if form?.error}
				<p class="text-sm text-red-500">{form.error}</p>
			{/if}
			<div>
				<button
					type="submit"
					class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Register
				</button>
			</div>
		</form>
		<p class="mt-4 text-center text-sm">
			Already have an account? <a
				href="/login"
				class="font-medium text-blue-600 hover:text-blue-500">Login</a
			>
		</p>
	</div>
</div>
