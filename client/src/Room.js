import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Peer } from "peerjs";
import { io } from "socket.io-client";
import { Routes, Route, useParams } from "react-router-dom";
import ReactPlayer from "react-player/lazy";

const Room = () => {
	const socket = io("http://localhost:3030");
	const peer = new Peer();
	let { roomUrl } = useParams();

	const myVid = useRef();
	const [roomId, setRoomId] = useState("");
	const [me, setMe] = useState("");
	const [peerId, setPeerId] = useState("");
	const [chat, setChat] = useState([]);
	const [videos, setVideos] = useState([]);
	const [myStream, setMyStream] = useState();

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
				// myVid.current.srcObject = stream;
				setMyStream(stream);
				setVideos((current) => [...current, { user: "me", str: stream }]);
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

	const connectToNewUser = (userId, stream) => {
		console.log(`New user: ${userId}`);
		conn = peer.connect(userId);
		// on open will be launch when you successfully connect to PeerServer
		conn.on("open", function () {
			// here you have conn.id
			conn.send("hi broooo!");
		});
		// let call = peer.call(userId, stream);
		// call.on("stream", function (remoteStream) {
		// 	setVideos((current) => [
		// 		...current,
		// 		{ user: "other", str: remoteStream },
		// 	]);
		// });
		var getUserMedia =
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia;
		getUserMedia(
			{ video: true, audio: true },
			function (stream) {
				var call = peer.call(userId, stream);
				call.on("stream", function (remoteStream) {
					setVideos((current) => [
						...current,
						{ user: userId, str: remoteStream },
					]);
				});
			},
			function (err) {
				console.log("Failed to get local stream", err);
			}
		);
	};

	useEffect(() => {
		getMedia();
		if (roomUrl === undefined) {
			getRoomId();
		} else {
			joinRoom();
		}

		socket.on("user-connected", (userId, arg) => {
			connectToNewUser(userId, arg);
		});
		socket.on("createMessage", (msg, user) => {
			setChat((current) => [...current, { text: msg, user }]);
		});

		peer.on("open", (id) => {
			setPeerId(id);
		});
		peer.on("connection", function (conn) {
			conn.on("data", function (data) {
				// Will print 'hi!'
				console.log(data);
			});
		});

		var getUserMedia =
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia;
		peer.on("call", function (call) {
			getUserMedia(
				{ video: true, audio: true },
				function (stream) {
					call.answer(stream); // Answer the call with an A/V stream.
					call.on("stream", function (remoteStream) {
						// Show stream in some video/canvas element.
						setVideos((current) => [
							...current,
							{ user: "other", str: remoteStream },
						]);
					});
				},
				function (err) {
					console.log("Failed to get local stream", err);
				}
			);
		});
	}, []);

	useEffect(() => {
		socket.on("me", (id) => setMe(id));
		peer.on("open", (id) => {
			socket.emit("join-room", roomId, id);
		});
	}, [roomId]);

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			console.log("entered", event.target.value);
			socket.emit("message", event.target.value, me);
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
						{item.user === me ? "(me): " : "(other): "} {item.text} {"<= "}
						{item.user}
					</li>
				))}
			</ul>

			<input
				id="chat_message"
				type="text"
				placeholder="Type message here..."
				onKeyDown={handleKeyDown}
			/>

			{videos.map((vid, index) => (
				<div key={index}>
					<ReactPlayer
						url={vid.str}
						muted
						playing
						width={480}
						height={300}
						playsinline
					/>
					<p>{vid.user}</p>
				</div>
			))}

			{/* <video playsInline ref={myVid} width="480" height="300" autoPlay muted /> */}
		</div>
	);
};

export default Room;
