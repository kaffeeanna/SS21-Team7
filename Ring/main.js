#!/usr/bin/env node
const { saveTraining, getTraining } = require("./src/js/training");
const WebSocketClient = require("websocket").client;
const EventEmitter = require("events");
const express = require("express");
const path = require("path");

const app = express();
const myEmitter = new EventEmitter();
let training;

//IP vom Server!!! windows ipconfig
//lab: 10.110.0.103
//max: 192.168.178.20
//diandra: 192.168.2.102
const ip = "192.168.178.20";

const client = new WebSocketClient();

client.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});

client.on("connect", function (connection) {
  console.log("WebSocket Client Connected");
  connection.on("error", function (error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on("close", function () {
    console.log("echo-protocol Connection Closed");
  });
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      myEmitter.emit("getData", JSON.parse(message.utf8Data));
    }
  });

  myEmitter.on("sendData", (data) => {
    console.log(data);
    connection.sendUTF(data);
    training = null;
  });
});

myEmitter.on("getData", (data) => {
  switch (data.msg) {
    case "get":
      sendData();
      break;
    case "send":
      useData(data.data);
      break;
    default:
      console.log(
        "something unexpected happened while the case sended something to the ring"
      );
      break;
  }
});

async function sendData() {
  let training = await getTraining();
  let sendObj = JSON.stringify(training);
  myEmitter.emit("sendData", sendObj);
  console.log("sended back");
}

async function useData(data) {
  console.log("do something");
  training = data;
  saveTraining(training);
}

//https://expressjs.com/en/guide/routing.html
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  // res.send("index.html");
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/data", (req, res) => {
  res.send(training);
});

app.post("/ressource", async (req, res) => {
  // console.log("new data received from ring express" + req);
  let training = await getTraining();

  console.log(req.body);
  // console.log(req.body.id);
  //     console.log(training);
  training.objectList[req.body.id] = req.body;
  saveTraining(training);

  // console.log(res);
});

app.listen(3002);

console.log("listening on http://localhost:3002");

client.connect("ws://" + ip + ":8080/", "echo-protocol");
console.log("client listening on " + ip);
