//Websocekt variables
function generateId() {
  let r = (Math.random() + 1).toString(36).substring(7);
  return r;
}

const url = "ws://localhost:9876/myWebsocket";
let mywsServer = connectWebSocket();
// new WebSocket(url, ["Authorization", `${generateId()}`]);

//DOM Elements
const myMessages = document.getElementById("messages");
const myInput = document.getElementById("message");
const sendBtn = document.getElementById("send");

sendBtn.disabled = true;
sendBtn.addEventListener("click", sendMsg, false);

function connectWebSocket() {
  const ws = new WebSocket(url, ["Authorization", `${generateId()}`]);

  ws.onclose = ws.onmessage = ws.onerror = ws.onopen = null;

  //enabling send message when connection is open
  ws.onopen = function () {
    sendBtn.disabled = false;
    console.log("ONOPEN", ws);
  };

  //handling message event
  ws.onmessage = function (event) {
    const { data } = event;
    msgGeneration(data, "Server");
    console.log("ONMESSAGE", ws);
  };

  ws.onclose = function (event) {
    // const { data } = event;
    // msgGeneration("Connection closed", "Server");
    sendBtn.disabled = true;
    console.log("ONCLOSE", ws);
  };

  ws.onerror = function (event) {
    // const { data } = event;
    // msgGeneration("Error", "Server");
    console.log("ONERROR", ws);
  };

  return ws;
}

//Sending message from client
function sendMsg() {
  const text = myInput.value;
  msgGeneration(text, "Client");
  mywsServer.send(text);
}

//Creating DOM element to show received messages on browser page
function msgGeneration(msg, from) {
  const newMessage = document.createElement("h5");
  newMessage.innerText = `${from} says: ${msg}`;
  myMessages.appendChild(newMessage);
}

function checkConnection() {
  console.log("CHECKING CONNECTION");
  if (mywsServer.readyState === 1) {
    console.log("CONNECTED");
  } else {
    console.log("NOT CONNECTED");
    mywsServer = connectWebSocket();
  }
  setTimeout(checkConnection, 2000);
}

setTimeout(checkConnection, 5000);
