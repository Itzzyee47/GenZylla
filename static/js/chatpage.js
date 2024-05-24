const chatHistory = document.getElementById('chat-history');
const userMessageInput = document.getElementById('user-message');
const sendMessageButton = document.getElementById('send-button');

function updateAndSaveChatHistory(message) {
    chatHistory.innerHTML += message;
    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
  
    const currentHistory = getChatHistory();
    currentHistory.push(message); // Add new message to history
    localStorage.setItem('chatHistory', JSON.stringify(currentHistory));
  }
  
  function getChatHistory() {
    const storedHistory = localStorage.getItem('chatHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  }
  

document.getElementById('message-form').addEventListener('submit', (event) => {
event.preventDefault();
  const userMessage = userMessageInput.value;
  if (!userMessage) {
    return;
  }
  userMessageInput.value = ""; // Clear user input after sending

  // Model response 
  var modelResponse = "I am not the real model but a simulation of it and your question was: "+userMessage;
  //asynchronus request sent to backend...
fetch('/getResponds', {method: 'POST', 
headers:{'Content-Type':'application/x-www-form-urlencoded'}, 

body: 'message=' + encodeURIComponent(userMessage)
}).then(response => response.json()).then(data =>{
    modelResponse = data.answer;
    console.log(modelResponse)


  // Add user message to chat history
  const userMessageElement = document.createElement('div');
  userMessageElement.classList.add('chat-message');
  userMessageElement.classList.add('user-message');
  userMessageElement.innerHTML = `<div class="message-content">${userMessage}</div>`;
  chatHistory.appendChild(userMessageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom

  // Function to simulate typewriter effect
  function typeWriter(message, element) {
    let i = 0;
    const typingSpeed = 40; // Adjust speed here (lower value = faster typing)
    const interval = setInterval(() => {
      if (i < message.length) {
        element.textContent += message.charAt(i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, typingSpeed);
  }

  // Add model response to chat history
  const modelMessageElement = document.createElement('div');
  modelMessageElement.classList.add('chat-message');
  modelMessageElement.classList.add('model-message');
  modelMessageElement.innerHTML = `<div class="message-content"></div>`
  chatHistory.appendChild(modelMessageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom

  // update the ui and save message to history
  if (typeWriter) {
    typeWriter(modelResponse, modelMessageElement.querySelector('.message-content'));
    
  } 
    updateAndSaveChatHistory(userMessageElement.outerHTML); // Save user message with HTML
    updateAndSaveChatHistory(modelMessageElement.outerHTML); // Save model message with HTML
  

  

});

})

// To build message ui when loading history
function createMessageElement(messageContent, role) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    messageElement.classList.add(role === 'user' ? 'user-message' : 'model-message');
    messageElement.innerHTML = `<div class="message-content">${messageContent}</div>`;
    return messageElement;
  }
