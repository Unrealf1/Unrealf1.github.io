class Field {
    _create_border(size) {
      let line = new PIXI.Graphics();
      line.lineStyle(4, 0x9b59b6, 1);
      line.drawRect(0, 0, size, size);
      return line
    }
  
    constructor(x, y, size, color) {
      this.graphics = new PIXI.Container()
      this.graphics.x = x
      this.graphics.y = y
      this.rect = createRect(0, 0, size, size, color)
      this.graphics.addChild(this.rect)
      this.graphics.addChild(this._create_border(size))
    }
}

class GUnit {
    calc_position(position) {
      let context = this.context
      let x = 0
      let y = 0
      let on_side = (position < 5 || position > 12)
      if (on_side) {
        let player_offset = this.first_player ? 
          context.field_x_offset + context.field_size / 2 :
          context.field_x_offset + context.field_size * 2.5
        player_offset = Math.floor(player_offset)
        x = player_offset
      } else {
        x = context.field_x_offset + context.field_size*1.5
      }
      if (position < 5) {
        y = context.field_y_offset + context.field_size * (0.5 + (4 - position))
      } else if (position > 14) {
        y = 0
        this.graphics.alpha = 0.001
        this.circle.interactive = false
      } else if (position > 12) {
        y = context.field_y_offset + context.field_size * (0.5 + (20 - position))
      } else {
        y = context.field_y_offset + context.field_size * (0.5 + (position - 5))
      }
      return [x, y]
    }
  
    updatePosition(position) {
        let [x, y] = this.calc_position(position)
        this.graphics.x = x
        this.graphics.y = y
    }
  
    constructor(first_player, num, context) {
      this.context = context
      this.first_player = first_player
      this.num = num
      this.graphics = new PIXI.Container()
      this.updatePosition(0)
      this.circle = createCircle(0, 0, context.field_size/3, first_player ? 0xaaaaaa : 0x8888ff)
      this.circle.interactive = true
      this.graphics.addChild(this.circle)
    }
}

function initGUnits(context) {
    let gunits1 = Array.from({length: 8}, (_, i) => new GUnit(true, i, context))
    let gunits2 = Array.from({length: 8}, (_, i) => new GUnit(false, i, context))
    context.gunits1 = gunits1
    context.gunits2 = gunits2
    let initarray = (arr)=> {
        arr.forEach((gunit) => {
            context.app.stage.addChild(gunit.graphics)
            gunit.circle.on('pointerdown', () => {context.onGUnitClick(gunit)});
        })
    }
    initarray(gunits1)
    initarray(gunits2)
}
  
function initFields(context) {
    let fields = []
    let size = Math.floor(Math.min(context.width, context.height) / 10)
    let x_offset = Math.floor(context.width / 2 - size*1.5)
    context.field_size = size
    context.field_x_offset = x_offset
    context.field_y_offset = 20
    for (let i = 0; i < 8; i++) {
        let y = i * size + context.field_y_offset
        for (let j = 0; j < 3; j++) {
        if (i >= 4 && i <= 5 && j !== 1) {
            continue
        }
        let x = j * size + x_offset
        let color = (
            i === 3 && j ===1 || 
            (i === 0 && j !== 1) || 
            (i === 6 && j !== 1)) ? 0xff0000 :0xff00ff
        let field = new Field(x, y, size, color)
        context.app.stage.addChild(field.graphics)
        fields.push(field)
        }
        
    }
}
  
function initGraphics(context) {
    initFields(context)
    initGUnits(context)
}
  
function updateGraphics(state, context) {
    let update_units = (units, gunits) => {
        units.forEach((unit, index) => {
            gunits[index].updatePosition(unit.position)
        })
    }
    update_units(state.player1.units, context.gunits1)
    update_units(state.player2.units, context.gunits2)
}
