#!/usr/bin/env node
/**
 * Imports and requirements
 */
const WebSocketServer = require('websocket').server;
const http = require('http');
const EventEmitter = require('events');
const express = require("express");
const { getTrainingFromList, sendTraining, deleteTraining, saveTrainingList, createNewTraining, getTrainingList, resetTrainingList } = require("./src/js/training");
const myEmitter = new EventEmitter();
const app = express();
const path = require("path");
let trainingList = [];

/**
 * Server initialised
 */
const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});


//build a connection to client
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    let connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');


    // If a message comes in
    // connection.on('message', function(message) {
    //     getData(message);
    //     if (message.type === 'utf8') {
    //         console.log('Received Message: ' + message.utf8Data);
    //         /**
    //         * Send the message back || the 0 in trainingList is for the specific training what will be send to the ring
    //         */
    //sends Data
        myEmitter.on('sendData', (data) => {
            sendObj = JSON.stringify(data);
            connection.send(sendObj);
        } );


    //     }
    //     else {
    //         console.log("message is in wrong format")
    //     }
    //     // else if (message.type === 'binary') {
    //     //     console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
    //     //     connection.sendBytes(message.binaryData);
    //     // }
    // });
    connection.on('message', function(message) {
        // getData(message);
    });

    // If connection is closed
     connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

/**
 * Logic of case
 */
async function logic(){
        //get the trainingList
        let list = await getTrainingList();
        let fakeObj = {
            id: list.trainingList.length,
            name: "test",
            objectList: []
          };
        //here you get the list with all trainings
        sendTraining(myEmitter, list, "presidents");

        // getTrainingFromList(list, 0).then((training) => { let newList = resolve(deleteTraining(list, training); console.log(newList);});
        //trainingList looks like: [{training1}, {training2}]
        //getTrainingList(list) | gives you the trainingList | WORKS
        //getTrainingFromList(list, id/name) | gives you the specific training from the trainingList by name | WORKS
        //sendTraining(myEmitter, list, id or name as a string) | sends the Training with the given id to the ring | WORKS
        //createNewTraining(training) | creates a new Training, pushes it into the trainingList and returns the new List | WORKS
        //saveTrainingList(list) | saves the trainingList after creating a new Training | returns the new List | WORKS
        //resetTrainingList() | resets the trainingList and all data that was saved before | WORKS
        //deleteTraining(list, id/name) | deletes the training with the given id or name from the list

        //do stuff

        //BUG when you added a new training, you have to wait a moment before you can send it to the ring!!
}

// logic();


function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

app.use(express.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
  
//post, get, all
app.all("/",(req, res) => {
    res.render("index")
});


app.all("/trainings", async (req, res) => {
    let list = await getTrainingList().then((list)=>{
        res.render("trainings", {list});
    },(err)=> {
        console.log(err);
    });
    // console.log(req.body);
});


app.all("/trainings/new", (req, res) => {      
    res.render("new-training");
});

app.all("/trainings/:name", async (req, res) =>{
let list = await getTrainingList();
let status;
let name = req.params.name
for (let i = 0; i < list.trainingList.length; i++){
    if (list.trainingList[i].name === name){
        let training = list.trainingList[i];
        status = true;
        res.render("training",{list, training});
    }
}
    if (status === true){
        return
    }
    else {
        res.redirect("/trainings");
    }
});
app.all("/trainings/:name/send", async (req, res) =>{
    let list = await getTrainingList();
    let name = req.params.name;
    // res.redirect("/trainings");
    res.send("send " + name);
});

app.all("/trainings/:name/delete", async (req, res) =>{
    let list = await getTrainingList();
    let status;
    let training;
    let name = req.params.name;
    res.send("delete " + name);
    for (let i = 0; i < list.trainingList.length; i++){
        if (list.trainingList[i].name === name){
            status = true;
            training = list.trainingList[i];
        }
    }
    //if there is a training with the specific name
    if (status === true){
    console.log("deleted");
    // console.log("old list: " + list.trainingList);
    deleteTraining(list, training.id);
    // console.log("new list: " + list.trainingList);
    list = await getTrainingList();
    console.log(list);
    }
    // res.redirect("/trainings");

});

app.post("/trainings/new/myNewTraining", async (req, res) => {
    let list = await getTrainingList();
    let trainingName = req.body.trainingName;  
    let newTraining = {
        id: list.trainingList.length,
        name: trainingName,
        objectList: []
      };
    res.json(newTraining);
    // sendTraining(myEmitter, list, list.trainingList.length);
    createNewTraining(newTraining).then((list)=>{saveTrainingList(list);},((err)=>{console.log("there was an error "+err)}));
    // res.send(training);
    //CODE WHEN A TRAINING WILL BE SENDED TO THE RING
});

// resetTrainingList();



app.listen(3001);
console.log("listening on http://localhost:3001");