<script lang="ts">
	import { onMount } from 'svelte';

	//	import { browser } from '$app/environment';
	//	import { onMount } from 'svelte';

	let roomName = '';
	let userName = '';

	/*
	const getMic = async () => {
		const stream = await window.navigator.mediaDevices.getUserMedia({
			video: false,
			audio: true
		});
		const audioTracks = stream.getAudioTracks()[0];
		return audioTracks;
	};

	onMount(() => {
		getMic();
	});
    */

	/*
	let ws: WebSocket | null;
	if (browser) {
		ws = new WebSocket('ws://localhost:8000');
	}

	onMount(() => {
		let ws = new WebSocket('ws://localhost:8000');

		ws.addEventListener('open', () => {
			console.log('WebSocket connection established');
		});

		ws.addEventListener('message', (e: MessageEvent<string>) => {
			count = parseInt(e.data);
		});

		ws.addEventListener('close', () => {
			console.log('WebSocket connection closed.');
		});
		return () => ws.close();
	});

	const getWsState = () => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			let msg = { action: 'info' };
			ws.send(JSON.stringify(msg));
		} else {
			alert('Unable to connect to ws server');
		}
	};
    */
</script>

<svelte:head>
	<title>Watch With Me</title>
	<meta name="description" content="Watch With Me" />
</svelte:head>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<div class="rounded-lg border-2 border-white bg-white/40 p-8">
		<div class="text-center text-4xl">Watch With Me</div>
		<div class="flex flex-col items-center justify-center">
			<input
				type="text"
				placeholder="User Name"
				class="mt-8 rounded-md bg-white p-2 text-center text-black"
				bind:value={userName}
				required
			/>
			<input
				type="text"
				placeholder="Room Name"
				class="mt-8 rounded-md bg-white p-2 text-center text-black"
				bind:value={roomName}
				required
			/>
			<div class="mt-8 flex justify-between space-x-8">
				<a href={`/${roomName}?action=create&user=${userName}`} class="rounded-md bg-green-600 p-2"
					>Create Room</a
				>
				<a
					href={`/${roomName}?action=join&user=${userName}`}
					class="rounded-md border-1 border-black bg-blue-600 p-2">Join Room</a
				>
			</div>
		</div>
	</div>
</div>
