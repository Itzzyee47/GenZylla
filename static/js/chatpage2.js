import { marked } from 'https://unpkg.com/marked@5.0.2/lib/marked.esm.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const chatHistory = document.getElementById('chat-history');
const userMessageInput = document.getElementById('user-message');
const sendMessageButton = document.getElementById('send-button');
const loader = document.getElementById('loader');

let isLoading = false;

function timeStamp() {
  return new Date().getTime();
}

async function saveChatMessage(message,u,ConvoID) {
  try {
    if(u == 'bot'){
      await addDoc(collection(db, 'messages'), {
        sender: 'bot',
        content: message,
        convoID: ConvoID,
        timestamp: timeStamp()
      });
    }else{
      await addDoc(collection(db, 'messages'), {
        sender: u,
        content: message,
        convoID: ConvoID,
        timestamp: timeStamp()
      });
    }
    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

async function loadChatHistory() {
  const q = query(collection(db, 'messages'), orderBy('timestamp'));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const message = doc.data().content;
    chatHistory.innerHTML += message;
  });
  if (chatHistory.children.length >= 1) {
    document.getElementById('p1').style.display = "none";
  }
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

await loadChatHistory();

document.getElementById('message-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  if (chatHistory.children.length >= 1) {
    document.getElementById('p1').style.display = "none";
  }

  const userMessage = userMessageInput.value;
  if (!userMessage) {
    return;
  }
  userMessageInput.value = ""; // Clear user input after sending
  loader.style.display = "block";

  // Add user message to chat history
  const userMessageElement = document.createElement('div');
  userMessageElement.classList.add('chat-message', 'user-message');
  userMessageElement.innerHTML = `<div class="message-content" data='${timeStamp()}'>${userMessage}</div>`;
  chatHistory.appendChild(userMessageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom

  await saveChatMessage(userMessage); // Save user message to db


  // Model response holder
  const modelMessageElement = document.createElement('div');

  function addModelMessageElement() {
    // Add model response to chat history
    modelMessageElement.classList.add('chat-message', 'model-message');
    modelMessageElement.innerHTML = `<div class="message-content ai-message" data='${timeStamp()}'></div>`;
    chatHistory.appendChild(modelMessageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
  }

  // Function to simulate typewriter effect for HTML
  function typeWriterHTML(message, element) {
    let i = 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = message;
    const nodes = Array.from(tempDiv.childNodes);
    const typingSpeed = 40; // Adjust speed here (lower value = faster typing)

    function typeNode() {
      if (i < nodes.length) {
        element.appendChild(nodes[i]);
        i++;
        setTimeout(typeNode, typingSpeed);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
      }
    }

    typeNode();
  }

  function typeWriter(message, element) {
    let i = 0;
    let speed = 20;
    if (i < message.length) {
      element.innerHTML += message.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }

  // Asynchronous request sent to backend
  try {
    loader.style.display = "block";

    if (navigator.onLine) {
      const response = await fetch('/getResponds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'message=' + encodeURIComponent(userMessage)
      });
      const data = await response.json();
      const modelResponse = marked(data.answer);
      await saveChatMessage(data.answer);// save model responds to db
      addModelMessageElement(); 
      const messageContentElement = modelMessageElement.querySelector('.message-content');
      typeWriterHTML(modelResponse, messageContentElement); // Typewriter effect for HTML
      setTimeout(() => {
        loader.style.display = "none";
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }, 4000);
    } else {
      const response = await fetch('http://localhost:3000/send_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'message=' + encodeURIComponent(userMessage)
      });
      const data = await response.json();
      const modelResponse = marked(data.answer);
      await saveChatMessage(data.answer);// save model responds to db
      addModelMessageElement();
      const messageContentElement = modelMessageElement.querySelector('.message-content');
      typeWriterHTML(modelResponse, messageContentElement); // Typewriter effect for HTML
      setTimeout(() => {
        loader.style.display = "none";
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }, 4000);
    }
  } catch (err) {
    const modelResponse = "An error occurred while trying to get a response. Please check your internet connectivity.";
    typeWriter(modelResponse, modelMessageElement.querySelector('.message-content'));
    loader.style.display = "none";
  }

  // Save model message to Firestore
  setTimeout(async () => {
    await saveChatMessage(chatHistory.lastChild.outerHTML); // Save model message with HTML
  }, 4000);
});


function getUserConversations(userEmail) {
  db.collection('conversations')
      .where('user', '==', userEmail)
      .orderBy('time', 'asc')
      .get()
      .then((querySnapshot) => {
          const conversationsDiv = document.getElementById('conversations');
          conversationsDiv.innerHTML = '';
          querySnapshot.forEach((doc) => {
              const conversation = doc.data();
              const conversationDiv = document.createElement('div');
              conversationDiv.textContent = `ID: ${conversation.id}, Time: ${conversation.time.toDate()}, User: ${conversation.user}`;
              conversationsDiv.appendChild(conversationDiv);
          });
      })
      .catch((error) => {
          console.error('Error getting conversations: ', error);
      });
}





function createMessageBubble(sender,message){
  // Add user message to chat history
  const MessageElement = document.createElement('div'); 
  MessageElement.classList.add('chat-message');
  if(sender == currentUser){
    MessageElement.classList.add('user-message');
  }else{
    MessageElement.classList.add('model-message');
  }
  MessageElement.innerHTML = `<div class="message-content" data='${timeStamp()}'>${message}</div>`;
  chatHistory.appendChild(MessageElement);
}