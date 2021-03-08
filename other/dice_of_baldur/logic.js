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

function calc_num_sums(value, number, max_value) {
    // value - integer to get
    // number - number of dice
    // max_value - max value on _all_ of the dice.
    // result: number of ordered ways to get value from given dice

    if (value < number || value > max_value * number) {
        return 0;
    }
    let cached = dictGetOrSet(state.prob_cache, [value, number, max_value], null)
    if (cached !== null) {
        return cached;
    }

    if (number === 1) {
        return 1;
    }

    if (number === 2) {
        return (value <= max_value ? value - 1 : 2 * max_value - value + 1)
    }

    let res = 0;
    for (var i = 1; i <= max_value; i++) {
        res += calc_num_sums(value - i, number - 1, max_value)
    }
    state.prob_cache[[value, number, max_value]] = res;
    return res;
}

function calcProb(value, number, max_value) {
    return calc_num_sums(value, number, max_value) / Math.pow(max_value, number)
}

// this could be optimized for tail rec
function calcComplexProb(gs, v) {
    if (gs.length === 0) {
        return 0;
    }
    
    let cached = dictGetOrSet(state.complex_prob_cache, [gs, v], null)
    if (cached !== null) {
        return cached;
    }
    let res;

    let val, num;
    let gs_copy = [...gs];
    [val, num] = gs.pop();

    if (gs.length === 0) {
        res = calcProb(v, num, val);
    } else {
        let prob = 0;
        for (var i = num; i <= num*val; i++) {
            prob += calcComplexProb([...gs], v - i) * calcProb(i, num, val) 
        }
        res = prob;
    }

    state.complex_prob_cache[[gs_copy, v]] = res
    return res
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

function sanityCheck(probs) {
    return Math.abs(probs.reduce((a, b) => a + b, 0) - 1) < 0.01;
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
