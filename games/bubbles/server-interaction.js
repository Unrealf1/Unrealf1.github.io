async function post_record(name, score, misses, is_mobile, gameLog) {
    let record = {
        "name": name,
        "score": score,
        "misses": misses,
        "mobile": is_mobile,
        "log": gameLog
    }
    let response = await post_data(record, "https://organic-dryad-417919.lm.r.appspot.com/bubbles")
    let text = await response.text()
    console.log("submitted record, response is: ", text)
}

