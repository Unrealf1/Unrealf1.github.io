function distance(x1, y1, x2, y2){
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
}

function objDistance(ob1, ob2){
    return distance(ob1.x, ob1.y, ob2.x, ob2.y)
}