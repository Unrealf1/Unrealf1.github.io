def require(json, keys):
    for key in keys:
        if not key in json:
            return False
    return True

def XSS_safe(string: str):
    return False if string.find('<') != -1 or string.find('>') != -1 else True