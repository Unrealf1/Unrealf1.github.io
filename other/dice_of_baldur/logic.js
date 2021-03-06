state = null

function getState() {
    return state;
}

function resetState(){
    state = {
        expectancy: 0,
        dice: {},
        prob_cache: {}
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
}

function processRemove(num, val) {
    let old_number = dictGetOrSet(state.dice, val, 0)
    state.dice[val] = old_number - num
    processRemExpectancy(num, val)
    
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
