import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Peer } from "peerjs";

const Room = () => {
	const peer = new Peer("pick-an-id");
	const myVid = useRef();
	const [roomId, setRoomId] = useState("");

	async function getRoomId() {
		try {
			const response = await axios.get("http://localhost:3030");
			if (response.status === 200) {
				setRoomId(JSON.stringify(response.data));
			}
		} catch (error) {
			console.error(error);
		}
	}

	const getMedia = () => {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				const call = peer.call("another-peers-id", stream);
				call.on("stream", (remoteStream) => {
					// Show stream in some <video> element.
				});
				myVid.current.srcObject = stream;
			})
			.catch((err) => {
				console.error("Failed to get local stream", err);
			});
	};

	useEffect(() => {
		getMedia();
		getRoomId();
	}, []);

	return (
		<div>
			<h1>Client:room</h1>
			<p>{roomId}</p>

			<video playsInline ref={myVid} width="480" height="300" autoPlay muted />
		</div>
	);
};

export default Room;
