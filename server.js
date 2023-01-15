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

app.get("/", (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
	res.json({ roomId: req.params });
});

io.on("connection", (socket) => {
	// console.log(socket.rooms); // Set { <socket.id> }
	// socket.join("room1");
	// console.log(socket.rooms);

	socket.on("join-room", (roomId) => {
		console.log(roomId);
		socket.join(roomId);
		socket.to(roomId).emit("user-connected");
	});
	console.log(socket.rooms);

	socket.emit("me", socket.id);
});

server.listen(3030);
