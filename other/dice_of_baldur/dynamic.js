function updateExpectancy() {
    let element = document.getElementById("expectancyOut")
    element.value = getState().expectancy
}

function updateContracted() {
    let dice = getState().dice;
    let short_string = " "
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
    let text = document.createElement("span")
    text.classList.add('diceText')
    text.textContent = `${num}d${val}`
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
    if (isNaN(num) || isNaN(val)) {
        setAlert("Incorrect input")
        return;
    }

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
    resetState();
    clearDiceChildren();
    updateEverything();
    setAlert("Cleared everything");
}

function extractProbParams() {
    let required = parseInt(document.getElementById("requirement_for_prob").value);
    if (isNaN(required)) {
        setAlert("Incorrect input")
    }

    return required
}

function updateProb(p) {
    document.getElementById("probOut").value = p;
}

function getProb() {
    let value = extractProbParams()
    if (value === null) {
        return;
    }
    let prob = calcComplexProb(getGroups(), value);
    updateProb(prob);
}

function getProbOrLow() {
    let value = extractProbParams()
    if (value === null) {
        return;
    }
    processProbs()
    let prob = 0;
    let probs = state.probs
    for (v in probs) {
        if (v <= value) {
            prob += probs[v]
        }
    } 

    updateProb(prob)
}

function getProbOrHigh() {
    let value = extractProbParams()
    if (value === null) {
        return;
    }
    processProbs()
    let prob = 0;
    let probs = state.probs
    for (v in probs) {
        if (v >= value) {
            prob += probs[v]
        }
    } 

    updateProb(prob)
}

function valuesToColours(vs) {
    let max_v = Math.max(...vs)
    let min_v = Math.min(...vs)

    let v_c = (v) => {
        return `rgba(${255 * (v - min_v) / (max_v - min_v)}, 64, 64, 0.2)`;
    }
    return vs.map(v_c)
} 

function valuesToBColours(vs) {
    let max_v = Math.max(...vs)
    let min_v = Math.min(...vs)

    let v_c = (v) => {
        return `rgba(${255 * (v - min_v) / (max_v - min_v)}, 64, 64, 1)`;
    }
    return vs.map(v_c)
} 

function printComplex() {
    processProbs();
    let state = getState()
    console.log(state.probs)
    let labels, values;
    [labels, values] = dict2Arrays(state.probs)

    state.activeChart.data.labels = labels;
    state.activeChart.data.datasets = [{
        label: 'Probability',
        data: values,
        backgroundColor: valuesToColours(values),
        borderColor: valuesToBColours(values),
        borderWidth: 1
    }];
    state.activeChart.update();
}

function setAlert(text) {
    let alert = document.getElementById("text_alert");
    alert.textContent = text;
    alert.classList.add('active_alert');
    alert.style.visibility = 'visible';
    setTimeout(() => {
        alert.classList.remove('active_alert');
        alert.style.visibility = 'hidden';
    },
    
    5000)
}

function main() {
    // alert("Note, this is still in development. Bugs are possible")
    resetState()
}

window.onload = main;
