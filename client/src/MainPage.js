import React from 'react'
import './bootstrap.min.css'

class MainPage extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			games: [],
			findedGames: [],
			modal: "modal fade"
		}
	}
	componentDidMount() {
		this.updateGames()
		if (!localStorage.getItem("id")){
			localStorage.setItem("id", `f${(+new Date).toString(16)}`)
		}
	}
	getName(i) {
		return this.state.games[i].props.name
	}
	async updateGames() {
		let res = await fetch("/api/getGames", { method: "POST" })
		let games = await res.json()
		this.state.games = []
		this.state.findedGames = []
		games.map((e, i) => {
			this.state.games.push(<Game key={i} getName={this.getName.bind(this)}
									name={e.name} players={e.playersCount} 
									number={i + 1} status={e.status} tags = {e.tags} />)
			this.state.findedGames.push(this.state.games[i])
		})
		this.forceUpdate()
	}
	showModal() {
		this.setState({ modal: "modal fade show" })
	}
	hideModal() {
		this.setState({ modal: "modal fade" })
	}
	hideGames(games) {
		this.setState({ findedGames: games })
	}
	clearCookie() {
		localStorage.clear()
	}
	render() {
		return (
			<div className="container">
				<TagsFinder games={this.state.games} func={this.hideGames.bind(this)} flag={"findTags"} />
				<table className="table table-dark table-striped">
					<thead>
				    	<tr>
				      		<th scope="col">#</th>
				      		<th scope="col">Name</th>
				      		<th scope="col">Players</th>
				      		<th scope="col">Status</th>
				    	</tr>
				  	</thead>
				  	<tbody>
				 		{this.state.findedGames}
				  	</tbody>
				</table>
				<div className="form-row text-center">
	    			<button className="btn btn-outline-success" onClick={this.showModal.bind(this)}>+Create New Game</button>
	 			</div>
	 			<Modal fade={this.state.modal} hide={this.hideModal.bind(this)} />
	 			{/*<button className="btn btn-primary" onClick={this.clearCookie}>Clear Cookie</button>*/}
 			</div>
		)
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props)
	}
	connectToGame(e) {
		window.location.href = "/game/" + this.props.getName(this.props.number - 1)
	}
	render() {
		return (
			<tr style={{ cursor: 'pointer' }} onClick={this.connectToGame.bind(this)}>
			   	<th scope="row">{this.props.number}</th>
			    <td>{this.props.name}</td>
			    <td>{this.props.players + "/2"}</td>
			    <td>{this.props.status}</td>
			</tr>
		)
	}
}

class TagsFinder extends React.Component {
	constructor(props) {
		super(props)
	}
	find(e) {
		let text = e.target.value.split(" ")
		if (this.props.flag === "findTags") {
			let result = []
			let games = this.props.games
			for (let i = 0 ; i < games.length; i++) {
				let da = false
				for (let j = 0; j < games[i].props.tags.length; j++) {
					for (let k = 0; k < text.length; k++) if (text[k] === games[i].props.tags[j]) da = true
				}
				if (da) result.push(games[i])
			}
		if (e.target.value === "") this.props.func(games)
		else this.props.func(result)
		}
		else if (this.props.flag === "setTags") {
			this.props.func(text)
		}
	}
	render() {
		return ( <input 	className="form-control mb-2 mt-2" 
						style={{ width: '30%', minWidth: '120px'}} 
						placeholder="Type tags..." autocomplete="on" onInput={this.find.bind(this)} /> )
	}
}

class Modal extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			name: "",
			tags: []
		}
	}
	changeHandler(e) {
		this.state.name = e.target.value
	}
	updateTags(tags) {
		this.setState({ tags: tags })
	}
	async createGame() {
		const game = {
			name: this.state.name,
			playersCount: "0",
			players: { x: "", o: ""},
			score: [0, 0],
			status: "waiting",
			turn: "x",
			state: [
				["-", "-", "-"],
				["-", "-", "-"],
				["-", "-", "-"]
			],
			continue: [],
			tags: this.state.tags
		}
		let res = await fetch('/api/createGame', {
			method: "POST",
			body: JSON.stringify(game),
			headers: {'Content-Type': 'application/json'}
		})
		console.log(await res.json())
		window.location.href = "/game/" + game.name
	}
	render() {
		return (
			<div className={this.props.fade} id="exampleModal" style={{ display: this.props.fade === "modal fade" ? "none" : "block"}}> 
  				<div className="modal-dialog">
    				<div className="modal-content">
      					<div className="modal-header">
        					<h5 className="modal-title" id="exampleModalLabel">Create New Game</h5>
        					<button className="btn-close" aria-label="Close" onClick={this.props.hide}></button>
      					</div>
      					<div className="modal-body">
      						<label>Name:</label>
        					<input type="text" className="form-control" placeholder="game's name" onInput={this.changeHandler.bind(this)} />
        					<TagsFinder games={[]} func={this.updateTags.bind(this)} flag={"setTags"}/>
      					</div>
      					<div className="form-row text-center">
        					<button className="btn btn-primary mb-2" onClick={this.createGame.bind(this)}>Create Game</button>
      					</div>
    				</div>
  				</div>
			</div>
		)
	}
}

export default MainPage