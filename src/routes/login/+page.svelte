<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<div class="pt-16 flex flex-col items-center">
	<h1 class="text-3xl font-bold mb-4">Silahkan Masuk</h1>
	<div class="card bg-white p-8 rounded-lg shadow-md max-w-md w-full">
		<form method="POST" action="?/login" class="space-y-4">
			<div>
				<label for="email" class="text-sm font-medium text-gray-700 block">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					class="mt-1 px-3 py-2 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 block w-full border focus:outline-none"
					required
				/>
			</div>
			<div>
				<label for="password" class="text-sm font-medium text-gray-700 block">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					class="mt-1 px-3 py-2 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 block w-full border focus:outline-none"
					required
				/>
			</div>
			{#if form?.error}
				<p class="text-red-500 text-sm">{form.error}</p>
			{/if}
			<div>
				<button
					type="submit"
					class="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 flex w-full justify-center border border-transparent focus:ring-2 focus:ring-offset-2 focus:outline-none"
				>
					Login
				</button>
			</div>
		</form>
		<p class="mt-4 text-sm text-center">
			Don't have an account? <a
				href="/register"
				class="font-medium text-blue-600 hover:text-blue-500">Register</a
			>
		</p>
	</div>
</div>
