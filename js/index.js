async function postComment(text, author) {
    let comment = {
        "text": text,
        "author": author
    }
    await post_data(comment, "https://organic-dryad-417919.lm.r.appspot.com/guestbook")
}

async function comment() {
    let button = document.getElementById("post_button")
    let text = document.getElementById("comment_text").value
    let author = document.getElementById("comment_author").value
    if (text.length === 0) {
        alert("Text shouldn't be empty")
        return
    }
    if (text.length > 160) {
        alert("Text is too long")
        return
    }
    if (author.length > 30) {
        alert("Name is too long")
        return
    }
    button.disabled = true
    try {
      await postComment(text, author)
    } catch (e) {
      console.error(e);
    }

    await sleep(600)
    button.disabled = false
}

function displayComments(comments) {
    let names = document.getElementById("book_names")
    let texts = document.getElementById("book_texts")
    let counts = document.getElementById("book_counts")
    let dates = document.getElementById("book_dates")
    let clear = (list) => {
        while (list.firstChild) {
            list.removeChild(list.lastChild);
        }
    }
    clear(names)
    clear(texts)
    clear(counts)
    clear(dates)

    let addTo = (where, what) => {
        let div = document.createElement("div");
        let text = document.createTextNode(what);
        div.appendChild(text);
        where.appendChild(div)
    }
    comments.forEach((comment) => {
        addTo(names, comment.author)
        addTo(texts, comment.text)
        let maxCommentCount = 100
        let tooMuch = comment.count > maxCommentCount
        let countText = tooMuch ? "(99+)\t" : comment.count > 1 ? " (" + comment.count + ")\t" : "\t"
        addTo(counts, countText)
        addTo(dates, comment.time.slice(0, 19))
    })
}

let comments_loaded = false
function loadComments() {
  if (comments_loaded) {return}
  firebase.database().ref('guestbook')
    // .limitToLast(20)
    .on('value', (snapshot) => {
      comments = []
      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        comments.push(childData)
      });
      comments = comments.reverse()
      displayComments(comments)
    })
    comments_loaded = true
}

function setupModals() {
    setupModal("Bubbles-modal", "Bubbles-modal-content");
    setupModal("Baldur-modal", "Baldur-modal-content");
    setupModal("Flappy-modal", "Flappy-modal-content");
    setupModal("Snake-modal", "Snake-modal-content");
}

function prepare() {
    loadComments();
    setupModals();
}

window.onload = prepare;
