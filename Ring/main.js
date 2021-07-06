#!/usr/bin/env node
const { getData } = require("./src/js/training");
const WebSocketClient = require("websocket").client;
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

//IP vom Server!!! windows ipconfig
//lab: 10.110.0.103
//max: 192.168.178.20
const ip = "10.110.0.103";


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

client.connect('ws://' + ip + ':8080/', 'echo-protocol');
console.log("client listening on " + ip);