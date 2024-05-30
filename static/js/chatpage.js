const chatHistory = document.getElementById('chat-history');
const userMessageInput = document.getElementById('user-message');
const sendMessageButton = document.getElementById('send-button');
const loder = document.getElementById('loader');
console.log(loder)

let isLoading = false;


function SaveChatHistory(message) {
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


  if (chatHistory.children.length > 0){
    document.getElementById('p1').style.display = "none";
    console.log(chatHistory.children)
  }

  const userMessage = userMessageInput.value;
  if (!userMessage) {
    return;
  }
  userMessageInput.value = ""; // Clear user input after sending
  loder.style.display = "block";

    // Add user message to chat history
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('chat-message');
    userMessageElement.classList.add('user-message');
    userMessageElement.innerHTML = `<div class="message-content">${userMessage}</div>`;
    chatHistory.appendChild(userMessageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom

  // Model response 
  var modelResponse;

  // Model response holder
  const modelMessageElement = document.createElement('div');

  function addModelMessageElement(){
     // Add model response to chat history
       
     modelMessageElement.classList.add('chat-message');
     modelMessageElement.classList.add('model-message');
     modelMessageElement.innerHTML = `<pre class="message-content" style="font-size: 0.8rem;font-family: system-ui;width: 90%;text-wrap: wrap;"></pre>`
     chatHistory.appendChild(modelMessageElement);
     chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
  }

  // Function to simulate typewriter effect
  function typeWriter(message, element) {
    let i = 0;
    const typingSpeed = 30; // Adjust speed here (lower value = faster typing)
    const interval = setInterval(() => {
      if (i < message.length) {
        element.textContent += message.charAt(i);
        i++;        
      } else {
        clearInterval(interval);
      }
      setTimeout(()=>{chatHistory.scrollTop += 1;}, 500);
    }, typingSpeed);

    
    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
  }
  
  //asynchronus request sent to backend...
  try{                                    //Start of try...
      loder.style.display = "block";

      if(navigator.onLine){
            // Start of if...
          fetch('/getResponds', {method: 'POST', 
          headers:{'Content-Type':'application/x-www-form-urlencoded'}, 

          body: 'message=' + encodeURIComponent(userMessage)
          })
          .then(response => response.json())
          .then(data =>{
              //loder.style.display = "block";
              modelResponse = data.answer;
              console.log(modelResponse)


            // Add model response to chat history
            addModelMessageElement();

            // update the ui and save message to history
            if (typeWriter) {
              typeWriter(modelResponse, modelMessageElement.querySelector('.message-content'));
              setTimeout(()=>{loder.style.display = "none"; chatHistory.scrollTop = chatHistory.scrollHeight;},4000);
              SaveChatHistory(userMessageElement.outerHTML); // Save user message with HTML
              SaveChatHistory(modelMessageElement.outerHTML); // Save model message with HTML
              
            }else{
              SaveChatHistory(userMessageElement.outerHTML); // Save user message with HTML
              SaveChatHistory(modelMessageElement.outerHTML); // Save model message with HTML
            }

          }).catch((error) => {
            console.log('Error fetching response:', error);
          });

          //End of if which means the user is offline....
          }else{
            addModelMessageElement();
            modelResponse = "An error occured while trying to get respond please check your internet connectivity and try again.";
            typeWriter(modelResponse, modelMessageElement.querySelector('.message-content'));
            setTimeout(()=>{loder.style.display = "none"; chatHistory.scrollTop = chatHistory.scrollHeight;},3000);
        }

      } catch(err){
        
        modelResponse = "An error occured while trying to get respond please check your internet connectivity.";
        typeWriter(modelResponse, modelMessageElement.querySelector('.message-content'));
        loder.style.display = "none";

      }

      

})



// To build message ui when loading history
function createMessageElement(messageContent, role) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    messageElement.classList.add(role === 'user' ? 'user-message' : 'model-message');
    messageElement.innerHTML = `<div class="message-content">${messageContent}</div>`;
    return messageElement;
  }
