import React from 'react'
import openSocket from 'socket.io-client';
import './GamePage.css'
import './bootstrap.min.css'

const socket = openSocket('http://localhost:5000')


class GamePage extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			state: [
				["-", "-", "-"],
				["-", "-", "-"],
				["-", "-", "-"]
			],
			playersCount: 0,
			turn: "x",
			winner: "no",
			status: "waiting",
			modal: "modal fade",
			team: "",
			room: window.location.href.split("/")[4],
			score: [0, 0],
			players: { x: "", y: ""}
		} 
	}
	showWin(win) {
		this.setState({ winner: win.team, modal: "modal fade show" })
	}
	componentDidMount() {
		socket.on("redirectOnMain", () => window.location.href = "/")
		socket.emit("connectPlayer", { room: this.state.room, id: localStorage.getItem("id") })
		socket.on("updateClient", (data) => { 
			this.setState({ state: data.state, turn: data.turn, status: data.status,
			 				playersCount: data.playersCount, players: data.players, score: data.score,
			 				team: data.players.x ===  localStorage.getItem("id") ? "x" : "o" , modal: "modal fade", winner: "no"})
			console.log(this.state)
			let win = this.checkWin()
			if (win) this.showWin(win)
		})
		socket.on("setCookie", (data) => {
			fetch("/api/setCookie", {
				method: "POST",
				body: JSON.stringify(data),
				headers: {'Content-Type': 'application/json'}
			})
		})
	}
	checkWin() {
		let state = this.state.state
		let draw = true
		let res
		state[0].map((e, i) => {
			if (e === "-" || state[1][i] === "-" || state[2][i] === "-") draw = false
			else if (e === state[1][i] && e === state[2][i]) {
				res = { win: [[0, i], [1, i], [2, i]], team: e }
			}
		})
		state.map((e, i) => {
			if (e[0] === "-" || e[1] === "-" || e[2] === "-") draw = false
			else if (e[0] === e[1] && e[0] === e[2]) {
				res = { win: [[i, 0], [i, 1], [i, 2]], team: e[0] }
			}
		})
		if (draw) return { team: "draw" }
		if (state[0][0] === state[1][1] && state[1][1] === state[2][2] && state[0][0] != "-") {
			return { win: [[0, 0], [1, 1], [2, 2]], team: state[0][0] }
		}
		if (state[0][2] === state[1][1] && state[1][1] === state[2][0] && state[0][2] != "-") {
			return { win: [[0, 2], [1, 1], [2, 0]], team: state[0][2] }
		}
		if (res) return res
		else return false
	}
	set(x, y) {
		if (this.state.state[y][x] === "-" && this.state.turn === this.state.team) {
			this.state.state[y][x] = this.state.team
			this.state.turn = this.state.turn === "x" ? "o" : "x"
			socket.emit("updateGame", { prop: "state", value: this.state.state, room: this.state.room })
			socket.emit("updateGame", { prop: "turn", value: this.state.turn, room: this.state.room })
			//this.forceUpdate()
		}
		else return
	}
	render() {
		return (
			<React.Fragment>
				<Info turn={this.state.turn} team={this.state.team} status={this.state.status} score={this.state.score} />
				<GameBoard 	state={this.state.state} set={this.set.bind(this)}
						 	modal={this.state.modal} winner={this.state.winner} status={this.state.status} />
			</React.Fragment>
		)
	}
}

class Info extends React.Component {
	constructor(props) {
		super(props)
	}
	render() {
		return (
			<div className="info">
				<div className="team">{"YOUR TEAM: " + this.props.team}</div>
				<div className="status" style={{ color: this.props.status === "waiting" ? "yellow" : "green"}}>{this.props.status}</div>
				<div className="score">{"X: " + String(this.props.score[0]) + " : " + String(this.props.score[1]) + " :O"}</div>
				<div className="turn" style={{ color: this.props.turn === "x" ? "red" : "blue"}}>{"TURN: " + this.props.turn}</div>
			</div>
		)
	}
}

