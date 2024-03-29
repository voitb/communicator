const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
	},
});
const { MongoClient } = require("mongodb");
const cors = require("cors");

app.use(cors({ origin: "*" }));

const mongoClient = new MongoClient(
	"mongodb+srv://inzynieria:VhcL1kCXn4e4vs1W@cluster0.p7kp2wp.mongodb.net/?retryWrites=true&w=majority",
	{
		useUnifiedTopology: true,
	}
);

const main = async () => {
	await mongoClient.connect();

	const mongoCollection = mongoClient.db("crud-quotes").collection("messages");
	// const dbEmitter = new Emitter(mongoCollection);

	// io.adapter(createAdapter(mongoCollection));
	io.listen(3001);

	io.on("connection", (socket) => {
		socket.on("add_message", (data) => {
			mongoCollection.insertOne(data);
			// .then((result) => res.send("User added"))
			// dbEmitter.emit("message", data);
			socket.emit("new_message", data); // to sender self
			socket.broadcast.emit("new_message", { ...data, uid: data.receiver }); // to receiver
		});
	});
};

main();

module.exports = app;
