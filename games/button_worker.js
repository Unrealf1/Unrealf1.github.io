onmessage = function(e) {
    console.log('Worker: Message received from main script');
    const callback = e.data
    callback()
    postMessage("worker done")
}