from commons import require
import random
import realtime_database as db
import datetime


comments_path = "guestbook"

def handle_post(comment):
    if not require(comment, ["text"]):
        return "no text"
    
    text = comment["text"]
    author = comment["author"] if "author" in comment and len(comment["author"]) > 0 else ("anon#" + str(random.randrange(10000, 99999)))

    if len(text) > 160 or len(author) > 30:
        return "text is too long"

    actual_comment = {"text": text, "author": author, "time": str(datetime.datetime.now())}
    print(f"posting comment {actual_comment}")
    db.push(comments_path, actual_comment)
    return "fine"
    