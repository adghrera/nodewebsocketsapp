const WebSocket = require("ws");
const express = require("express");
const app = express();
const path = require("path");
const { startConsumer } = require("./kafkaconsumer");
const { sendMsg } = require("./kafkaproducer");

app.use("/", express.static(path.resolve(__dirname, "../client")));

const myServer = app.listen(9876); // regular http server using node express which serves your webpage

const wsServer = new WebSocket.Server({
  noServer: true,
}); // a websocket server

const myclients = {};

wsServer.on("connection", async function (ws, request, clientId) {
  // client connected
  myclients[clientId] = ws;
  ws.clientId = clientId;

  // wsServer.clients.forEach(function each(client) {
  //   if (client.readyState === WebSocket.OPEN) {
  //     // check if client is ready
  //     // console.log(client);
  //     client.send("client connected " + clientId);
  //   }
  // });
  await sendMsg({ from: ws.clientId, msg: "Client connected " + clientId });

  // what should a websocket do on connection
  ws.on("message", async function (msg) {
    await sendMsg({ from: ws.clientId, msg: msg.toString() });

    // what to do on message event
    // wsServer.clients.forEach(function each(client) {
    //   if (ws != client && client.readyState === WebSocket.OPEN) {
    //     // check if client is ready
    //     client.send(
    //       "from: " +
    //         ws.clientId +
    //         ", to :" +
    //         client.clientId +
    //         ", msg: " +
    //         msg.toString()
    //     );
    //   }
    // });
  });
});

function getClientId(req) {
  if (req?.headers && req.headers["sec-websocket-protocol"]) {
    const proto = req.headers["sec-websocket-protocol"];
    if (proto.toLowerCase().indexOf("authorization,") > -1) {
      const clientId = proto.split(",")[1].trim();
      console.log("CLIENT ID *****", clientId);
      return clientId;
    }
  }
  console.log("CLIENT ID *****", null);
  return null;
}

myServer.on("upgrade", async function upgrade(request, socket, head) {
  //handling upgrade(http to websocekt) event

  // accepts half requests and rejects half. Reload browser page in case of rejection

  //   if (Math.random() > 0.5) {
  //     return socket.end("HTTP/1.1 401 Unauthorized\r\n", "ascii"); //proper connection close in case of rejection
  //   }

  //emit connection when request accepted
  wsServer.handleUpgrade(request, socket, head, function done(ws) {
    // console.log("CLIENT UPGRADE HEADERS *****", request.headers);
    const clientId = getClientId(request);
    wsServer.emit("connection", ws, request, clientId);
  });
});

function onKafkaMessage(msg) {
  Object.keys(myclients).forEach(function (key, index) {
    // key: the name of the object key
    // index: the ordinal position of the key within the object
    const client = myclients[key];
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

(async () => {
  await startConsumer(onKafkaMessage);
})();
