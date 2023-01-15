import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Peer } from "peerjs";
import { io } from "socket.io-client";

const Room = () => {
	const socket = io("http://localhost:3030");
	// const peer = new Peer(undefined, {
	// 	path: "/peerjs",
	// 	host: "/",
	// 	port: "3030",
	// });
	const peer = new Peer();

	const myVid = useRef();
	const [roomId, setRoomId] = useState("");
	const [me, setMe] = useState("");
	const [peerId, setPeerId] = useState("");

	async function getRoomId() {
		try {
			const response = await axios.get("http://localhost:3030");
			if (response.status === 200) {
				setRoomId(response.data.roomId.room);
			}
		} catch (error) {
			console.error(error);
		}
	}

	const getMedia = () => {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				// const call = peer.call("another-peers-id", stream);
				// call.on("stream", (remoteStream) => {
				// 	// Show stream in some <video> element.
				// });
				myVid.current.srcObject = stream;
			})
			.catch((err) => {
				console.error("Failed to get local stream", err);
			});
	};

	useEffect(() => {
		getMedia();
		getRoomId();
		peer.on("open", (id) => {
			// console.log(id);
			setPeerId(id);
		});
	}, []);

	useEffect(() => {
		socket.emit("join-room", roomId, peerId);
		socket.on("me", (id) => setMe(id));
		socket.on("user-connected", (userId) => {
			connectToNewUser(userId);
		});

		// return () => socket.disconnect();
	}, [peerId, roomId]);

	const connectToNewUser = (userId) => {
		console.log(userId);
		// console.log(`New user: ${userId}`);
	};

	return (
		<div>
			<h1>Client:room</h1>
			<p>roomid: {roomId}</p>
			<p>socketid: {me}</p>
			<p>peer: {peerId}</p>

			<video playsInline ref={myVid} width="480" height="300" autoPlay muted />
		</div>
	);
};

export default Room;
