#!/usr/bin/env node
const { getData } = require("./src/js/training");
const WebSocketClient = require("websocket").client;
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

let training;
// myEmitter.on('getData', (data) => {
//     getData(data);
// } );

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
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    
    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendUTF(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    // sendNumber();
});
//IP von Max 192.168.178.20 bzw. vom Server!!!

client.connect('ws://10.110.0.103:8080/', 'echo-protocol');