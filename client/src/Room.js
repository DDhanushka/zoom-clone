import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Peer } from "peerjs";
import { io } from "socket.io-client";
import { Routes, Route, useParams } from "react-router-dom";

const Room = () => {
	const socket = io("http://localhost:3030");
	const peer = new Peer();
	let { roomUrl } = useParams();

	const myVid = useRef();
	const [roomId, setRoomId] = useState("");
	const [me, setMe] = useState("");
	const [peerId, setPeerId] = useState("");

	async function getRoomId() {
		try {
			const response = await axios.get("http://localhost:3030/");
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

	async function joinRoom(url) {
		try {
			const response = await axios.get(`http://localhost:3030/${url}`);
			// if (response.status === 200) {
			// 	setRoomId(response.data.roomId.room);
			// }
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		getMedia();
		if (roomUrl === undefined) {
			getRoomId();
		} else {
			joinRoom();
		}
		peer.on("open", (id) => {
			// console.log(id);
			setPeerId(id);
		});
	}, []);

	useEffect(() => {
		socket.emit("join-room", roomId, peerId);
		socket.on("me", (id) => setMe(id));
		// socket.on("user-connected", (userId) => {
		// 	connectToNewUser(userId);
		// });

		// return () => socket.disconnect();
	}, [peerId, roomId]);

	useEffect(() => {
		socket.on("user-connected", (userId, arg) => {
			connectToNewUser(userId, arg);
		});
	});

	const connectToNewUser = (userId) => {
		console.log("new user", userId);
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
