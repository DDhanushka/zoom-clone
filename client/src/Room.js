import React, { useEffect, useState } from "react";
import axios from "axios";

const Room = () => {
	const [roomId, setRoomId] = useState("");

	useEffect(() => {
		async function getRoomId() {
			try {
				const response = await axios.get("http://localhost:3030");
				console.log(response);
				if (response.status === 200) {
					setRoomId(JSON.stringify(response.data));
				}
			} catch (error) {
				console.error(error);
			}
		}
		getRoomId();
	}, []);

	return (
		<div>
			<h1>Client:room</h1>
			<p>{roomId}</p>
		</div>
	);
};

export default Room;
