let gameContext = null

function grid_to_real(grid_coord, grid_limit, real_limit) {
  let square_size = real_limit / grid_limit;
  return square_size * grid_coord;
}

function grid_to_real_coord(x, y) {
  let xr, yr;
  xr = grid_to_real(x, gameContext.grid_width, gameContext.width);
  yr = grid_to_real(y, gameContext.grid_height, gameContext.height);
  return [xr, yr];
}

class SnakePart {
  update_graphics() {
    let x, y;
    [x, y] = grid_to_real_coord(this.x, this.y);
    this.graphics.x = x;
    this.graphics.y = y;
  }

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.graphics = new PIXI.Container();
    let square_side = gameContext.square_size * 1.05;
    this.square = createRect(0, 0, square_side, square_side, 0x9b59b6);
    let head_size = square_side / 4;
    this.head = createRect((square_side - head_size) / 4, (square_side - head_size) / 4, head_size, head_size, 0xffffff);
    this.head.visible = false;
    this.graphics.addChild(this.square)
    this.graphics.addChild(this.head)
    this.update_graphics()
  }
}

class Food {
  update_graphics() {
    let x, y;
    [x, y] = grid_to_real_coord(this.x, this.y);
    let offset = gameContext.square_size / 2;
    this.graphics.x = x + offset;
    this.graphics.y = y + offset;
  }

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.graphics = new PIXI.Container();
    this.circle = createCircle(0, 0, gameContext.square_size / 2, 0xffc125);
    this.graphics.addChild(this.circle)
    this.update_graphics()
  }
}

function removeItem(item, container, stage) {
  stage.removeChild(item.graphics)
  container.splice(container.indexOf(item), 1);
  item.graphics.destroy({children: true})
}

function createFood(width, height) {
  let x = randomIntIn(0, width)
  let y = randomIntIn(0, height)

  return new Food(x, y);
}

function food_snake_collision(food_item, snake) {
  for (part of snake) {
    if (food_item.x === part.x && food_item.y === part.y) {
      return true;
    }
  }
  return false;
}

function safeCreateFood(width, height, snake) {
  let food = createFood(width, height)
  while(food_snake_collision(food, snake)) {
    food = createFood(width, height)
  }
  return food
}

function spawnFood() {
  let new_food = safeCreateFood(gameContext.grid_width, gameContext.grid_height, gameContext.snake)
  gameContext.app.stage.addChild(new_food.graphics);
  gameContext.food.push(new_food);
}

function clearItems(items) {
  for (part of [...items]) {
    removeItem(part, items, gameContext.app.stage)
  }
}

function clearSnake() {
  clearItems(gameContext.snake);
}

function clearFood() {
  clearItems(gameContext.food);
}

function spawnSnake(length) {
  if (length < 2 || length > gameContext.grid_width / 2) {
    alert("Incorrect snake size!")
    console.log("Incorrect snake size!")
    return;
  }
  console.log("snake length:", length)

  let h = Math.floor(gameContext.grid_height / 2);
  let current_w = Math.floor(gameContext.grid_width / 2);
  
  for (let i = 0; i < length; i++) {
    let new_part = new SnakePart(current_w + i, h)
    gameContext.snake.push(new_part);
    gameContext.app.stage.addChild(new_part.graphics);
    console.log("snake:", gameContext.snake)
  }
}

function eatFood(food_item) {
  removeItem(food_item, gameContext.food, gameContext.app.stage);
  spawnFood();
  gameContext.score += 1;
  if (gameContext.hard_mode) {
    gameContext.current_step_delay_ms += (gameContext.min_step_delay_ms - gameContext.current_step_delay_ms) * 0.1
    clearInterval(gameContext.stepTimer)
    gameContext.stepTimer = setInterval(step, gameContext.current_step_delay_ms);
  }
  updateElement("score", gameContext.score);
}

function removeSnakePart(snake_part) {
  removeItem(snake_part, gameContext.snake, gameContext.app.stage);
}

function deathScreen() {
  alert("GAME\nOVER\n\ngeeettttttt\ndunked on!!!");
}

function stopGame() {
  console.log("stopping game");
  gameContext.active = false
  clearGameTimers();
  gameContext.current_step_delay_ms = gameContext.base_step_delay_ms
  let restart_button = document.getElementById("restart-button")
  restart_button.textContent = "Start"
  restart_button.onclick = startGame
  let mode_checkbox = document.getElementById("hardmode-checkbox")
  mode_checkbox.disabled = false
}

function clearGameContext() {
  gameContext.score = 0;
  gameContext.time = 0;
  gameContext.last_input = 0;
  clearSnake()
  clearFood()
}

function clearGameTimers() {
  clearInterval(gameContext.stepTimer)
  clearInterval(gameContext.secondsTimer)
}

