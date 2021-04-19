function prob_sum(value, childProbs) {
    let res = 0.0;
    if (childProbs.length === 0) {
        if (value === 0) {
            return 1.0;
        }
        return 0.0;
    }

    let child = childProbs.pop();

    for (pr of child) {
        let val, prob;
        [val, prob] = pr;
        let desired = value - val; 
        res += prob * prob_sum(desired, [...childProbs]);
    }

    return res;
}

// probability of getting at least one strictly lesser outcome than 'value'
function prob_less(value, childProbs) {
    let res = 0.0;

    if (childProbs.length === 0) {
        return 0.0;
    }

    let child = childProbs.pop();

    for (pr of child) {
        let val, prob;
        [val, prob] = pr;
        if (val < value) {
            res += prob;
        } else {
            res += prob * prob_less(value, [...childProbs]);
        }
    }

    return res;
}

function prob_min(value, childProbs) {
    let res = 0.0;

    if (childProbs.length === 0) {
        if (value === 0) {
            return 1.0;
        }
        return 0.0;
    }

    let child = childProbs.pop();

    for (pr of child) {
        let val, prob;
        [val, prob] = pr;
        if (val < value) {
            continue;
        }
        if (val > value) {
            res += prob_min(value, [...childProbs]) * prob;
        } else if (val === value) {
            res += (1.0 - prob_less(value, childProbs)) * prob;
        }
    }

    return res;
}

function prob_more(value, childProbs) {
    let res = 0.0;

    if (childProbs.length === 0) {
        return 0.0;
    }

    let child = childProbs.pop();

    for (pr of child) {
        let val, prob;
        [val, prob] = pr;
        if (val > value) {
            res += prob;
        } else {
            res += prob * prob_more(value, [...childProbs]);
        }
    }

    return res;
}

function prob_max(value, childProbs) {
    let res = 0.0;

    if (childProbs.length === 0) {
        if (value === 0) {
            return 1.0;
        }
        return 0.0;
    }

    let child = childProbs.pop();

    for (pr of child) {
        let val, prob;
        [val, prob] = pr;
        if (val > value) {
            continue;
        }
        if (val < value) {
            res += prob_max(value, [...childProbs]) * prob;
        } else if (val === value) {
            res += (1.0 - prob_more(value, childProbs)) * prob;
        }
    }

    return res;
}

