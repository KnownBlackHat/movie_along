<script lang="ts">
	import { page } from '$app/stores';

	type Message =
		| {
				action: 'send-offer';
				roomName: string;
		  }
		| {
				action: 'offer';
				sdp: unknown;
				roomName: string;
		  }
		| {
				action: 'answer';
				sdp: unknown;
				roomName: string;
		  }
		| {
				action: 'add-ice-candidates';
				candidate: RTCIceCandidate;
				type: 'sender' | 'receiver';
		  }
		| {
				action: 'msg';
				userName: string;
				msg: string;
		  };

	interface MSG {
		author: string;
		msg: string;
	}

	let msg: string = $state('');
	let messages: MSG[] = $state([]);

	let localaudioTracks: MediaStreamTrack;
	let remoteaudioTracks: MediaStreamTrack;

	let sendingpc = $state<RTCPeerConnection | null>(null);
	let recivingpc = $state<RTCPeerConnection | null>(null);

	let mic: boolean = true;

	let audioElement: HTMLAudioElement;

	const getMic = async () => {
		const stream = await window.navigator.mediaDevices.getUserMedia({
			video: false,
			audio: true
		});
		localaudioTracks = stream.getAudioTracks()[0];
	};

	getMic();

	const userName = $page.url.searchParams.get('user') ?? 'create';

	const ws = new WebSocket(`ws://0.0.0.0:8000?room=${$page.params.room}&user=${userName}`);
	let wsstate = $state(ws?.readyState);

	const webRtcHandler = async (msg: Message) => {
		if (msg.action === 'send-offer') {
			console.log('send offer');
			const pc = new RTCPeerConnection();
			console.log('added ', localaudioTracks);
			pc.addTrack(localaudioTracks);
			sendingpc = pc;

			pc.onicecandidate = async (e) => {
				console.log('recv ice candidates locally');
				if (e.candidate) {
					const payload: Message = {
						action: 'add-ice-candidates',
						candidate: e.candidate,
						type: 'sender'
					};
					ws.send(JSON.stringify(payload));
				}
			};

			pc.onnegotiationneeded = async () => {
				console.log('on negotiation neeeded, sending offer');
				const sdp = await pc.createOffer();
				pc.setLocalDescription(sdp);
				const payload: Message = {
					action: 'offer',
					sdp,
					roomName: msg.roomName
				};
				ws.send(JSON.stringify(payload));
			};
		} else if (msg.action === 'offer') {
			console.log('offer');
			const pc = new RTCPeerConnection();
			// @ts-expect-error false positive
			pc.setRemoteDescription(msg.sdp);
			const sdp = await pc.createAnswer();
			pc.setLocalDescription(sdp);
			audioElement.srcObject = new MediaStream();

			/*
			pc.ontrack = (event) => {
				console.log('track req');
				event.streams[0].getTracks().forEach((track) => {
					remoteaudioTracks = track;
				});
			};
            */

			pc.onicecandidate = async (e) => {
				console.log('recv ice candidates remotely');
				if (e.candidate) {
					const payload: Message = {
						action: 'add-ice-candidates',
						candidate: e.candidate,
						type: 'receiver'
					};
					ws.send(JSON.stringify(payload));
				}
			};

			recivingpc = pc;

			const payload: Message = {
				action: 'answer',
				sdp,
				roomName: msg.roomName
			};
			ws.send(JSON.stringify(payload));

			setTimeout(() => {
				const track = pc.getTransceivers()[0].receiver.track;
				// @ts-expect-error sure
				audioElement.srcObject?.addTrack(track);
				audioElement.play();
			}, 2000);
		} else if (msg.action === 'answer') {
			console.log('answer');
			// @ts-expect-error false positive
			sendingpc?.setRemoteDescription(msg.sdp);

			// console.log('remoteaudioTracks: ', remoteaudioTracks);
			// audioElement.srcObject = new MediaStream([remoteaudioTracks]);
		} else if (msg.action === 'add-ice-candidates') {
			console.log('adding candidates on remote type ', msg.type);
			if (msg.type === 'sender') {
				if (!recivingpc) {
					console.error('Recv pc not found');
				} else {
					//console.error(recivingpc.ontrack);
				}

				recivingpc?.addIceCandidate(msg.candidate);
			} else {
				if (!sendingpc) {
					console.error('sending pc not found');
				} else {
					//console.error(sendingpc.ontrack);
				}

				sendingpc?.addIceCandidate(msg.candidate);
			}
		}
	};
	ws.addEventListener('open', () => {
		wsstate = WebSocket.OPEN;
	});

	ws.addEventListener('message', async (e) => {
		let msg: Message = JSON.parse(e.data);

		if (msg.action === 'msg') {
			messages.push({ author: msg.userName, msg: msg.msg });
		}
		setTimeout(() => webRtcHandler(msg), 1000);
	});
	ws.addEventListener('close', () => {
		wsstate = WebSocket.CLOSED;
	});

	const handleMsgSender = () => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			const payload: Message = {
				action: 'msg',
				userName,
				msg
			};
			ws.send(JSON.stringify(payload));
			messages.push({ author: 'Me', msg });
			msg = '';
		}
	};
</script>

<div
	class={`${wsstate === WebSocket.OPEN ? 'bg-green-600' : 'bg-red-600'} rounded-lg p-4 text-center text-6xl text-white`}
>
	Room Name: {$page.params.room}
</div>

<div
	class="mt-10 flex flex-col items-center justify-center space-y-20 p-4 md:flex-row md:space-x-8"
>
	<div class="flex h-64 w-full items-center justify-center border-2 border-white">
		<video autoplay controls class="size-full" bind:this={audioElement}>
			<track kind="captions" />
		</video>
	</div>

	<div class="w-full border-2 border-white">
		<div class="size-64 w-full overflow-y-scroll">
			{#each messages as { author, msg }}
				<div class="bg-gray-900 p-2 text-center">
					<span class="capitalize">{author}</span>: {msg}
				</div>
			{/each}
		</div>

		<div class="m-2 flex items-center justify-between space-x-4">
			<input
				type="text"
				bind:value={msg}
				class="w-full rounded-xl border-2 border-white p-2 text-white"
				onkeyupcapture={(e) => {
					if (e.key === 'Enter') handleMsgSender();
				}}
			/>
			<button
				class={`rounded-lg border-1 border-white ${mic ? 'bg-green-600' : 'bg-red-600'} p-2 text-white`}
			>
				Mic
			</button>
			<button
				class="rounded-lg border-2 border-white bg-green-600 p-2 text-white"
				onclick={handleMsgSender}
			>
				Send
			</button>
		</div>
		<audio autoplay class="size-24 bg-blue-900"> </audio>
	</div>
</div>
