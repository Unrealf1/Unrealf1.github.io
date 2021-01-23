var gameContext = null

class Unit {
  constructor() {
    this.position = 0
  }

  static in_position(position) {
    let unit = new Unit()
    unit.position = position
    return unit
  }

}

class GameState {
  constructor(player1, player2) {
    this.player1 = player1
    this.player2 = player2
  }

  static empty() {
    return new GameState(
      Array.from({length: 8}, (_, i) => new Unit()), 
      Array.from({length: 8}, (_, i) => new Unit())
    )
  }

  static fromServerState(state) {
    let toArray = (json) => {
      let parsed = JSON.parse(json)
      let out = []
      for(var i = 0; i < parsed.length; i++) {
        var obj = parsed[i];
        out.push(obj)
      }
      return out
    }
    let toUnits = (positions) => {
      let units = []
      for (var i = 0; i < positions.length; i++) {
        units.push(Unit.in_position(positions[i]))
      }
      return units
    }

    return new GameState(
      toUnits(toArray(state["positions1"])), 
      toUnits(toArray(state["positions2"]))
    )
  }
}

function tryTurn(unit, player, opponent, steps) {
  let new_position = unit.position + steps
  if (new_position === 0) {return -1}
  if (player.some((unit)=>unit.position === new_position)) {
    return -1
  }
  let enemy_on_spot = opponent.some((unit)=>{
    return unit.position === new_position && unit.position > 4 && unit.position < 13})
  if (enemy_on_spot) {
    if (new_position === 8) {
      return -1
    }
    let enemy_unit = opponent.find((unit)=>unit.position === new_position)
    enemy_unit.position = 0
  }
  return new_position
}

function checkForEnd(state) {
  let checkWin = (player) => {
    return player.every((unit) => unit.position > 14)
  }
  let winner = 0
  if (checkWin(state.player1)) {
    winner = 1
  }
  if (checkWin(state.player2)) {
    winner = 2
  }
  return winner
}

function rollSteps() {
  let text = document.getElementById("steps")
  let steps = randomInt(2) + randomInt(2) + randomInt(2) + randomInt(2)
  text.textContent = steps
  return steps
}

async function startGame(is_first, game_id) {
  gameContext.turn = is_first
  gameContext.first_player = is_first
  gameContext.game_id = game_id
  gameContext.roll = rollSteps()
  start_state_change_check()
  alert("Game started!")
}

function displayInvites(invites) {
  console.log(invites)
  var ul = document.getElementById("invites")
  function addItem(name){
    var li = document.createElement("li")
    li.className = "invites-element"
    li.appendChild(document.createTextNode(name))
    let button = document.createElement('button')
    button.className = "invite-button"
    button.innerText = "accept"
    button.onclick = async () => {
      id = await accept_invite(gameContext.name, name)
      if (id < 0) {
        return
      }
      startGame(true, id)
    }

    li.appendChild(button)
    ul.appendChild(li)
  }
  while(ul.firstChild) ul.removeChild(ul.firstChild)
  for (elem of invites) {
    addItem(elem)
  }
}

async function start_heartbeat() {
  while (gameContext.turn === undefined) {
    let hb = await heartbeat(gameContext.name)
    displayInvites(hb["invites"])
    if (hb["accepted"] >= 0) {
      console.log("somebody accepted invite! starting game...")
      startGame(false, hb["accepted"])
    }
    await sleep(5000)
  }
  console.log("stopping heartbeats")
}

async function start_state_change_check() {
  while (true) {
    if (true) {
      let state = await get_state(gameContext.game_id)
      console.log(state)
      gameContext.state = GameState.fromServerState(state)
      let player_idx = gameContext.first_player ? 1 : 2
      gameContext.turn = (state["turn"] === player_idx)
      let end = checkForEnd(gameContext.state)
      if (end > 0) {
        if (end === player_idx) {
          alert("You won!")
        } else {
          alert("You lost")
        }
      } 
    }
    updateGraphics(gameContext.state, gameContext)
    await sleep(3000)
  }
}

function displayQue(queue) {
  var ul = document.getElementById("queue")
  function addItem(name){
    var li = document.createElement("li")
    li.className = "queue-element"
    //li.setAttribute('id',name)
    li.appendChild(document.createTextNode(name))
    let button = document.createElement('button')
    button.className = "invite-button"
    button.innerText = "invite"
    button.onclick = () => {
      invite(gameContext.name, name)
    }

    li.appendChild(button)
    ul.appendChild(li)
  }
  while(ul.firstChild) ul.removeChild(ul.firstChild)
  console.log(queue)
  for (elem of queue) {
    if (elem !== gameContext.name) {
      addItem(elem)
    }
  }
}

async function refreshQue() {
  let names = await syncQue()
  displayQue(names)
}

async function main() {
    const canvas = document.querySelector("#glCanvas");
    var width = window.innerWidth * 0.75;
    var height = window.innerHeight - 20;
    var app = init(canvas, width, height)
    
    var name = window.prompt("Enter your name to enter a que", "");
    while (name === null || name.length === 0 || name === "null") {
      //TODO allow offline gameplay
      name = window.prompt("Sorry, offline is not yet supported, so name is required.\nEnter your name to enter a que", "");    
    }

    gameContext = {
      app: app,
      width: width,
      height: height,
      name: name
    }

    await enterQue(name)

    start_heartbeat()

    gameContext.onGUnitClick = async (gunit) => {
      let context = gameContext
      if (context.turn === undefined || context.first_player === undefined || context.state === undefined) {
        console.log('game hasn\'t started yet')
        return
      }
      if (context.turn === false) {
        console.log('it is not your turn yet')
        return
      }
      if (context.first_player !== gunit.first_player) {
        console.log('it\'s not your unit')
        return
      }
      let player = gunit.first_player ? gameContext.state.player1 : gameContext.state.player2
      let opponent = gunit.first_player ? gameContext.state.player2 : gameContext.state.player1
      let unit = player[gunit.num]
      let steps = gameContext.roll
      let new_pos = tryTurn(unit, player, opponent, steps)
      if (new_pos < 0) {
        console.log('wrong move!')
        return
      }
      let player_idx = context.first_player ? 1 : 2
      let response = await commit_turn(context.game_id, player_idx, gunit.num, steps)
      if (response !== "OK") {
        console.log("could not commit turn")
        console.log(response)
        return
      }
      unit.position = new_pos
      console.log('now unit\'s position is ')
      console.log(unit.position)
      gameContext.turn = false
      gameContext.roll = rollSteps()
    }
    document.getElementById('skip').onclick = () => {
      let context = gameContext
      if (context.first_player === undefined) {
        console.log('game hasn\'t started yet')
        return
      }
      if (context.turn === undefined || context.turn === false) {
        console.log('it is not my turn yet')
        return
      }
      if (context.first_player !== gunit.first_player) {
        console.log('it\'s not your unit')
        return
      }
      gameContext.turn = false
    }
    initGraphics(gameContext)
    console.log("initialization complete.")
    console.log(gameContext)
}
  
window.onload = main;