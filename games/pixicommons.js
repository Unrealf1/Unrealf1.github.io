function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randomIntIn(min, max) {
    return min + randomInt(max - min)
}

function randomSample(arr) {
    return arr[randomIntIn(0, arr.length)]
}

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