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
	const [msg, setMsg] = useState("");
	const [chat, setChat] = useState([]);

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
				myVid.current.srcObject = stream;
			})
			.catch((err) => {
				console.error("Failed to get local stream", err);
			});
	};

	async function joinRoom(url) {
		try {
			const response = await axios.get(`http://localhost:3030/${url}`);
		} catch (error) {
			console.error(error);
		}
	}
	let conn = undefined;
	const connectToNewUser = (userId) => {
		console.log(`New user: ${userId}`);
		conn = peer.connect(userId);
		// on open will be launch when you successfully connect to PeerServer
		conn.on("open", function () {
			// here you have conn.id
			conn.send("hi!");
		});
	};

	// const addVideoStream = (video, stream) => {
	// 	video.srcObject = stream;
	// 	video.addEventListner("loadedmetadata", () => {
	// 		video.play();
	// 	});
	// };

	useEffect(() => {
		getMedia();
		if (roomUrl === undefined) {
			getRoomId();
		} else {
			joinRoom();
		}
		peer.on("open", (id) => {
			setPeerId(id);
		});
	}, []);

	useEffect(() => {
		socket.on("me", (id) => setMe(id));
		peer.on("open", (id) => {
			socket.emit("join-room", roomId, id);
		});
	}, [roomId]);

	useEffect(() => {
		socket.on("user-connected", (userId, arg) => {
			connectToNewUser(userId, arg);
		});
		socket.on("createMessage", (msg, peer) => {
			setChat((current) => [...current, { text: msg, user: "other", peer }]);
			setMsg(msg);
		});
	});

	useEffect(() => {
		peer.on("connection", function (conn) {
			conn.on("data", function (data) {
				// Will print 'hi!'
				console.log(data);
			});
		});
	});
	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			console.log("entered", event.target.value);
			socket.emit("message", event.target.value, peerId);
			// setChat((current) => [...current, { text: msg, user: "other" }]);
		}
	};
	return (
		<div>
			<h1>Client:room</h1>
			<p>
				roomid: <br />
				{roomId}
			</p>
			<a href={`http://localhost:3000/${roomId}`} target="_blank">
				Join link
			</a>
			<p>socketid: {me}</p>
			<p>peer: {peerId}</p>
			<ul>
				{chat.map((item, index) => (
					<li key={index}>
						{item.peer === peerId ? "(me): " : "(other): "} {item.text} {"<= "}
						{item.peer}
					</li>
				))}
			</ul>

			<input
				id="chat_message"
				type="text"
				placeholder="Type message here..."
				onKeyDown={handleKeyDown}
			/>

			<video playsInline ref={myVid} width="480" height="300" autoPlay muted />
		</div>
	);
};

export default Room;
