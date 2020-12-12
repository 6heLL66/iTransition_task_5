const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const path = require("path")


const app = express()
const server = require('http').Server(app)


const PORT = process.env.PORT || 5000

app.use(express.json({ extended: true }))
app.use(cookieParser('cookie'))

app.post("/api/getGames", (req, res) => {
	res.send(games)
})

app.post("/api/createGame", (req, res) => {
	games.push(req.body)
	res.status(201).json({ message: "Игра создана" })
})

app.use("/", express.static(path.join(__dirname, 'client', 'build')))

app.get("*", (req, res) => {
	res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

server.listen(PORT, () => console.log(`server started on port: ${PORT}`))


const io = require("socket.io")(server)

let games = []

io.on("connection", socket => {
	socket.on("connectPlayer", data => {
		socket.join(data.room)
		console.log("socket joined room " + data.room)
		let connect = false
		games.map(e => {
			if (e.name === data.room) {
				if (e.players.x === data.id || e.players.o === data.id) {
					socket.emit('updateClient', e)
					connect = true
				}
				else if (e.playersCount < 2) {
					e.playersCount++
					let team = e.players.x === "" ? "x" : "o"
					e.players[team] = data.id
					if (e.playersCount == 2) e.status = "playing"
					socket.emit('updateClient', e)
					io.to(data.room).emit('updateClient', e)
					connect = true
				}
			}
		})
		if (!connect) socket.emit("redirectOnMain")
	})
	socket.on("deleteGame", name => {
		games.map((e, i) => {
			if (e.name === name) games.splice(i, 1)
		})
		io.to(name).emit("redirectOnMain")
		//socket.emit("redirectOnMain")
	})
	socket.on("addContinue", data => {
		games.map((e, i) => {
			if (e.name === data.room) {
				console.log(e)
				if (e.continue.length == 0) e.continue.push(data.id)
				else if (e.continue[0] != data.id) {
					e.continue = []
					e.state = [["-", "-", "-"],["-", "-", "-"],["-", "-", "-"]]
					if (data.winner === "x") e.score[0]++
					else if (data.winner === "o") e.score[1]++
					else {
						e.score[0]++
						e.score[1]++
					}
					e.turn = "x"
					io.to(data.room).emit("updateClient", e)
					socket.emit("updateClient", e)
				}
			}
		})
	})
	socket.on("updateGame", data => {
		games.map(e => {
			if (e.name === data.room) {
				e[data.prop] = data.value
				io.to(data.room).emit('updateClient', e)
			}
		})
	})
})


