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
        root_entry: new Entry("sum", false, []),
        prob_cache: {},
        complex_prob_sum_cache: {},
        complex_prob_min_cache: {},
        complex_prob_max_cache: {},
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
    state.root_entry.children.push(new Entry("min", true, {20:2}, state.root_entry));
    state.root_entry.children.push(new Entry("max", true, {2:10}, state.root_entry));
}

const EntryType = {
    "sum":{
        "neutral": 0,
        "op": (rolls) => {return rolls.reduce((a, b) => a + b, 0)}
    }, "min":{
        "neutral": 10000,
        "op": (rolls) => {return rolls.reduce((a, b) => Math.min(a, b))}
    }, "max":{
        "neutral": -10000,
        "op": (rolls) => {return rolls.reduce((a, b) => Math.max(a, b))}
    }};
Object.freeze(EntryType)

function getGroups(dice = state.dice) {
    let groups = []
    for (var dice_value in dice) {
        let dice_number = dice[dice_value];
        if (dice_number === 0) {
            continue;
        }
        groups.push([dice_value, dice_number])       
    }
    return groups
}

class Entry {
    constructor(type="sum", terminal=true, content=[], parent=null) {
        this.parent = parent;
        this.type = type;
        this.terminal = terminal;
        this.lastRoll = null;
        if (terminal) {
            // dict dice_value:number
            this.dice = content;
        } else {
            // array of children entries
            this.children = content;
        }
    }

    roll() {
        let op = EntryType[this.type].op;
        let rolls = [];
        if (this.terminal) {
            let groups = getGroups(this.dice);
            for (var g of groups) {
                let dice_number, dice_value;
                [dice_value, dice_number] = g;
                dice_value = parseInt(dice_value);
                for (var i = 0; i < dice_number; i++) {
                    rolls.push(randomIntIn(1, dice_value + 1));
                }
            }
        } else {
            rolls = this.children.map((child) => {return child.roll()});
        }
        this.lastRoll = op(rolls);
        return this.lastRoll;
    }

    getText() {
        if (!this.terminal) {
            //console.log("'getShortString' called from non terminal entry!");
            if (this.lastRoll !== null) {
                console.log("lastRoll is ", this.lastRoll);
                return this.lastRoll;
            }
            return " ";
        }
        let dice = this.dice;
        let short_string = " "
        for (var dice_value in dice) {
            let dice_number = dice[dice_value];
            if (dice_number === 0) {
                continue;
            }
            short_string += `${dice_number}d${dice_value} + `
        }
        short_string = short_string.slice(0, -3)
        return short_string;
    }

    _prepareNonTerminal() {
        let child_probs = this.children.map((child) => {
            console.log("asking child for probs...");
            return child.getProbs();
        });
        let child_grouped = child_probs.map((child) => {
            return getGroups(child);
        });
        this.child_probs = child_grouped;
        if (this.type === "max" || this.type === "min") {
            this.min_value = 10000;
            this.max_value = -10000;
            for (var child_group of child_probs) {
                for (var item of child_group) {
                    let val = parseInt(item[0]);
                    if (val < this.min_value) {
                        this.min_value = val;
                    }
                    if (val > this.max_value) {
                        this.max_value = val;
                    }
                }
            }
        }
        if (this.type === "sum") {
            this.min_value = 0;
            this.max_value = 0;
            for (var child_group of child_probs) {
                let all_vals = Object.keys(child_group).map((val) => {return parseInt(val)});
                console.log("all vals: ", all_vals);
                let min = all_vals.reduce((a, b) => Math.min(a, b));
                let max = all_vals.reduce((a, b) => Math.max(a, b));
                this.min_value += min;
                this.max_value += max;
            }
        }
    }

