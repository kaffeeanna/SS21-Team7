#!/usr/bin/env node
const { saveTraining, getTraining } = require("./src/js/training");
const WebSocketClient = require("websocket").client;
const EventEmitter = require('events');
const express = require("express");
const path = require("path");
const http = require("http");

const app = express();
const myEmitter = new EventEmitter();
let training;

//IP vom Server!!! windows ipconfig
//lab: 10.110.0.103
//max: 192.168.178.20
const ip = "192.168.178.20";


const client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            myEmitter.emit('getData', JSON.parse(message.utf8Data));
        }
    });
    
    myEmitter.on("sendData", (data) => {
        console.log(data);
        connection.sendUTF(data);
        training = null;
    })
});

myEmitter.on('getData', (data) => {
    switch (data.msg) {
        case "get":
        sendData();
        break;
        case "send":
        useData(data.data);
        break;
        default:
        console.log("something unexpected happened while the case sended something to the ring")
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
// training.objectList[0].randomWord = await getRandomWord();
// training.name = "HALALALALALA";
//edit training

// if (training.alreadyKnown){
    //scanObject
    //isInformationToRemember?
        //displayInformationToRemember
    //getData

// }
// else {
    //scanObject
    //isInformationToRemember?
        //displayInformationToRemember
    //createRandomWord
    //displayRandomWord
    //setData
// }

saveTraining(training);
}



// app.all("/",(req, res) => {
    // res.render("waiting");
    // res.sendFile(path.join(__dirname + '/index.html', {name}));
    // startRecording();
    
// });
// app.all("/training", (req, res) => {
    // res.render("index", {training});
// });

// app.all("/rec", async (req, res) => {
    // startRecording();
    // res.render("index");
    // let name = 12;
    // res.sendFile(path.join(__dirname + '/index.html', {name}));

// });
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    // res.send("index.html");
    res.sendFile(path.join(__dirname + '/index.html'));
  });

app.get("/data", (req, res) => {
    res.send(training);
});

app.post("/ressource", (req, res) => {
console.log(req.body);
});




// app.post("/training", function (req, res) {
//     res.send();
//   });

// app.use("/", express.static("/"));
app.listen(3002);

// const requestListener = function (req, res) {
//   res.writeHead(200);
//   res.end('Hello, World!');
//   res.render("index.html");
// }

// const browserServer = http.createServer();
// browserServer.listen(3002);

console.log("listening on http://localhost:3002")

client.connect('ws://' + ip + ':8080/', 'echo-protocol');
console.log("client listening on " + ip);