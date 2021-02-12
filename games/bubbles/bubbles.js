let color_list = [0x9b59b6, 0xffc125, 0xf24b4b, 0x97c4f5, 0xe3e129]

let gameContext = null

class Bubble {
  _create_text() {
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 18,
      fontWeight: 'bold',
    });
    const text = new PIXI.Text('' + this.bounty, style);
    text.x = -10;
    text.y = -12;
    return text
  }

  _create_border() {
    let line = new PIXI.Graphics();
    line.lineStyle(4, randomSample(color_list), 1);
    line.drawCircle(0, 0, this.r - 2);
    return line
  }

  constructor(x, y, r, color, dx, dy, bounty, life) {
    this.r = r
    this.dx = dx;
    this.dy = dy;
    this.bounty = bounty;
    this.life = life
    this.graphics = new PIXI.Container()
    this.graphics.x = x
    this.graphics.y = y
    this.circle = createCircle(0, 0, r, color)
    this.circle.interactive = true
    this.graphics.addChild(this.circle)
    // this.graphics.addChild(this._create_border())
    this.graphics.addChild(this._create_text(bounty))
  }

  get x() {
    return this.graphics.x
  }

  get y() {
    return this.graphics.y
  }

  move(delta) {
    this.graphics.x += this.dx * delta
    this.graphics.y += this.dy * delta
  }
  fade() {
    this.life -= 1
    this.graphics.alpha = this.life / 100
  }
}

function saveToFirebase(name, score, misses) {
  let record = {
    name: name,
    score: score,
    misses: misses,
    mobile: isMobile()
  }

  firebase.database().ref('bubbles-records').push().set(record)
      .then(function(snapshot) {

      }, function(error) {
          console.log('error' + error);
      });
}

function createBubble(width, height) {
  let life    = randomIntIn(80, 101)
  let dx      = randomIntIn(1, 5)
  let dy      = randomIntIn(1, 5)
  let kspeed  = Math.floor((dx + dy) / 2)
  dx -= dx * (randomInt(2)) * 2
  dy -= dy * (randomInt(2)) * 2
  let r       = randomIntIn(10, 90)
  let x       = randomIntIn(100, width - 100)
  let y       = randomIntIn(100, height - 100)
  let color   = randomSample(color_list)
  let klife   = Math.floor((100 - life) / 10)
  let kr      = Math.floor((90 - r) / 20)
  let bounty  = (kspeed * (1 + klife + kr))
  return new Bubble(x, y, r, color, dx, dy, bounty, life)
}

function safeCreateBubble(width, height, context) {
  let bubble = createBubble(width, height)
  while(bubbleCollision(bubble, context.bubbles) || screenCollision(bubble, context)) {
    bubble = createBubble(width, height)
  }
  return bubble
}

function removeBubble(bubble, bubbles, stage) {
  stage.removeChild(bubble.graphics)
  bubbles.splice(bubbles.indexOf(bubble), 1);
  bubble.graphics.destroy({children: true})
}

function initBubble(bubble, context) {
  let app = context.app
  let bubbles = context.bubbles
  let bubbleOnclick = () => {
    removeBubble(bubble, bubbles, app.stage)
    context.score += bubble.bounty
    context.score += 5 // for misses
    context.misses -= 1
    updateElement("score", context.score)
  }
  bubble.circle.on('pointerdown', bubbleOnclick);
  bubbles.push(bubble)
}

function bubbleCollision(bubble, bubbles) {
  res = false
  for (other of bubbles) {
    if (other !== bubble && objDistance(bubble, other) <= bubble.r + other.r) {
      bubble.dx = randomIntIn(1, 5) * Math.sign(bubble.x - other.x)
      bubble.dy = randomIntIn(1, 5) * Math.sign(bubble.y - other.y)
      res = true
    }
  }
  return res
}

function screenCollision(bubble, context) {
  res = false
  if (bubble.x - bubble.r <= 0) {
    bubble.dx = Math.abs(bubble.dx)
    res = true
  } else if (bubble.x + bubble.r >= context.width) {
    bubble.dx = -Math.abs(bubble.dx)
    res = true
  }

  if (bubble.y - bubble.r <= 0) {
    bubble.dy = Math.abs(bubble.dy)
    res = true
  } else if (bubble.y + bubble.r >= context.height) {
    bubble.dy = -Math.abs(bubble.dy)
    res = true
  }
  return res
}

function collision(context) {
    for (bubble of context.bubbles) {
      bubbleCollision(bubble, context.bubbles)
      screenCollision(bubble, context)
    }
}

function finalText() {
  const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
    lineJoin: 'round'
  });
  const richText = new PIXI.Text('Game over, try again!', style);
  richText.x = 50;
  richText.y = 220;
  return richText
}

