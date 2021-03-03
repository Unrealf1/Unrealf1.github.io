def require(json, keys):
    for key in keys:
        if not key in json:
            return False
    return True