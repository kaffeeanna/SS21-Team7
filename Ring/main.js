#!/usr/bin/env node
//meine selbstgeschriebenen Funktionen, die ich in eine andere Datei gepackt habe // In welche Datei?
const { saveTraining, getTraining } = require("./src/js/training");
//Node modules
const WebSocketClient = require("websocket").client;
const EventEmitter = require("events");
const express = require("express");
const path = require("path");

//ein Server (für den Browser) wird erstellt
const app = express();
//mein Eventlistener wird erstellt. Der kann Nachrichten von einem Ende der Welt schreien.
//Wenn sie von einem anderen (oder dem selben) eventlistener gehört wird, kann dieser coole Dinge damit machen. Z.B. eine Funktion ausführen
const myEmitter = new EventEmitter();
let training;

//IP vom Server!!! windows ipconfig
//lab: 10.110.0.103
//max: 192.168.178.20
//diandra: 192.168.2.102
// nina: 192.168.178.55.
const ip = "192.168.178.20";

//Das ist der Server, bzw. in diesem Fall Client (Da Ring), der erstellt wird
const client = new WebSocketClient();

//Der Server wartet auf verschiedene Ereignisse wie:

//wenn eine Verbindung fehlgeschlagen ist:
client.on("connectFailed", function (error) {
  //führe diesen Code aus
  console.log("Connect Error: " + error.toString());
});

//wenn sich der Client mit dem Server erfolgreich verbunden hat:
client.on("connect", function (connection) {
  //führe diesen Code aus
  console.log("WebSocket Client Connected");
  //außerdem baue eine Verbindung auf (connection), die ebenfalls auf verschiedene Ereignisse wartet
  connection.on("error", function (error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on("close", function () {
    console.log("echo-protocol Connection Closed"); // Was ist dieses echo-Protocol?
  });
  //wenn eine Nachricht reinkommt..
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      //schreit mein Eventlistener den Inhalt der Nachricht als String und hofft, dass er gehört wird. Das Event heißt "getData" (in Zeile 65 wird das Event dann gehört)
      myEmitter.emit("getData", JSON.parse(message.utf8Data));
    }
  });

  //hier wartet mein Eventlistener darauf, dass irgendwo ein Event mit dem Namen "sendData" geschrien wird, damit er die Daten des Events (data) weiter verwenden kann
  myEmitter.on("sendData", (data) => {
    console.log(data);
    // die Daten aus data werden von (connection) an den Server (Case) gesendet
    connection.sendUTF(data);
    training = null;
  });
});

//zuletzt kam in dem Websocketserver eine Nachricht an, die mit dem Eventlistener als Objekt mit dem Namen "getData" geschrien wurde
//Hier wartet auch schon mein Eventlistener auf das Objekt. Sobald er es bekommt, führt er die Funktion aus. Der Inhalt der Nachricht ist (data)
myEmitter.on("getData", (data) => {
  //die Nachricht sieht wie folgt aus:
  /**
   data {
     msg: z.B. "get" oder "send" (wird in Case definiert und kann immer unterschiedlich sein)
     data: die eigentlichen Daten
   }
   */
  switch (data.msg) {
    //wenn msg = "get" ist, führe die Funktion sendData() aus
    case "get":
      sendData();
      break;
    //wenn msg = "send" ist, führe die Funktion useData() aus
    case "send":
      useData(data.data);
      break;
    //wenn das irgendwas anderes ist (was nicht passieren sollte), sag mir in console log was genau passiert ist
    default:
      console.log(
        "something unexpected happened while the case sended something to the ring"
      );
      break;
  }
});

//wenn sendData aufgerufen wird,..
async function sendData() {
  // führe erst getTraining() aus (also das aktuelle Training wird aus der JSON geholt und als Objekt (nicht JSON) ausgegeben)
  let training = await getTraining();
  //wenn das fertig ist, packe das Training nimm das Training und mache ein JSON daraus
  let sendObj = JSON.stringify(training);
  //dann schreit mein Emitter "sendData" und gibt das aktuelle Training mit (in Zeile 55 gehts weiter)
  myEmitter.emit("sendData", sendObj);
  console.log("sended back");
}

//wenn useData aufgerufen wird,..
async function useData(data) {
  console.log("do something");
  //speichere das Training, was du bekommen hast (also die Nachricht, die ganz am Anfang vom Server kam)
  training = data;
  saveTraining(training);
}

//https://expressjs.com/en/guide/routing.html
//jetzt geht es weiter mit dem Browser, der Server läuft ja schon (gaanz Oben steht eine Zeile dazu)
app.use(express.json());
//"public" ist der Ordner, wo alle Dateien für den Browser drin sind
app.use(express.static(path.join(__dirname, "public")));

//wir befinden uns im Browser auf der Seite: http://localhost:3002 gehst (die Adresse steht ganz am Ende)

//wenn wir auf "localhost:3002/" (es geht nur um den Schrägstrich) gehen, dann..
app.get("/", (req, res) => {
  //zeigst du die html aus dem Ordner "public"
  res.sendFile(path.join(__dirname + "/index.html"));
});

//auf der seite localhost:3002/data sendest du das Training, was wir ja vorhin vom Websocketserver als Nachricht bekommen haben
app.get("/data", (req, res) => {
  res.send(training);
});

/*vorsicht: jetzt steht hier nicht app.get sondern app.post:
das heißt, dass man nicht einfach so auf localhost:3002/ressource gehen kann. 
wenn man die Adresse in den Browser eingibt, wird eine Fehlermeldung angezeigt. Man muss warten, bis man
dorthin eingeladen wird. das passiert immer.
das passiert immer, wenn in public/web.js mit der Funktion fetch ein Objekt an die Route /ressource geschickt wird
*/
app.post("/ressource", async (req, res) => {
  //jemand sagt also: hey, ich habe hier ein Objekt für dich und ich lege es bei der Adresse /ressource ab. kannste dir ja mal anschauen

  //und wenn das passiert, wird als aller erstes nochmal das aktuelle Training, was wir vorhin bekommen haben, gezogen.
  let training = await getTraining();

  //dann schauste dir mal an, was da an der Adresse abgelegt wurde
  console.log(req.body);
  //hey cool, das ist ja ein gescanntes Objekt, das wird direkt in dem aktuellen Training gespeichert
  //deswegen gehst du in training.objectList, und speicherst das der Reihenfolge nach ab
  training.objectList[req.body.id] = req.body;
  //damit nix verloren geht, wird das Training dann gespeichert.
  //irgendwann sagt dann das Case, dass das Training beendet ist und dann wird das aktuelle Training (schau mal in Zeile 65) zurückgeschickt
  saveTraining(training);
});

//hier steht noch so Serverzeugs wie z.B. die Adresse und der Port für den express-server (in dem Browser)
app.listen(3002);

console.log("listening on http://localhost:3002");

//und die Adresse + IP für den Websocket Server
client.connect("ws://" + ip + ":8080/", "echo-protocol");
console.log("client listening on " + ip);
