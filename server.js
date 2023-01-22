const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
// const io = require("socket.io")(server);
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		method: ["GET", "POST"],
	},
});
app.use(cors());

// const { ExpressPeerServer } = require("peerjs");
// const peerServer = ExpressPeerServer(server, {
// 	debug: true,
// });

app.get("/", (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
	res.json({ roomId: req.params });
});

let room = undefined;

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, peerId) => {
		room = roomId;
		console.log("peer", peerId);
		socket.join(roomId);
		socket.to(roomId).emit("user-connected", peerId);
		// socket.on("message", (message) => {
		// 	console.log(message);
		// 	io.to(roomId).emit("createMessage", message);
		// });
	});
	socket.on("message", (message, peer) => {
		console.log(message);
		io.to(room).emit("createMessage", message, peer);
	});
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		console.log("disconnect");
	});
});

server.listen(3030);
