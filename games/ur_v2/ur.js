const url ='https://imagination-site.herokuapp.com/ur'

class Unit {
  constructor() {
    this.position = 0
  }

}

class GameState {
  constructor(player1, player2) {
    player1.units = Array.from({length: 8}, (_, i) => new Unit())
    player2.units = Array.from({length: 8}, (_, i) => new Unit())
    this.player1 = player1
    this.player2 = player2
  }
}

function moveGameState(unit, player, opponent, steps) {
  let new_position = unit.position + steps
  if (new_position === 0) {return false}
  if (player.units.some((unit)=>unit.position === new_position)) {
    return false
  }
  let enemy_on_spot = opponent.units.some((unit)=>{
    return unit.position === new_position && unit.position > 4 && unit.position < 13})
  if (enemy_on_spot) {
    if (new_position === 8) {
      return false
    }
    let enemy_unit = opponent.units.find((unit)=>unit.position === new_position)
    enemy_unit.position = 0
  }
  unit.position = new_position
  return true
}

function checkForEnd(state) {
  let checkWin = (player) => {
    return player.units.every((unit) => unit.position > 14)
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

function syncQue(handler) {
    return firebase.database().ref('ur-que')
      .on('value', handler)
}

async function enterQue(name) {
  const data = {
    "type": "enter_queue",
    "name": name
  }
  let response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
       "Content-type": "application/json; charset=UTF-8"
    }
  })
  console.log("tried to enter que, response is")
  console.log(response)
}

function rollSteps() {
  return randomInt(2) + randomInt(2) + randomInt(2) + randomInt(2)
}

async function waitTurn(state, context) {
  context.state = state
  context.turn = true
  context.roll = rollSteps()
  updateElement('steps', context.roll)
  while(context.turn) {
    await sleep(100)
  }
}

function win(state, winner) {
  let winner_name = winner === 1 ? state.player1.name : state.player2.name
  window.alert(winner_name + 'won!')
}

async function actualGameplay(state, context, game_ref) {
  delete context.self_ref
  window.addEventListener('unload', function(event) {
    game_ref.remove()
  });
  context.state = state
  game_ref.on('value', async (snapshot)=>{
    let new_state = snapshot.val()
    if (new_state == null) {
      alert('other player left')
      location.reload()
    }
    updateGraphics(new_state, context)
    let winner = checkForEnd(new_state)
    if (winner !== 0) {
        win(state, winner)
        if (context.first_player) {
          context.first_player = false
          game_ref.remove()
        }
        return
    } 

    let player = context.first_player ? new_state.player1 : new_state.player2
    let opponent = context.first_player ? new_state.player2 : new_state.player1
    if (player == null || player.status !== 'turn') {
      return
    }
    state = new_state
    await waitTurn(state, context)
    player.status = 'wait'
    opponent.status = 'turn'
    game_ref.set(state)
  })
}

async function startGameWith(opponent, self, context) {
  if (context.first_player !== undefined) {
    console.log('Already in game!')
    return
  }
  console.log('me/opponent:')
  console.log(self)
  console.log(opponent)
  if (opponent.key === self.key) {
    console.log('can\'t start game with self')
    return
  }
  let opponent_ref =  firebase.database().ref('ur-que/'+opponent.key)
  console.log('I am ' + self.name + ', starting game with ' + opponent.name)
  opponent = (await opponent_ref.once('value')).val()
  opponent.key = opponent_ref.key
  console.log(opponent)
  if (opponent.status !== 'ready') {
    console.log('opponent is not ready, his status is ' + opponent.status)
    return
  }
  self.status = 'turn'
  let state = new GameState(self, opponent)
  let game_ref = await firebase.database().ref('ur-games').push()
  await game_ref.set(state)
  console.log('created game')
  opponent.game = game_ref.key
  opponent.status = 'wait'
  await opponent_ref.set(opponent)
  console.log('published game to the opponent')
  context.self_ref.remove()
  context.first_player = true
  actualGameplay(state, context, game_ref)
}

function displayQue(context) {
  que = context.que
  self = context.self
  let list = document.getElementById("que")
  while (list.firstChild) {
    list.removeChild(list.lastChild);
  }
  que.forEach((player) => {
    let entry = document.createElement("button");
    entry.onclick = () => {startGameWith(player, self, context)}
    var text = document.createTextNode(player.name + ': ' + player.status);
    entry.appendChild(text);
    list.appendChild(entry)
  })
}


async function main() {
    const canvas = document.querySelector("#glCanvas");
    var width = window.innerWidth * 0.75;
    var height = window.innerHeight - 20;
    var app = init(canvas, width, height)
    let gameContext = {
      app: app,
      width: width,
      height: height,
      que: []
    }
    name = window.prompt("Enter your name to enter a que", "");
    if (name === null || name.length === 0 || name === "null") {
      //TODO allow for offline gameplay
      return      
    } 
    await enterQue(name)

    gameContext.onGUnitClick = (gunit) => {
      console.log('clicked!')
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
      let player = gunit.first_player ? gameContext.state.player1 : gameContext.state.player2
      let opponent = gunit.first_player ? gameContext.state.player2 : gameContext.state.player1
      let unit = player.units[gunit.num]
      let steps = gameContext.roll
      if (moveGameState(unit, player, opponent, steps) === false) {
        console.log('wrong move!')
        return
      }
      console.log('now unit\'s position is ' + unit.position)
      gameContext.turn = false
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
}
  
window.onload = main;