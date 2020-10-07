function distance(x1, y1, x2, y2){
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
}

function objDistance(ob1, ob2){
    return distance(ob1.x, ob1.y, ob2.x, ob2.y)
}

function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randomIntIn(min, max) {
    return min + randomInt(max - min)
}

function randomSample(arr) {
    return arr[randomIntIn(0, arr.length)]
}