function setupGameTimers() {
  gameContext.stepTimer = setInterval(step, gameContext.base_step_delay_ms);
  gameContext.secondsTimer = setInterval(async () => {
    gameContext.time += 1
    updateElement("time", gameContext.time)
  }, 1000)
}

function startGame() {
  console.log("starting game!");
  clearGameContext();
  updateElement("score", 0)
  updateElement("time", gameContext.time);

  setupGameTimers();
  spawnSnake(3);
  spawnFood();

  gameContext.active = true

  let restart_button = document.getElementById("restart-button")
  restart_button.textContent = "Stop"
  restart_button.onclick = stopGame

  let mode_checkbox = document.getElementById("hardmode-checkbox")
  mode_checkbox.disabled = true
}

function restartGame() {
  stopGame()
  startGame() 
}

function hardMode(cb) {
  gameContext.hard_mode = cb.checked
  console.log("set hard mode to ", gameContext.hard_mode)
}

function getInput() {
  // 0 -> ничего
  // 1 -> верх
  // 2 -> право
  // 3 -> низ
  // 4 -> лево
  return gameContext.last_input;
}

function step() {
  console.log("step");
  do_step();
  gameContext.last_input = 0;
  if (!gameContext.active) {
    stopGame();
    deathScreen();
  }
  
  for (part of gameContext.snake) {
    console.log("snake part: ", part.x, part.y);
    part.update_graphics();
    part.head.visible = false;
  }
  gameContext.snake[0].head.visible = true;
  for (item of gameContext.food) {
    console.log("food item: ", item.x, item.y);
    item.update_graphics();
  }
}

function do_step() {
  // 1. высчитать новое положение головы
  // 2. проверить на конец игры
  // 3. проверить на получение очков
  // 4. двинуть змею

  var input = getInput();

  let direction_x = gameContext.snake[0].x - gameContext.snake[1].x;
  let direction_y = gameContext.snake[0].y - gameContext.snake[1].y;

  //food_snake_collision(food_item, snake);

  if((input === 1 || input === 3) && direction_y === 0) {
    direction_x = 0;
    direction_y = input === 1 ? -1 : 1;
  } else if((input === 2 || input === 4) && direction_x === 0) {
    direction_y = 0;
    direction_x = input === 4 ? -1 : 1;
  }

  var new_x = gameContext.snake[0].x + direction_x;
  var new_y = gameContext.snake[0].y + direction_y;

  // gameOver

  var gameOver = false;

  for(body of gameContext.snake) {
    if(body.x === new_x && body.y === new_y) {
      gameOver = true;
      console.log("Game over, Ouroboros", body.x, body.y, new_y, new_x);
      break;
    }
  }

  if(!gameOver) {
    if(gameContext.grid_height <= new_y || gameContext.grid_width <= new_x || new_x < 0 || new_y < 0) {
      gameOver = true;
      console.log("Game over, wall", gameContext.grid_height, gameContext.grid_width, new_y, new_x);
    }
  }

  // food?

  var eat = false;

  for(item of gameContext.food){
    if(new_x === item.x && new_y === item.y) {
      eat = true;
      eatFood(item);
      break;
    }
  }
  //move
  
  if(!gameOver) {
    let new_part = new SnakePart(new_x, new_y);
    gameContext.snake.unshift(new_part);
    gameContext.app.stage.addChild(new_part.graphics);
    let snake = gameContext.snake;
    if(!eat) {
      removeSnakePart(gameContext.snake[snake.length - 1])
    }
  }
  gameContext.active = !gameOver;
}

function initKeyListener() {
  document.addEventListener('keydown', function(event) {
    if (!gameContext.active) {
      return;
    }
    if (event.key === "ArrowUp") {
      gameContext.last_input = 1;
    } else if (event.key === "ArrowRight") {
      gameContext.last_input = 2;
    } else if (event.key === "ArrowDown") {
      gameContext.last_input = 3;
    } else if (event.key === "ArrowLeft") {
      gameContext.last_input = 4;
    }
  });
}

function main() {
    // alert("some text");
    const canvas = document.querySelector("#glCanvas");
    var width = window.innerWidth * 0.5;
    var height = window.innerHeight - 20;
    var app = init(canvas, width, height, true)
    initKeyListener();
    let grid_size = 25
    gameContext = {
      score: 0,
      app: app,
      width: width,
      height: height,
      grid_width: grid_size,
      grid_height: grid_size,
      active: false,
      base_step_delay_ms: 303,
      current_step_delay_ms: 303,
      min_step_delay_ms: 100,
      hard_mode: false,
      snake: [],
      food: [],
      last_input: 0,
      square_size: Math.min(width, height) / grid_size
    }  
}
  
window.onload = main;

