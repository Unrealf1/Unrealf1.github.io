from flask import Flask, request, make_response
from ur import ur_handlers

app = Flask(__name__)

@app.route("/ur", methods=['POST', 'GET', 'OPTIONS'])
def ur():
    if request.method == 'POST':
        return ur_handlers.handle_post()
    elif request.method == 'OPTIONS':
        return ur_handlers.handle_options()
    elif request.method == 'GET':
        return ur_handlers.handle_get()

@app.route("/", methods=['POST', 'GET', 'OPTIONS'])
def hello():
    if request.method == 'POST':
        return handle_post()
    elif request.method == 'OPTIONS':
        return handle_options()
    elif request.method == 'GET':
        return handle_get()

def handle_options():
    resp = with_control_origin("lul")
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp

def handle_post():
    print("Hot post request, json i\n")
    print(request.json)
    return with_control_origin("kekeers(you posted shit)")

def handle_get():
    resp = with_control_origin("halllooooo!")
    return resp

def with_control_origin(stuff):
    response = make_response(stuff)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

if __name__ == "__main__":
    app.run(debug=True)
