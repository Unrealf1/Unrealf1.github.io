from flask import request, make_response




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
    print("this module is not for direct call")
