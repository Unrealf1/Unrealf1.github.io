from flask import Flask, request, make_response
from ur import ur_handlers
from bubbles import bubbles
from guestbook import guestbook
import json


app = Flask(__name__)

@app.route("/ur", methods=['POST', 'GET', 'OPTIONS'])
def ur():
    if request.method == 'POST':
        return with_control_origin(ur_handlers.handle_post())
    elif request.method == 'OPTIONS':
        return with_control_origin(ur_handlers.handle_options())
    elif request.method == 'GET':
        return with_control_origin(ur_handlers.handle_get())

@app.route("/bubbles", methods=['POST', 'GET', 'OPTIONS'])
def bubbles_post():
    if request.method == 'POST':
        if request.json is None:
            return "incorrect request"
        return with_control_origin(bubbles.handle_submit(request.json))
    elif request.method == 'GET':
        return with_control_origin(json.dumps(bubbles.get_all_records()))
    elif request.method == 'OPTIONS':
        return with_control_origin(default_options())

@app.route("/guestbook", methods=['POST', 'OPTIONS'])
def guestbook_handler():
    if request.method == 'POST':
        if request.json is None:
            return with_control_origin("incorrect request")
        return with_control_origin(guestbook.handle_post(request.json))
    elif request.method == 'OPTIONS':
        return with_control_origin(default_options())

def with_control_origin(stuff):
    response = make_response(stuff)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


def default_options():
    resp = make_response("lul")
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp

if __name__ == "__main__":
    app.run(debug=True)