function stringFromRecord(record) {
  let res = '' + record.name + ': ' + record.score + '(' + record.misses + ')'
  if ('mobile' in record && record.mobile) {
    res += '  📱'
  }
  return res
}

function displayScores(scores, where="records", enumerate=false) {
  let list = document.getElementById(where)
  while (list.firstChild) {
    list.removeChild(list.lastChild);
  }
  let sequence_number = 1
  scores.forEach((record) => {
    let li = document.createElement("div");
    var text = document.createTextNode(stringFromRecord(record));
    if (enumerate) {
      li.appendChild(document.createTextNode(sequence_number.toString() + ". "))
      sequence_number += 1
    }
    li.appendChild(text);
    list.appendChild(li)
  })
}

let scores_loaded = false
function loadScores() {
  if (scores_loaded) {return}
  firebase.database().ref('bubbles-records')
    .orderByChild("score")
    .limitToLast(10)
    .on('value', (snapshot) => {
      scores = []
      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        scores.push(childData)
      });
      scores.reverse()
      displayScores(scores)
    })
    scores_loaded = true
}

function updateScoreBoard() {
  firebase.database().ref('bubbles-records')
    .orderByChild("score")
    .once('value')
    .then((snapshot) =>{
      let scores = []
      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        scores.push(childData)
      });
      scores.reverse()
      displayScores(scores, "records-full", true)
    })
}

function openScoreBoard() {
 updateScoreBoard()
 openModal("records-modal-container")
}

async function checkScore(context) {
  if (context.score > 250) {
    let name = window.prompt("Enter your name to save a record!", "");
    if (name === null || name.length === 0 || name === "null") {
      return;
    }
    //saveToFirebase(name, context.score, context.misses)
    await post_record(name, context.score, context.misses, isMobile())
  }
}

function stopGame() {
  let app = gameContext.app
  gameContext.active = false
  for (bubble of [...gameContext.bubbles]) {
    removeBubble(bubble, gameContext.bubbles, app.stage)
  }
  clearInterval(gameContext.spawnTimer)
  clearInterval(gameContext.fadeTimer)
  clearInterval(gameContext.countdownTimer)
  let restart_button = document.getElementById("restart-button")
  restart_button.textContent = "Start"
  restart_button.onclick = startGame
}

function startGame() {
  let app = gameContext.app

  if (gameContext.finalText !== undefined) {
    app.stage.removeChild(gameContext.finalText)
    gameContext.finalText = undefined
  }
  
  updateElement("score", 0)
  updateElement("misses", 0)
  updateElement("last", gameContext.score)

  gameContext.score = 0
  gameContext.misses = 0

  gameContext.spawnTimer = setInterval(() => {
    let bubble = safeCreateBubble(gameContext.width, gameContext.height, gameContext)
    initBubble(bubble, gameContext)
    app.stage.addChild(bubble.graphics)
  }, 700);

  gameContext.fadeTimer = setInterval(() => {
    for (bubble of gameContext.bubbles) {
      bubble.fade()
      if (bubble.life <= 0) {
        removeBubble(bubble, gameContext.bubbles, app.stage)
      }
    }
  }, 50)

  let timeLeft = 30
  updateElement("time", timeLeft)
  gameContext.countdownTimer = setInterval(async () => {
    timeLeft -= 1
    updateElement("time", timeLeft)
    if (timeLeft === 0) {
      gameContext.finalText = finalText()
      app.stage.addChild(gameContext.finalText);
      stopGame()
      await checkScore(gameContext)
    }
  }, 1000)
  gameContext.active = true

  let restart_button = document.getElementById("restart-button")
  restart_button.textContent = "Restart"
  restart_button.onclick = restartGame
}

function restartGame() {
  stopGame()
  startGame() 
}

function main() {
    setupModal("records-modal-container", "records-modal-wrapper")
    loadScores()
    const canvas = document.querySelector("#glCanvas");
    var width = window.innerWidth * 0.5;
    var height = window.innerHeight - 20;
    var app = init(canvas, width, height, true)
    gameContext = {
      score: 0,
      misses: 0,
      bubbles: [],
      app: app,
      width: width,
      height: height,
      active: false
    }

    // If click has missed all circles
    app.stage.on('pointerdown', () => {
      if (!gameContext.active) {
        return
      }
      gameContext.misses += 1
      gameContext.score -= 5
      updateElement("misses", gameContext.misses)
      updateElement("score", gameContext.score)
    });

    // main update
    app.ticker.add((delta) => {
      if (!gameContext.active) {
        return
      }
      collision(gameContext)
      gameContext.bubbles.forEach((bubble) => {bubble.move(delta)})
    });
}
  
window.onload = main;