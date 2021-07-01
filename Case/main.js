#!/usr/bin/env node
/**
 * Imports and requirements
 */
const WebSocketServer = require('websocket').server;
const http = require('http');
const { getTrainingFromList, sendTraining, changeTraining, createNewTraining, getTrainingList } = require("./src/js/training");
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
    //         sendObj = JSON.stringify(trainingList[0]);
    //         connection.send(sendObj);
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
        getData(message);
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
        const list = await getTrainingList();
        trainingList = list;
        console.log(list);
        //here you get the list with all trainings
        //do stuff
}

logic();





function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

function send(data){
    //send: training, get-request
    let objData = JSON.stringify(data)
    connection.send(objData);
}

function getData(message){
    if (message.type === 'utf8') {
        console.log('Received Message: ' + message.utf8Data);
    }
}


