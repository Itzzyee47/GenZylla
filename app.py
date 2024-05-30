from flask import Flask, request, redirect, render_template,jsonify,url_for,session
from model import getResponds
from time import *
app = Flask(__name__)


def login_required(func):
    def wrapper_func(*args, **kwargs):
        if 'user' in session:
            return func(*args, **kwargs)
            
        data = {"message":"Please login or signup"}
        return render_template("landingPage.html",**data)
    
    wrapper_func.__name__ = func.__name__  # Preserve the original function name
    return wrapper_func


@app.route("/")
def index():
    # Display the landing page.

    return render_template("landingPage.html")

@app.route("/startSession", methods=["POST"])
def startSession():
    email = request.form['email']
    uid = request.form['uid']
    session['user'] = email
    session['userID'] = uid
    
    return 202


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
def chat():
    
    return render_template("chatpage.html")

@app.route("/pending")
@login_required
def pendingUpdate():
    
    return render_template("pending.html")

@app.errorhandler(404)
def notFound(e):
    data = {'error':e}
    return render_template("404.html",**data)


if __name__ == "__main__":
    app.run(host='localhost',debug=True, port=8080)
