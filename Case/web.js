const { io } = require("socket.io-client");
const express = require("express");
const app = express();
const client = io("http://192.168.178.46:3000");

client.on("data", (data) => {
    console.log("data received:")
    console.log(data);
});

// // Can be called to retrieve the current status of the car
// app.get("/api/v1/status", function (req, res) {
//     res.send(status);
//   });
  
//   // Will set the provided evId to confirmed
//   app.post("/api/v1/confirm/:evId", function (req, res) {

//     status = null;
  
//     res.send();
//   });
  
//   // serves website of car web
//   app.use("/", express.static("../car_web/src"));
  
//   app.listen(3001);
//   console.log("listening on http://localhost:3001");