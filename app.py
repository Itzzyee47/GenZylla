from flask import Flask, request, redirect, render_template,jsonify,url_for,session
from flask_cors import CORS
from model import getResponds
from time import *
import json
app = Flask(__name__)

app.secret_key = 'ndoqwi3923jd'

cors = CORS(app)

def login_required(func):
    def wrapper_func(*args, **kwargs):
        
        if 'user' in session:
            return func(*args, **kwargs)
        else:
            data = {"message":"Please login or signup"}
            
            return render_template("landingPage.html",**data)
    
    wrapper_func.__name__ = func.__name__  # Preserve the original function name
    return wrapper_func


@app.route("/")
def index():
    # Display the landing page.

    return render_template("landingPage.html")

@app.route("/startSession", methods=["POST", "GET"])
def startSession():
    raw_data = request.data
    data = json.loads(raw_data)
    email = data.get('email')
    uid = data.get('uId')
    session['user'] = email
    session['userID'] = uid
    
    return redirect(url_for(chat))

@app.route("/endSession", methods=["POST","GET"])
def endSession():
    session.clear()
    
    return render_template("landingPage.html")


@app.route("/getResponds", methods=["POST"])
def respond():
    # Get the user input from the request
    data = request.form["message"]
    print(data)
    # Send to the model and get it responds
    response = getResponds(data)
    message = {"answer": response}
    
    return jsonify(message)

@app.route("/chat")
@login_required
def chat():
    
    return render_template("chatpage.html")

@app.route("/tChat")
def tChat():
    
    return render_template("testChatpage.html")

@app.route("/pending")
def pendingUpdate():
    
    return render_template("pending.html")

@app.errorhandler(404)
def notFound(e):
    data = {'error':e}
    return render_template("404.html",**data)


if __name__ == "__main__":
    app.run(host='localhost',debug=True, port=8080)