class GameBoard extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			canvas: null,
		}
	}
	componentDidMount() {
		let canvas = document.getElementById("canvas")
		canvas.width = canvas.parentNode.offsetWidth
		canvas.height = canvas.width
		this.state.canvas = canvas
		this.state.ctx = canvas.getContext("2d")
		this.drawBoard()
	}
	drawBoard() {
		const size = this.state.canvas.width
		this.state.ctx.fillStyle = "black"
		this.state.ctx.fillRect(size / 3, 0, 2, size)
		this.state.ctx.fillRect(2 * size / 3, 0, 2, size)
		this.state.ctx.fillRect(0, size / 3, size, 2)
		this.state.ctx.fillRect(0, 2 * size / 3, size, 2)
	}
	componentDidUpdate() {
		this.drawState()
	}
	drawZero(x, y) {
		const size = this.state.canvas.width
		this.state.ctx.strokeStyle = "blue"
		this.state.ctx.lineWidth = 4
		this.state.ctx.beginPath()
		this.state.ctx.arc(x * size / 3 + size / 6, //x
				y * size / 3 + size / 6, //y
				size / 6 - size / 24, //radius
				0, //start
				Math.PI * 2) // end
		this.state.ctx.stroke()
	}
	drawCross(x, y) {
		const size = this.state.canvas.width
		this.state.ctx.strokeStyle = "red"
		this.state.ctx.lineWidth = 4
		this.state.ctx.beginPath()
		this.state.ctx.moveTo(x * size / 3 + size / 24, y * size / 3 + size / 24)
		this.state.ctx.lineTo(x * size / 3 + size / 3 - size / 24, y * size / 3 + size / 3 - size / 24)
		this.state.ctx.moveTo(x * size / 3 + size / 3 - size / 24, y * size / 3 + size / 24)
		this.state.ctx.lineTo(x * size / 3 + size / 24, y * size / 3 + size / 3 - size / 24)
		this.state.ctx.stroke()
	}
	clearBoard() {
		this.state.canvas.width = this.state.canvas.width
	}
	drawState() {
		this.clearBoard()
		this.drawBoard()
		this.props.state.map((e, i) => {
			for (let j = 0; j < e.length; j++) {
				if (e[j] == "-") continue
				else if (e[j] == "x") this.drawCross(j, i)
				else if (e[j] == "o") this.drawZero(j, i)
			}
		})
		console.log(this.props.state)
	}
	
	
	makeStep(e) {
		const size = this.state.canvas.offsetWidth
		let x = e.clientX - e.target.offsetLeft
		let y = e.clientY - e.target.offsetTop
		console.log(x, y)
		if (x >= 0 && x <= size / 3) x = 0
		else if (x > size / 3 && x <= 2 * size / 3) x = 1
		else x = 2
		if (y >= 0 && y <= size / 3) y = 0
		else if (y > size / 3 && y <= 2 * size / 3) y = 1
		else y = 2
		if (this.props.winner === "no" && this.props.status !== "waiting") this.props.set(x, y)
	}
	render() {
		return (
			<div className="container text-center">
				<canvas id="canvas" onClick={this.makeStep.bind(this)}></canvas>
				<Modal winner={this.props.winner} fade={this.props.modal}/>
			</div>
		)
	}
}

class Modal extends React.Component {
	constructor(props) {
		super(props)
	}
	end() {
		socket.emit("deleteGame", window.location.href.split("/")[4])
	}
	continue() {
		socket.emit("addContinue", { room: window.location.href.split("/")[4], id: localStorage.getItem("id"), winner: this.props.winner })
	}
	render() {
		return (
			<div className={this.props.fade} id="exampleModal" style={{ display: this.props.fade === "modal fade" ? "none" : "block"}}> 
  				<div className="modal-dialog">
    				<div className="modal-content">
      					<div className="modal-header">
        					<h5 className="modal-title" id="exampleModalLabel">Game Info</h5>
      					</div>
      					<div className="modal-body">
      						<div>Winner: {this.props.winner.toUpperCase()}</div>
      					</div>
      					<div className="form-row text-center">
        					<button className="btn btn-success mb-2" onClick={this.continue.bind(this)}>Continue Game</button>
        					<button className="btn btn-danger mb-2 ml-5" onClick={this.end.bind(this)}>End Game</button>
      					</div>
    				</div>
  				</div>
			</div>
		)
	}
}

export default GamePage