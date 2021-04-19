function updateExpectancy() {
    let element = document.getElementById("expectancyOut")
    element.value = Number((getState().root_entry.getExpectancy()).toFixed(2));
}

function diceStringFromEntry(entry) {
    let prefix = "";
    let suffix = "";
    let delim = "";
    let slice_num = 0;
    switch (entry.type) {
        case "sum":
            slice_num = 3;
            delim = " + ";
            break;
        case "min":
            slice_num = 2;
            prefix = "min(";
            suffix = ")";
            delim = ", ";
            break;
        case "max":
            slice_num = 2;
            prefix = "max(";
            suffix = ")";
            delim = ", ";
            break;
        default:
            console.log("unexpected type:", entry.type);
            break;
    }

    let string = `${prefix}`;

    if (entry.terminal) {
        for (var dice_value in entry.dice) {
            let dice_number = entry.dice[dice_value];
            if (dice_number === 0) {
                continue;
            }
            string += `${dice_number}d${dice_value}${delim}`
        }
    } else {
        for (var child of entry.children) {
            string += `(${diceStringFromEntry(child)})${delim}`
        }
    }
    string = string.slice(0, -slice_num);
    string += suffix;
    console.log(entry);
    console.log(string);
    return string;
}

function updateContracted() {
    let short_string = diceStringFromEntry(getState().root_entry);

    //short_string = short_string.slice(0, -3)
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
    //div.appendChild(removeButton)
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
    updateExpectancy();
    updateContracted();
    showEntries();
}

function resetEverything() {
    resetState();
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
    document.getElementById("probOut").value = Number((p).toFixed(2));
}

function getProb() {
    let value = extractProbParams()
    if (value === null) {
        return;
    }
    processProbs();
    let prob = 0;
    if (value in state.probs) {
        prob = state.probs[value];
    }

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

function showRoll() {
    let roll = doRoll();
    showEntries();
    document.getElementById("roll").textContent = roll;
}

function createAddButtonForEntry(entry, div) {
    let addButton = document.createElement("button");
    if (entry.terminal) {
        addButton.textContent = "Add dice";
        addButton.onclick = () => {
            let panel = document.createElement("div");

            let num_div = document.createElement("div");

            let num_dice_lab = document.createElement("label");
            num_dice_lab.textContent = "Number of dice";

            let num_dice_inp = document.createElement("input");
            num_dice_inp.type = "number";
            num_dice_inp.min = 0;

            num_div.appendChild(num_dice_lab);
            num_div.appendChild(num_dice_inp);

            let max_div = document.createElement("div");

            let max_dice_lab = document.createElement("label");
            max_dice_lab.textContent = "Maximum dice value";

            let max_dice_inp = document.createElement("input");
            max_dice_inp.type = "number";
            max_dice_inp.min = 1;

            max_div.appendChild(max_dice_lab);
            max_div.appendChild(max_dice_inp);

            let buttons_div = document.createElement("div");

            let actualAdd = document.createElement("button");
            actualAdd.textContent = "OK";
            actualAdd.onclick = () => {
                addButton.disabled = true;
                let val = parseInt(max_dice_inp.value);
                let num = parseInt(num_dice_inp.value);

                if (isNaN(num) || isNaN(val)) {
                    setAlert("Incorrect input")
                    return;
                }

                if (num === 0) {
                    return;
                }

                let old_number = dictGetOrSet(entry.dice, val, 0);
                entry.dice[val] = old_number + num;
                let dice_html = createDiceChild(1, 6);
                div.appendChild(dice_html);
                updateEverything();
            };

            let abortAdd = document.createElement("button");
            abortAdd.textContent = "X";
            abortAdd.onclick = showEntries;

            buttons_div.appendChild(actualAdd);
            buttons_div.appendChild(abortAdd);

            panel.appendChild(num_div);
            panel.appendChild(max_div);
            panel.appendChild(buttons_div);

            div.appendChild(panel);
        };
    } else {
        addButton.textContent = "Add subentry";
        addButton.onclick = () => {
            let new_entry = new Entry("sum", true, {}, entry);
            entry.children.push(new_entry);
            updateEverything();
        };
    }
    return addButton;
}

function createEntry(entry) {
    let div = document.createElement("div");
    div.classList.add("diceEntry")

    let text = document.createElement("span")
    text.textContent = entry.getText();

    div.appendChild(text);

    let removeButton = document.createElement("button");
    removeButton.textContent = "X";
    removeButton.onclick = () => {
        let parent = entry.parent;
        if (parent === null) {
            console.log("cannot remove root entry");
            return;
        }
        let index = parent.children.indexOf(entry);
        console.log("index for deletion is ", index);
        parent.children.splice(index, 1);
        showEntries();
    }

    div.appendChild(removeButton);

    let addButton = createAddButtonForEntry(entry, div);
    div.appendChild(addButton);

    let mode_selector = document.createElement("select");
    for (var type in EntryType) {
        let opt = document.createElement("option");
        if (type === entry.type) {
            opt.defaultSelected = "selected";
        }
        opt.value = type;
        opt.textContent = type;
        mode_selector.appendChild(opt);
    }
    mode_selector.oninput = () => {
        entry.type = mode_selector.value;
    };
    div.appendChild(mode_selector);

    let terminality_block = document.createElement("span");
    terminality_block.textContent = "terminal";
    let is_terminal = document.createElement("input");
    is_terminal.type = "checkbox";
    is_terminal.checked = entry.terminal;
    is_terminal.oninput = () => {
        entry.children = [];
        entry.dice = {};
        entry.terminal = !entry.terminal;
        showEntries();
    };
    terminality_block.appendChild(is_terminal);
    div.appendChild(terminality_block);

    return div;
}

function showEntries() {
    let root = getState().root_entry;
    let root_html = document.getElementById("entries");
    clearChildren(root_html);

    let inner = (current, parent_html) => {
        let current_html = createEntry(current);
        parent_html.appendChild(current_html);
        if (current.terminal) {
            let groups = getGroups(current.dice);
            for (var pr of groups) {
                current_html.appendChild(createDiceChild(pr[1], pr[0]));
            }
        } else {
            for (var child of current.children) {
                inner(child, current_html);
            }
        }
    }

    inner(root, root_html);
}

function main() {
    alert("Note, this is still in development!. Bugs are possible")
    resetState()
    updateEverything()
}

window.onload = main;