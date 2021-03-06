function updateExpectancy() {
    let element = document.getElementById("expectancyOut")
    element.value = getState().expectancy
}

function updateContracted() {
    let dice = getState().dice;
    let short_string = " "
    console.log(dice)
    for (var dice_value in dice) {
        let dice_number = dice[dice_value];
        if (dice_number === 0) {
            continue;
        }
        short_string += `${dice_number}d${dice_value} + `
    }
    short_string = short_string.slice(0, -3)
    document.getElementById("contractedOut").textContent = short_string
}

function createDiceChild(num, val) {
    let div = document.createElement("div")
    let text = document.createTextNode(`${num}d${val}`)
    let removeButton = document.createElement("button")
    removeButton.textContent = "X"
    removeButton.onclick = () => {
        removeDice(num, val, div)
    }
    div.appendChild(text)
    div.appendChild(removeButton)
    return div
}

function displayAdd(num, val) {
    updateEverything()

    let container = document.getElementById("diceContainer")
    container.appendChild(createDiceChild(num, val))
}

function addDice() {
    let num = parseInt(document.getElementById("diceNumber").value)
    let val = parseInt(document.getElementById("diceValue").value)

    if (num === 0) {
        return;
    }

    let button = document.getElementById("addButton")
    button.disabled = true

    processAdd(num, val)
    displayAdd(num, val)

    button.disabled = false
}

function displayRemove(div) {
    updateEverything()
    let container = document.getElementById("diceContainer")
    container.removeChild(div)
}

function removeDice(num, val, div) {
    processRemove(num, val)
    displayRemove(div)
}

function updateEverything() {
    updateExpectancy()
    updateContracted()
}

function clearDiceChildren() {
    let container = document.getElementById("diceContainer")
    clearChildren(container)
}

function resetEverything() {
    resetState()
    clearDiceChildren()
    updateEverything()
}

function extractProbParams() {
    let state = getState()
    var positive = 0;
    var max_dice_value = null;
    var dice_number = null;
    for (dice_value in state.dice) {
        let current_dice_num = state.dice[dice_value];
        if (current_dice_num > 0) {
            positive++;
            max_dice_value = dice_value;
            dice_number = current_dice_num;
            if (positive > 1){
                alert("For now this is supported only for uniform dice")
                return null;
            }
        }
    }

    if (positive === 0) {
        alert("Can't calculate probability for empty dice list")
        return null;
    }

    let required = parseInt(document.getElementById("requirement_for_prob").value);
    return [required, dice_number, max_dice_value]
}

function updateProb(p) {
    document.getElementById("probOut").value = p;
}

function getProb() {
    let extracted = extractProbParams()
    if (extracted === null) {
        return;
    }
    let value, number, max_value;
    [value, number, max_value] = extracted;
    let prob = calcProb(value, number, max_value);
    updateProb(prob)
}

function getProbOrLow() {
    let extracted = extractProbParams()
    if (extracted === null) {
        return;
    }
    let value, number, max_value;
    [value, number, max_value] = extracted;
    let prob = 0;
    for (var i = 0; i <= value; i++) {
        prob += calcProb(i, number, max_value);
    }

    updateProb(prob)
}

function getProbOrHigh() {
    let extracted = extractProbParams()
    if (extracted === null) {
        return;
    }
    let value, number, max_value;
    [value, number, max_value] = extracted;
    let prob = 0;
    for (var i = number * max_value; i >= value; i--) {
        prob += calcProb(i, number, max_value);
    }

    updateProb(prob)
}

function main() {
    resetState()
}

window.onload = main;
