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