// Here 'childProbs' = array of arrays of (val, prob_to_get_this_val) pairs
function calcEntriesProb(childProbs, value, type) {
    if (!(type in EntryType)) {
        console.log("incorrect type", type);
        return -1;
    }
    if (type === "sum") {
        return prob_sum(value, childProbs);
    } else if (type === "max") {
        return prob_max(value, childProbs);
    } else if (type === "min") {
        return prob_min(value, childProbs);
    }
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

function calcSimpleSumProb(value, number, max_value) {
    return calc_num_sums(value, number, max_value) / Math.pow(max_value, number)
}

// this functions are for groups of dice
// could be optimized for tail rec
function calcComplexSumProb(gs, v) {
    if (gs.length === 0) {
        return 0;
    }
    
    let cached = dictGetOrSet(state.complex_prob_sum_cache, [gs, v], null)
    if (cached !== null) {
        return cached;
    }
    let res;

    let val, num;
    let gs_copy = [...gs];
    [val, num] = gs.pop();

    if (gs.length === 0) {
        res = calcSimpleSumProb(v, num, val);
    } else {
        let prob = 0;
        for (var i = num; i <= num*val; i++) {
            prob += calcComplexSumProb([...gs], v - i) * calcSimpleSumProb(i, num, val) 
        }
        res = prob;
    }

    state.complex_prob_sum_cache[[gs_copy, v]] = res
    return res
}

function calcComplexMinProb(gs, v) {
    if (gs.length === 0) {
        return 0;
    }

    let cached = dictGetOrSet(state.complex_prob_min_cache, [gs, v], null)
    if (cached !== null) {
        return cached;
    }
    let res = 0;

    let no_less_all = 1.0;
    for (var group of gs) {
        let max_val, num;
        [max_val, num] = group;
        let less_one = (v - 1) / max_val;
        let no_less_this = Math.pow((1 - less_one), num);
        no_less_all *= no_less_this;
    }

    for (var group of gs) {
        let max_val, num;
        [max_val, num] = group;
        let less_one = (v - 1) / max_val;
        let got_at_least_one = 1 - Math.pow((1 - 1/max_val), num);
        let no_less_fixed = no_less_all / (1 - less_one);
        res += no_less_fixed * got_at_least_one;
    }

    state.complex_prob_min_cache[[gs, v]] = res
    return res
}

function calcComplexMaxProb(gs, v) {
    if (gs.length === 0) {
        return 0;
    }

    let cached = dictGetOrSet(state.complex_prob_max_cache, [gs, v], null)
    if (cached !== null) {
        return cached;
    }
    let res = 0;

    let no_more_all = 1.0;
    for (var group of gs) {
        let max_val, num;
        [max_val, num] = group;
        let more_one = 1 - v / max_val;
        let no_more_this = Math.pow((1 - more_one), num);
        no_more_all *= no_more_this;
    }

    for (var group of gs) {
        let max_val, num;
        [max_val, num] = group;
        let more_one = 1 - v / max_val;
        let got_at_least_one = 1 - Math.pow((1 - 1/max_val), num);
        let no_more_fixed = no_more_all / (1 - more_one);
        res += no_more_fixed * got_at_least_one;
    }

    state.complex_prob_max_cache[[gs, v]] = res
    return res
}

function calcComplexProb(gs, v, type) {
    if (!(type in EntryType)) {
        console.log("calcComplexProb: incorrect type:", type);
        return -1;
    }
    let fun = null;
    //console.log("calc complex prob:\ngs:", gs, "\nv:", v, "\ntype:", type);
    if (type === "sum") {
        fun = calcComplexSumProb;
    } else if (type === "max") {
        fun = calcComplexMaxProb;
    } else if (type === "min") {
        fun = calcComplexMinProb;
    }
    return fun(gs, v);
}

function sanityCheck(probs) {
    console.log("sanity check: ", probs.reduce((a, b) => a + b, 0));
    return Math.abs(probs.reduce((a, b) => a + b, 0) - 1) < 0.01;
}
function prob_sum(value, childProbs) {
    let res = 0.0;
    if (childProbs.length === 0) {
        if (value === 0) {
            return 1.0;
        }
        return 0.0;
    }

    let child = childProbs.pop();

    for (pr of child) {
        let val, prob;
        [val, prob] = pr;
        let desired = value - val; 
        res += prob * prob_sum(desired, [...childProbs]);
    }

    return res;
}

// probability of getting at least one strictly lesser outcome than 'value'
function prob_less(value, childProbs) {
    let res = 0.0;

    if (childProbs.length === 0) {
        return 0.0;
    }

    let child = childProbs.pop();

    for (pr of child) {
        let val, prob;
        [val, prob] = pr;
        if (val < value) {
            res += prob;
        } else {
            res += prob * prob_less(value, [...childProbs]);
        }
    }

    return res;
}

function prob_min(value, childProbs) {
    let res = 0.0;

    if (childProbs.length === 0) {
        if (value === 0) {
            return 1.0;
        }
        return 0.0;
    }

    let child = childProbs.pop();

    for (pr of child) {
        let val, prob;
        [val, prob] = pr;
        if (val < value) {
            continue;
        }
        if (val > value) {
            res += prob_min(value, [...childProbs]) * prob;
        } else if (val === value) {
            res += (1.0 - prob_less(value, childProbs)) * prob;
        }
    }

    return res;
}

function prob_more(value, childProbs) {
    let res = 0.0;

    if (childProbs.length === 0) {
        return 0.0;
    }

    let child = childProbs.pop();

    for (pr of child) {
        let val, prob;
        [val, prob] = pr;
        if (val > value) {
            res += prob;
        } else {
            res += prob * prob_more(value, [...childProbs]);
        }
    }

    return res;
}

function prob_max(value, childProbs) {
    let res = 0.0;

    if (childProbs.length === 0) {
        if (value === 0) {
            return 1.0;
        }
        return 0.0;
    }

    let child = childProbs.pop();

    for (pr of child) {
        let val, prob;
        [val, prob] = pr;
        if (val > value) {
            continue;
        }
        if (val < value) {
            res += prob_max(value, [...childProbs]) * prob;
        } else if (val === value) {
            res += (1.0 - prob_more(value, childProbs)) * prob;
        }
    }

    return res;
}

// Here 'childProbs' = array of arrays of (val, prob_to_get_this_val) pairs
function calcEntriesProb(childProbs, value, type) {
    if (!(type in EntryType)) {
        console.log("incorrect type", type);
        return -1;
    }
    if (type === "sum") {
        return prob_sum(value, childProbs);
    } else if (type === "max") {
        return prob_max(value, childProbs);
    } else if (type === "min") {
        return prob_min(value, childProbs);
    }
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

function calcSimpleSumProb(value, number, max_value) {
    return calc_num_sums(value, number, max_value) / Math.pow(max_value, number)
}

// this functions are for groups of dice
// could be optimized for tail rec
function calcComplexSumProb(gs, v) {
    if (gs.length === 0) {
        return 0;
    }
    
    let cached = dictGetOrSet(state.complex_prob_sum_cache, [gs, v], null)
    if (cached !== null) {
        return cached;
    }
    let res;

    let val, num;
    let gs_copy = [...gs];
    [val, num] = gs.pop();

    if (gs.length === 0) {
        res = calcSimpleSumProb(v, num, val);
    } else {
        let prob = 0;
        for (var i = num; i <= num*val; i++) {
            prob += calcComplexSumProb([...gs], v - i) * calcSimpleSumProb(i, num, val) 
        }
        res = prob;
    }

    state.complex_prob_sum_cache[[gs_copy, v]] = res
    return res
}

function calcComplexMinProb(gs, v) {
    if (gs.length === 0) {
        return 0;
    }

    let cached = dictGetOrSet(state.complex_prob_min_cache, [gs, v], null)
    if (cached !== null) {
        return cached;
    }
    let res = 0;

    let no_less_all = 1.0;
    for (var group of gs) {
        let max_val, num;
        [max_val, num] = group;
        let less_one = (v - 1) / max_val;
        let no_less_this = Math.pow((1 - less_one), num);
        no_less_all *= no_less_this;
    }

    for (var group of gs) {
        let max_val, num;
        [max_val, num] = group;
        let less_one = (v - 1) / max_val;
        let got_at_least_one = 1 - Math.pow((1 - 1/max_val), num);
        let no_less_fixed = no_less_all / (1 - less_one);
        res += no_less_fixed * got_at_least_one;
    }

    state.complex_prob_min_cache[[gs, v]] = res
    return res
}

function calcComplexMaxProb(gs, v) {
    if (gs.length === 0) {
        return 0;
    }

    let cached = dictGetOrSet(state.complex_prob_max_cache, [gs, v], null)
    if (cached !== null) {
        return cached;
    }
    let res = 0;

    let no_more_all = 1.0;
    for (var group of gs) {
        let max_val, num;
        [max_val, num] = group;
        let more_one = 1 - v / max_val;
        let no_more_this = Math.pow((1 - more_one), num);
        no_more_all *= no_more_this;
    }

    for (var group of gs) {
        let max_val, num;
        [max_val, num] = group;
        let more_one = 1 - v / max_val;
        let got_at_least_one = 1 - Math.pow((1 - 1/max_val), num);
        let no_more_fixed = no_more_all / (1 - more_one);
        res += no_more_fixed * got_at_least_one;
    }

    state.complex_prob_max_cache[[gs, v]] = res
    return res
}

function calcComplexProb(gs, v, type) {
    if (!(type in EntryType)) {
        console.log("calcComplexProb: incorrect type:", type);
        return -1;
    }
    let fun = null;
    //console.log("calc complex prob:\ngs:", gs, "\nv:", v, "\ntype:", type);
    if (type === "sum") {
        fun = calcComplexSumProb;
    } else if (type === "max") {
        fun = calcComplexMaxProb;
    } else if (type === "min") {
        fun = calcComplexMinProb;
    }
    return fun(gs, v);
}

function sanityCheck(probs) {
    console.log("sanity check: ", probs.reduce((a, b) => a + b, 0));
    return Math.abs(probs.reduce((a, b) => a + b, 0) - 1) < 0.01;
}
