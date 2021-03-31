const EntryType = {"sum":1, "min":2, "max":3};
Object.freeze(EntryType)

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
function calcProb(value, childProbs, type) {
    if (!(type in EntryType)) {
        return -1;
    }

    if (type === EntryType.sum) {
        return prob_sum(value, childProbs);
    } else if (type === EntryType.max) {
        return prob_max(value, childProbs);
    } else if (type === EntryType.min) {
        return prob_min(value, childProbs);
    }
}

class Entry {
    constructor(type, terminal) {
        this.type = type;
        this.terminal = terminal;
        if (terminal) {
            this.dice = [];
        } else {
            this.children = [];
        }
    }

    getProbs() {
        
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

function calcSimpleProb(value, number, max_value) {
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
        res = calcSimpleProb(v, num, val);
    } else {
        let prob = 0;
        for (var i = num; i <= num*val; i++) {
            prob += calcComplexProb([...gs], v - i) * calcSimpleProb(i, num, val) 
        }
        res = prob;
    }

    state.complex_prob_cache[[gs_copy, v]] = res
    return res
}

function sanityCheck(probs) {
    return Math.abs(probs.reduce((a, b) => a + b, 0) - 1) < 0.01;
}
