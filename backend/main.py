from flask import Flask, request


app = Flask(__name__)

@app.route("/", methods=['POST', 'GET'])
def hello():
    if request.method == 'POST':
        print(request)
    else:
        return "Hello World!"

if __name__ == "__main__":
    app.run(debug=True)
