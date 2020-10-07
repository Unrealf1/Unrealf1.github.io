class Bubble {
  _create_text() {
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 18,
      fontWeight: 'bold',
    });
    const text = new PIXI.Text('' + this.bounty, style);
    text.x = this.x-10;
    text.y = this.y-12;
    return text
  }

  constructor(circle, dx, dy, bounty, life) {
    this.circle = circle
    this.dx = dx;
    this.dy = dy;
    this.bounty = bounty;
    this.life = life
    this.text = this._create_text(bounty)
  }

  get r() {
    return this.circle.r
  }

  get x() {
    return this.circle.x
  }

  get y() {
    return this.circle.y
  }

  move(delta) {
    this.circle.x += this.dx * delta
    this.circle.y += this.dy * delta
    this.text.x += this.dx * delta
    this.text.y += this.dy * delta
  }
  fade() {
    this.life -= 1
    this.circle.alpha = this.life / 100
  }
}

function saveToFirebase(name, score, misses) {
  let record = {
    name: name,
    score: score,
    misses: misses
  }

  firebase.database().ref('bubbles-records').push().set(record)
      .then(function(snapshot) {

      }, function(error) {
          console.log('error' + error);
      });
}

function init(canvas, width, height, backgroundColor=0x000000) {
  canvas.width = width;
  canvas.height = height;
  if(!PIXI.utils.isWebGLSupported()){
    alert("Your browser ot computer does not support this page :(")
  }
  let app = new PIXI.Application({
    width: width,
    height: height,
    backgroundColor : backgroundColor,
    view: canvas
  });
  app.stage.interactive = true;
  app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
  return app
}

var bubble_colors = [0x9b59b6, 0xffc125, 0xf24b4b, 0x97c4f5, 0xe3e129]
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
  let color   = randomSample(bubble_colors)
  let circle  = createCircle(x, y, r, color)
  circle.interactive = true
  let klife   = Math.floor((100 - life) / 10)
  let kr      = Math.floor((90 - r) / 20)
  let bounty  = (kspeed * (1 + klife + kr))
  return new Bubble(circle, dx, dy, bounty, life)
}

function safeCreateBubble(width, height, context) {
  let bubble = createBubble(width, height)
  while(bubbleCollision(bubble, context.bubbles) || screenCollision(bubble, context)) {
    bubble = createBubble(width, height)
  }
  return bubble
}

function removeBubble(bubble, bubbles, stage) {
  stage.removeChild(bubble.circle)
  stage.removeChild(bubble.text)
  bubbles.splice(bubbles.indexOf(bubble), 1);
}

function initBubble(bubble, context) {
  let app = context.app
  let bubbles = context.bubbles
  let bubbleOnclick = () => {
    console.log("removing bubble. It's bounty is " + bubble.bounty)
    console.log("score is " + context.score)
    removeBubble(bubble, bubbles, app.stage)
    console.log(bubbles.length)
    context.score += bubble.bounty
    context.score += 5 // for misses
    context.misses -= 1
    updateElement("score", context.score)
  }
  bubble.circle.on('pointerdown', bubbleOnclick);
  app.ticker.add((delta) => {
    bubble.move(delta)
  });
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

function updateElement(name, value) {
  let elem = document.getElementById(name)
  elem.innerText = '' + value
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
  const richText = new PIXI.Text('Click on the field to try again!', style);
  richText.x = 50;
  richText.y = 220;
  return richText
}

function stringFromRecord(record) {
  return '' + record.name + ': ' + record.score + '(' + record.misses + ')'
}

function displayScores(scores) {
  let list = document.getElementById("records")
  while (list.firstChild) {
    list.removeChild(list.lastChild);
  }
  scores.forEach((record) => {
    let li = document.createElement("div");
    var text = document.createTextNode(stringFromRecord(record));
    li.appendChild(text);
    list.appendChild(li)
  })
}

let scores_loaded = false
function loadScores() {
  if (scores_loaded) {return}
  firebase.database().ref('bubbles-records')
    .orderByChild("score")
    .limitToFirst(15)
    .on('value', (snapshot) => {
      scores = []
      console.log("records")
      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        scores.push(childData)
      });
      scores.reverse()
      scores.forEach((data) => {console.log(data)})
      displayScores(scores)
    })
    scores_loaded = true
}

function checkScore(context) {
  if (context.score > 280) {
    name = window.prompt("Enter your name to save a record!", "");
    if (name == null || name.length === 0) {
      return;
    }
    saveToFirebase(name, context.score, context.misses)
  }
}

function main() {
    loadScores()
    const canvas = document.querySelector("#glCanvas");
    var width = window.innerWidth * 0.5;
    var height = window.innerHeight - 20;
    var app = init(canvas, width, height)
    let gameContext = {
      score: 0,
      misses: 0,
      bubbles: [],
      app: app,
      width: width,
      height: height
    }
    app.stage.on('pointerdown', () => {
      gameContext.misses += 1
      gameContext.score -= 5
      updateElement("misses", gameContext.misses)
      updateElement("score", gameContext.score)
    });
    app.ticker.add((delta) => {
      collision(gameContext)
    });
    let spawnTimer = setInterval(() => {
      let bubble = safeCreateBubble(width, height, gameContext)
      initBubble(bubble, gameContext)
      app.stage.addChild(bubble.circle)
      app.stage.addChild(bubble.text)
    }, 700);
    let fadeTimer = setInterval(() => {
      for (bubble of gameContext.bubbles) {
        bubble.fade()
        if (bubble.life <= 0) {
          removeBubble(bubble, gameContext.bubbles, app.stage)
        }
      }
    }, 50)
    let timeLeft = 30
    updateElement("time", timeLeft)
    let countdownTimer = setInterval(() => {
      timeLeft -= 1
      updateElement("time", timeLeft)
      if (timeLeft === 0) {
        for (bubble of [...gameContext.bubbles]) {
          removeBubble(bubble, gameContext.bubbles, app.stage)
        }
        clearInterval(spawnTimer)
        clearInterval(fadeTimer)
        clearInterval(countdownTimer)
        app.stage.addChild(finalText());
        checkScore(gameContext)
        app.stage.on('pointerdown', () => {
          app.stop()
          app.destroy()
          updateElement("score", 0)
          updateElement("misses", 0)
          updateElement("last", gameContext.score)
          main()
        });
      }
    }, 1000)
    
}
  
window.onload = main;