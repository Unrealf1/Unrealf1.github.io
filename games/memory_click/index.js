let gameContext = null;
//let color_list = [0x9b59b6, 0xffc125, 0xf24b4b, 0x97c4f5, 0xe3e129]
let color_list = [0x97c4f5, 0xf7f4ff, 0x6764ff, 0x77a4f5]

class UpdateInfo {
    constructor(delta, state) {
        this.delta = delta;
        this.state = state;
    }
}


class MagicLink {
    _generatePoint(last, range) {
        let sign = 1;
        if (Math.random() < 0.5) {
            sign = -1;
        }

        let value = 45 * Math.random() / 180 * Math.PI;
        
        let angle = value * sign;
        let s = Math.sin(angle);
        let c = Math.cos(angle);

        let dir = {"x": (this.to.x - last.x) * (c + s), "y": (this.to.y - last.y) * (-s + c)};
        let dir_k = range / Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        dir = {"x": dir.x * dir_k, "y": dir.y * dir_k};
        return {"x": last.x + dir.x, "y": last.y + dir.y};
    }

    _createPoints() {
        let result = [this.from];
        let dx = this.to.x - this.from.x;
        let dy = this.to.y - this.from.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        let step = dist / (this.num_points - 1);

        while (result.length < this.num_points - 1) {
            result.push(this._generatePoint(result[result.length - 1], step));
        }
        result.push(this.to);
        return result;
    }

    _createZap() {
        let points = this._createPoints()
        return createPolygonalСhain(points, 1.0, Array(points.length).fill(randomSample(color_list)));
    }

    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.graphics = new PIXI.Container();
        this.zap = this._createZap();
        this.graphics.addChild(this.zap);
        this.lifetime = 500.0;
        this.num_points = 3;
        this.points_change_constant = 7;
        this.next_points_change = this.points_change_constant;
    }

    update(updateInfo) {
        let state = updateInfo.state;
        this.lifetime -= updateInfo.delta;
        this.next_points_change -= updateInfo.delta;
        if (this.next_points_change < 0) {
            this.next_points_change = this.points_change_constant;
            this.num_points = 7 - this.num_points;
            removeGraphicObject(this, state.app.stage);
            this.graphics = this._createZap();
            state.app.stage.addChild(this.graphics);
        }
    }
}

function clickCallback(event) {
    let app = gameContext.app;
    let x = event.data.global.x;
    let y = event.data.global.y;
    let link = new MagicLink({"x": x, "y": y}, {"x": gameContext.width/2.0, "y": gameContext.height/2.0});
    app.stage.addChild(link.graphics);
    gameContext.links.push(link);
}

function main() {
    const canvas = document.querySelector("#glCanvas");
    var width = window.innerWidth * 0.5;
    var height = window.innerHeight - 20;
    var app = init(canvas, width, height, true);

    gameContext = {
        app: app,
        links: [],
        active: true,
        height: height,
        width: width
    };

    app.stage.on('pointerdown', clickCallback);

    app.ticker.add((delta) => {
      if (!gameContext.active) {
        return
      }
      let info = new UpdateInfo(delta, gameContext);
      gameContext.links.forEach((link) => {link.update(info)});
      gameContext.links.forEach((link) => {
        if (link.lifetime < 0.0){
           removeGraphicObject(link, app.stage);
           gameContext.links.splice(gameContext.links.indexOf(link), 1);
        }
      })
    });
}

window.onload = main;