    _prepare() {
        if (!this.terminal) {
            this._prepareNonTerminal();
            return;
        }


        if (this.type === "sum") {
            let total_dice_num = 0;
            let total_dice_val = 0;
            for (var dice_value in this.dice) {
                let dice_number = this.dice[dice_value];
                total_dice_num += dice_number;
                total_dice_val += dice_number * dice_value;        
            }
            this.groups = getGroups(this.dice)
            this.min_value = total_dice_num;
            this.max_value = total_dice_val;
        } else if(this.type === "min" || this.type === "max") {
            this.min_value = 1;
            this.max_value = 1;
            for (var dice_value in this.dice) {
                console.log("value:", dice_value);
                if (dice_value > this.max_value) {
                    this.max_value = dice_value;
                }       
            }
            this.groups = getGroups(this.dice)
        }
        
    }

    getProbs() {
        let fun = null;
        let arg = null;
        
        if (this.terminal) {
            if (!this.dice || this.dice.length === 0) {
                return {1:0};
            }
            this._prepare();
            fun = calcComplexProb;
            arg = this.groups
        } else {
            if (!this.children || this.children.length === 0) {
                return {1:0};
            }
            
            this._prepare();
            
            console.log("child probs:\n", this.child_probs);
            fun = calcEntriesProb;
            arg = this.child_probs;
        }
        console.log("min:", this.min_value, "max:", this.max_value);
        let result = {};
        for (var v = this.min_value; v<= this.max_value; v++) {
            result[v] = fun([...arg], v, this.type);
        }
        console.log("My probs:\n", result);
        return result;
    }

    getExpectancy() {
        let probs = this.getProbs();
        let exp = 0;
        for (var val in probs) {
            let p = probs[val];
            exp += p*val; 
        }
        return exp;
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

function doRoll() {
    return state.root_entry.roll();
}

function processProbs() {
    state.probs = state.root_entry.getProbs();

    if (!sanityCheck(Object.values(state.probs))) {
        setAlert("There was a problem in probabilities calculation. They might be inaccurate");
    }
}

function calculateEverything() {
    console.log("calculating...")
}
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
        root_entry: new Entry("sum", false, []),
        prob_cache: {},
        complex_prob_sum_cache: {},
        complex_prob_min_cache: {},
        complex_prob_max_cache: {},
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
    state.root_entry.children.push(new Entry("min", true, {20:2}, state.root_entry));
    state.root_entry.children.push(new Entry("max", true, {2:10}, state.root_entry));
}

const EntryType = {
    "sum":{
        "neutral": 0,
        "op": (rolls) => {return rolls.reduce((a, b) => a + b, 0)}
    }, "min":{
        "neutral": 10000,
        "op": (rolls) => {return rolls.reduce((a, b) => Math.min(a, b))}
    }, "max":{
        "neutral": -10000,
        "op": (rolls) => {return rolls.reduce((a, b) => Math.max(a, b))}
    }};
Object.freeze(EntryType)

function getGroups(dice = state.dice) {
    let groups = []
    for (var dice_value in dice) {
        let dice_number = dice[dice_value];
        if (dice_number === 0) {
            continue;
        }
        groups.push([dice_value, dice_number])       
    }
    return groups
}

class Entry {
    constructor(type="sum", terminal=true, content=[], parent=null) {
        this.parent = parent;
        this.type = type;
        this.terminal = terminal;
        this.lastRoll = null;
        if (terminal) {
            // dict dice_value:number
            this.dice = content;
        } else {
            // array of children entries
            this.children = content;
        }
    }

    roll() {
        let op = EntryType[this.type].op;
        let rolls = [];
        if (this.terminal) {
            let groups = getGroups(this.dice);
            for (var g of groups) {
                let dice_number, dice_value;
                [dice_value, dice_number] = g;
                dice_value = parseInt(dice_value);
                for (var i = 0; i < dice_number; i++) {
                    rolls.push(randomIntIn(1, dice_value + 1));
                }
            }
        } else {
            rolls = this.children.map((child) => {return child.roll()});
        }
        this.lastRoll = op(rolls);
        return this.lastRoll;
    }

