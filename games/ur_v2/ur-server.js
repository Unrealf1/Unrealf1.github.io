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
    console.log("from heartbeat:")
    console.log(json)
    return json
}

async function accept_invite(self_name, other_name) {
    const request = {
        "type": "start_game",
        "self": self_name,
        "other": other_name
    }
    let response = await post_data(request)
    return response
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
    return response
}

async function syncQue() {
  let response = await fetch(url)
  let names = await response.json()
  console.log("Got new queue:")
  console.log(names)
  return names
}
