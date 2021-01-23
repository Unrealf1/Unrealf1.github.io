//const url ='https://imagination-site.herokuapp.com/ur'
const url ='http://127.0.0.1:5000/ur'

async function post_data(data) {
    let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
           "Content-type": "application/json; charset=UTF-8"
        }
    })
    
    return response
}

async function enterQue(name) {
    const request = {
      "type": "enter_queue",
      "name": name
    }
    let response = await post_data(request)
    console.log("tried to enter que, response is")
    console.log(response)
}

async function invite(self_name, other_name) {
    const request = {
        "type": "invite",
        "self": self_name,
        "other": other_name
    }
    let response = await post_data(request)
    console.log("invited other person to the game. Response:")
    console.log(response)
}

async function heartbeat(name) {
    const request = {
        "type": "heartbeat",
        "name": name
    }
    let response = await post_data(request)
    json = await response.json()
    return json
}

async function accept_invite(self_name, other_name) {
    const request = {
        "type": "start_game",
        "self": self_name,
        "other": other_name
    }
    let response = await post_data(request)
    let json = await response.json()
    if (json["status"] === "ok") {
        game_id = json["game_id"]
        console.log("Game id is ", game_id)
        return game_id
    } else {
        console.log("could not start game.")
        console.log(json)
        return -1
    }
}

async function commit_turn(game_id, player, unit, step) {
    const request = {
        "type": "turn",
        "game_id": game_id,
        "player": player,
        "unit": unit,
        "step": step
    }
    let response = await post_data(request)
    let text = await response.text()
    return text
}

async function get_state(game_id) {
    console.log("requesting state, game id is ", game_id)
    const request = {
        "type": "get_state",
        "game_id": game_id
    }
    let response = await post_data(request)
    let state = await response.json()
    return state
}

async function syncQue() {
  let response = await fetch(url)
  let names = await response.json()
  return names
}
