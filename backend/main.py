from flask import Flask, request, make_response
from ur import ur_handlers

app = Flask(__name__)

@app.route("/ur", methods=['POST', 'GET', 'OPTIONS'])
def ur():
    if request.method == 'POST':
        return with_control_origin(ur_handlers.handle_post())
    elif request.method == 'OPTIONS':
        return with_control_origin(ur_handlers.handle_options())
    elif request.method == 'GET':
        return with_control_origin(ur_handlers.handle_get())


if __name__ == "__main__":
    app.run(debug=True)
