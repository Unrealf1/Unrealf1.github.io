function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateElement(name, value) {
    let elem = document.getElementById(name)
    elem.innerText = '' + value
}

function distance(x1, y1, x2, y2){
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
}

function objDistance(ob1, ob2){
    return distance(ob1.x, ob1.y, ob2.x, ob2.y)
}

// max not included
function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randomIntIn(min, max) {
    return min + randomInt(max - min)
}

function randomSample(arr) {
    return arr[randomIntIn(0, arr.length)]
}

function isMobile() {
    return ('ontouchstart' in document.documentElement) &&
        (screen.width < 500 ||
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/(iPhone|iPod|iPad)/i) ||
        navigator.userAgent.match(/BlackBerry/i))
}
