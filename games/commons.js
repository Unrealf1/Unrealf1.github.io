function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateElement(name, value) {
    let elem = document.getElementById(name)
    elem.innerText = '' + value
}

function distance(x1, y1, x2, y2){
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
}

function objDistance(ob1, ob2){
    return distance(ob1.x, ob1.y, ob2.x, ob2.y)
}

// max not included
function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randomIntIn(min, max) {
    return min + randomInt(max - min)
}

function randomSample(arr) {
    return arr[randomIntIn(0, arr.length)]
}

function isMobile() {
    let res = ('ontouchstart' in document.documentElement) &&
        (screen.width < 500 ||
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/(iPhone|iPod|iPad)/i) ||
        navigator.userAgent.match(/BlackBerry/i))
    if (!res) {
        return false
    } else {
        return true
    }
}

async function post_data(data, url) {
    let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
           "Content-type": "application/json; charset=UTF-8"
        }
    })
    
    return response
}

function openModal(modal_id, display_style="flex") {
    modal = document.getElementById(modal_id)
    modal.style.display = display_style
}

function closeModal(modal_id) {
    modal = document.getElementById(modal_id)
    modal.style.display = "none"
}

function setupModal(modal_id, modal_content_id) {
  let modal = document.getElementById(modal_id)
  let modal_content = document.getElementById(modal_content_id)
  
  function modalClick() {
    closeModal(modal_id)
  }
  
  function modalContentClick(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }

  modal.addEventListener('click', modalClick);
  modal_content.addEventListener('click', modalContentClick);
}

function dictGetOrSet(dict, key, value) {
    key in dict || (dict[key] = value);
    return dict[key];
}

function clearChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}
