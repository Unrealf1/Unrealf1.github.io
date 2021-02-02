async function post_record(name, score, misses, is_mobile) {
    let record = {
        "name": name,
        "score": score,
        "misses": misses,
        "mobile": is_mobile
    }
    let response = await post_data(record)
    
}