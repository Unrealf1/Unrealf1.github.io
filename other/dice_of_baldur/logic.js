state = null

function getState() {
    return state;
}

function resetState(){
    let ctx = document.getElementById('chart').getContext('2d');
    if (state !== null) {
        state.activeChart.destroy()
    }

    state = {
        expectancy: 0,
        dice: {},
        prob_cache: {},
        complex_prob_cache: {},
        probs: {},
        activeChart: new Chart(ctx, {
            type: "bar",
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        }),
    }   
}

function processAddExpectancy(num, val) {
    let new_expect = (val + 1) / 2 * num
    let old_expect = state.expectancy
    state.expectancy = old_expect + new_expect
}

function processRemExpectancy(num, val) {
    let new_expect = (val + 1) / 2 * num
    let old_expect = state.expectancy
    state.expectancy = old_expect - new_expect
}

function processAdd(number, value) {
    let old_number = dictGetOrSet(state.dice, value, 0)
    state.dice[value] = old_number + number
    processAddExpectancy(number, value)
    state.probs = {}
}

function processRemove(num, val) {
    let old_number = dictGetOrSet(state.dice, val, 0)
    state.dice[val] = old_number - num
    processRemExpectancy(num, val)
    state.probs = {}
}

function getGroups() {
    let groups = []
    for (var dice_value in state.dice) {
        let dice_number = state.dice[dice_value];
        if (dice_number === 0) {
            continue;
        }
        groups.push([dice_value, dice_number])       
    }
    return groups
}

function doRoll() {
    let result = 0;
    let groups = getGroups()
    for (var g of groups) {
        let dice_number, dice_value;
        [dice_value, dice_number] = g; 
        for (var i = 0; i < dice_number; i++) {
            result += randomIntIn(1, parseInt(dice_value) + 1);
        }      
    }
    return result;
}

function processProbs() {
    let total_dice_num = 0;
    let total_dice_val = 0;
    for (var dice_value in state.dice) {
        let dice_number = state.dice[dice_value];
        total_dice_num += dice_number;
        total_dice_val += dice_number*dice_value;        
    }
    let groups = getGroups()

    for (var val = total_dice_num; val <= total_dice_val; val++) {
        let p = calcComplexProb([...groups], val)
        state.probs[val] = p;
    }

    if (!sanityCheck(Object.values(state.probs))) {
        setAlert("There was a problem in probabilities calculation. They might be inaccurate");
    }
}
