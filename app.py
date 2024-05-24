from flask import Flask, request, redirect, render_template,jsonify,url_for
from model import getResponds

app = Flask(__name__)

@app.route("/")
def index():
    # Display the landing page.

    return render_template("landingPage.html")


@app.route("/getResponds", methods=["POST"])
def respond():
    # Get the user input from the request
    data = request.form["message"]
    print(data)
    # Send to the model and get it responds
    response = getResponds(data)
    message = {"answer": response}
    print(message)
    
    return jsonify(message)

@app.route("/chat")
def chat():
    
    return render_template("chatpage.html")

@app.route("/pending")
def pendingUpdate():
    
    return render_template("pending.html")


if __name__ == "__main__":
    app.run(host='localhost',debug=True, port=8080)
