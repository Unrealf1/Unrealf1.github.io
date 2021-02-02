import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import os
import json


secret = os.environ['db_access_secret']
secret_data = json.loads(secret)

cred = credentials.Certificate(secret_data)
app = firebase_admin.initialize_app(cred, {
    "databaseURL": "https://personalsite-63f97.firebaseio.com/"
})

def push(path, data):
    return db.reference(path).push(data)

def get(path):
    return db.reference(path).get()

def update(path, data):
    return db.reference(path).set(data)
