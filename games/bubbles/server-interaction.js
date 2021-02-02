async function post_record(name, score, misses, is_mobile) {
    let record = {
        "name": name,
        "score": score,
        "misses": misses,
        "mobile": is_mobile
    }
    let response = await post_data(record, "http://127.0.0.1:5000/bubbles")
    let text = await response.text()
    console.log("submitted record, response is: ", text)
}