function createCircle(x, y, r, color) {
    let circle = new PIXI.Graphics();
    circle.beginFill(color);
    circle.drawCircle(0, 0, r);
    circle.endFill();
    circle.x = x;
    circle.y = y;
    circle.r = r
    return circle
}

function createRect(x, y, w, h, color) {
  let rect = new PIXI.Graphics();
  rect.beginFill(color);
  rect.drawRect(x, y, w, h);
  rect.endFill();
  rect.x = x;
  rect.y = y;
  rect.w = w
  rect.h = h
  return rect
}

function init(canvas, width, height, interactive=false, backgroundColor=0x000000) {
    canvas.width = width;
    canvas.height = height;
    if(!PIXI.utils.isWebGLSupported())    {
      alert("Your browser ot computer does not support WebGL, content might be displayed poorly :(")
    }
    let app = new PIXI.Application({
      width: width,
      height: height,
      backgroundColor : backgroundColor,
      view: canvas
    });
    app.stage.interactive = interactive;
    app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
    return app
  }