    getText() {
        if (!this.terminal) {
            //console.log("'getShortString' called from non terminal entry!");
            if (this.lastRoll !== null) {
                console.log("lastRoll is ", this.lastRoll);
                return this.lastRoll;
            }
            return " ";
        }
        let dice = this.dice;
        let short_string = " "
        for (var dice_value in dice) {
            let dice_number = dice[dice_value];
            if (dice_number === 0) {
                continue;
            }
            short_string += `${dice_number}d${dice_value} + `
        }
        short_string = short_string.slice(0, -3)
        return short_string;
    }

    _prepareNonTerminal() {
        let child_probs = this.children.map((child) => {
            console.log("asking child for probs...");
            return child.getProbs();
        });
        let child_grouped = child_probs.map((child) => {
            return getGroups(child);
        });
        this.child_probs = child_grouped;
        if (this.type === "max" || this.type === "min") {
            this.min_value = 10000;
            this.max_value = -10000;
            for (var child_group of child_probs) {
                for (var item of child_group) {
                    let val = parseInt(item[0]);
                    if (val < this.min_value) {
                        this.min_value = val;
                    }
                    if (val > this.max_value) {
                        this.max_value = val;
                    }
                }
            }
        }
        if (this.type === "sum") {
            this.min_value = 0;
            this.max_value = 0;
            for (var child_group of child_probs) {
                let all_vals = Object.keys(child_group).map((val) => {return parseInt(val)});
                console.log("all vals: ", all_vals);
                let min = all_vals.reduce((a, b) => Math.min(a, b));
                let max = all_vals.reduce((a, b) => Math.max(a, b));
                this.min_value += min;
                this.max_value += max;
            }
        }
    }

    _prepare() {
        if (!this.terminal) {
            this._prepareNonTerminal();
            return;
        }


        if (this.type === "sum") {
            let total_dice_num = 0;
            let total_dice_val = 0;
            for (var dice_value in this.dice) {
                let dice_number = this.dice[dice_value];
                total_dice_num += dice_number;
                total_dice_val += dice_number * dice_value;        
            }
            this.groups = getGroups(this.dice)
            this.min_value = total_dice_num;
            this.max_value = total_dice_val;
        } else if(this.type === "min" || this.type === "max") {
            this.min_value = 1;
            this.max_value = 1;
            for (var dice_value in this.dice) {
                console.log("value:", dice_value);
                if (dice_value > this.max_value) {
                    this.max_value = dice_value;
                }       
            }
            this.groups = getGroups(this.dice)
        }
        
    }

    getProbs() {
        let fun = null;
        let arg = null;
        
        if (this.terminal) {
            if (!this.dice || this.dice.length === 0) {
                return {1:0};
            }
            this._prepare();
            fun = calcComplexProb;
            arg = this.groups
        } else {
            if (!this.children || this.children.length === 0) {
                return {1:0};
            }
            
            this._prepare();
            
            console.log("child probs:\n", this.child_probs);
            fun = calcEntriesProb;
            arg = this.child_probs;
        }
        console.log("min:", this.min_value, "max:", this.max_value);
        let result = {};
        for (var v = this.min_value; v<= this.max_value; v++) {
            result[v] = fun([...arg], v, this.type);
        }
        console.log("My probs:\n", result);
        return result;
    }

    getExpectancy() {
        let probs = this.getProbs();
        let exp = 0;
        for (var val in probs) {
            let p = probs[val];
            exp += p*val; 
        }
        return exp;
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

function doRoll() {
    return state.root_entry.roll();
}

function processProbs() {
    state.probs = state.root_entry.getProbs();

    if (!sanityCheck(Object.values(state.probs))) {
        setAlert("There was a problem in probabilities calculation. They might be inaccurate");
    }
}

function calculateEverything() {
    console.log("calculating...")
}
