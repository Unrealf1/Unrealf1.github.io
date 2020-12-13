from flask import request, make_response
import ur.ur_logic as lg
import json


def handle_options():
    resp = make_response("lul")
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp

def handle_turn(turn):
    if lg.apply_turn(turn["game_id"], turn):
        return "OK"
    else:
        return "illegal move"

def handle_start(req):
    id = lg.start_game(req["other"])
    if id < 0:
        return json.dumps({"status": "fail"})
    else:
        return json.dumps({"status": "ok", "game_id": id})

def handle_post():
    print("Hot post request\n")
    json = request.json
    print(json)
    if json["type"] == "turn":
        return handle_turn(json)
    elif json["type"] == "enter_queue":
        return lg.add_to_queue(json["name"])
    elif json["type"] == "start_game":
        return handle_start(json)
    
    return "(you posted shit)"

def handle_get():
    return json.dumps(lg.queue)

if __name__ == "__main__":
    print("this module is not for direct call")
