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
    id = lg.start_game(req["self"], req["other"])
    if id < 0:
        return json.dumps({"status": "fail"})
    else:
        return json.dumps({"status": "ok", "game_id": id})

def handle_heartbeat(req):
    name = req["name"]
    invites = lg.get_invitations(name)
    lg.heartbeat(name)
    return json.dumps({"invites": invites})

def handle_invite(req):
    lg.invite(req["self"], req["other"])
    return "OK"

def handle_post():
    print("Hot post request\n")
    json = request.json
    print(json)
    req_type = json["type"]
    if req_type == "turn":
        return handle_turn(json)
    elif req_type == "enter_queue":
        return lg.add_to_queue(json["name"])
    elif req_type == "start_game":
        return handle_start(json)
    elif req_type == "heartbeat":
        return handle_heartbeat(json)
    elif req_type == "invite":
        return handle_invite(json)
    
    return "(you posted shit)"

def handle_get():
    lg.clear_queue()
    names = lg.get_names()
    return json.dumps(names)

if __name__ == "__main__":
    print("this module is not for direct call")
