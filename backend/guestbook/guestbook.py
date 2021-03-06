from commons import require
from commons import XSS_safe
import random
import realtime_database as db
import datetime


comments_path = "guestbook"

def handle_post(comment):
    if not require(comment, ["text"]):
        return "no text"
    
    text = comment["text"]
    author = comment["author"] if "author" in comment and len(comment["author"]) > 0 else ("anon#" + str(random.randrange(10000, 99999)))

    if len(text) == 0:
        return "text is empty"

    if len(text) > 160 or len(author) > 30:
        return "text is too long"

    print("checking for html tags...")
    if not XSS_safe(text) or not XSS_safe(author):
        print("wait, that's illegal!")
        return "text contains forbidden symbols"
    print("ok, no tags found!")

    actual_comment = {"text": text, "author": author, "time": str(datetime.datetime.now())}
    print(f"posting comment {actual_comment}")
    db.push(comments_path, actual_comment)
    return "fine"
    