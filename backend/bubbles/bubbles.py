import realtime_database as db
import datetime
from comons import XSS_safe


theoretical_max = 1204
minimum_to_post = 251
records_path = "bubbles-records"

def handle_submit(record):
    required = ["score", "name", "mobile", "misses"]
    for key in required:
        if not key in record:
            print(f"incorrect record:\n{record}")
            return f"incorrect record:\n{record}"

    if record["score"] > theoretical_max:
        print(f"score {record['score']} is too high")
        return f"score {record['score']} is too high"

    if record["score"] < minimum_to_post:
        print(f"score {record['score']} is too low")
        return f"score {record['score']} is too low"

    if not XSS_safe(record["name"]):
        return "name contains forbidden symbols"

    record["time"] = str(datetime.datetime.now())
    db.push(records_path, record)
    return "OK"

def get_all_records():
    return db.get(records_path)