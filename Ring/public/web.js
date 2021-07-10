const headline = document.getElementById("headline");
const getObjContainer = document.getElementById("getObject");
const scanObjContainer = document.getElementById("scanObject");
const showObjectContainer = document.getElementById("showObject");
const getRandomWordContainer = document.getElementById("getRandomWord");
const getMessageContainer = document.getElementById("getMessage");

const player = document.getElementById("player");
const canvas = document.getElementById("canvas");
const randomWord = document.getElementById("randomWord");
const captureVideoBtn = document.getElementById("captureVideoBtn");

const button = document.getElementById("btn");
const content = document.getElementById("content");
// let oldData;

let buttonStatus = "newObj";
let training;
let id = 0;
let newObject = {
  id: null,
  alreadyKnown: null,
  informationToRemember: null,
  randomWord: null,
  audioData: null,
  objectData: null,
};

scanObjContainer.style.display = "none";
showObjectContainer.style.display = "none";
getRandomWordContainer.style.display = "none";
getMessageContainer.style.display = "none";

function updateContent() {
  setInterval(async () => {
    const response = await fetch("/data", { method: "GET" });
    const isContentEmpty = response.headers.get("Content-Length") === "0";

    if (isContentEmpty) {
      updateHTML("no-content");
      return;
    }

    const data = await response.json();
    // alreadyGotContent
    // if (data !== oldData){
    updateHTML(data);
    training = data;
    // }
    // oldData = data;
  }, 1000);
}

updateContent();

function updateHTML(training) {
  if (training === "no-content") {
    headline.innerHTML = "no training";
    content.style.display = "none";
    scanObjContainer.style.display = "none";
    showObjectContainer.style.display = "none";
    getRandomWordContainer.style.display = "none";
    getMessageContainer.style.display = "none";
    buttonStatus = "newObj";
    button.innerHTML = "weiter";
  } else {
    headline.innerHTML = training.name;
    content.style.display = "inherit";
    // console.log(training);
    // buttonStatus = "newObj";
    // btn.innerHTML = "neues Objekt";
  }
}

function scanImage() {
  return new Promise((resolve) => {
    const constraints = {
      video: true,
    };
    // Attach the video stream to the video element and autoplay.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      player.srcObject = stream;
      // console.log(stream);
    });
    captureVideoBtn.addEventListener("click", () => {
      let context = canvas.getContext("2d");
      // Draw the video frame to the canvas.
      context.drawImage(player, 0, 0, canvas.width, canvas.height);
      imgData = canvas.toDataURL("image/jpeg", 0.5);
      newObject.objectData = imgData;
      resolve(imgData);
      // console.log(imgData);
      // document.write('<img src="'+img+'"/>');
      // data = context.getImageData(0, 0, canvas.width, canvas.height);
      // console.log(data);
      // context.drawImage(data, 0, 0);
      // let med = canvas.toDataURL("image/jpeg", 0.5);
      // console.log(med)
    });
  });
}

btn.addEventListener("click", async () => {
  switch (buttonStatus) {
    case "newObj":
      newObject.id = id;
      newObject.alreadyKnown = false;
      id = id + 1;
      let image = document.getElementById("displayObject");
      // btn.innerHTML = "neues Objekt";
      getObjContainer.style.display = "none";
      scanObjContainer.style.display = "inherit";
      canvas.style.display = "none";
      let img = await scanImage();
      image.src = img;
      canvas.style.display = "inherit";
      scanObjContainer.style.display = "none";
      buttonStatus = "showObj";
      button.innerHTML = "weiter";
      showObjectContainer.style.display = "inherit";
      break;
    case "showObj":
      showObjectContainer.style.display = "none";
      getRandomWordContainer.style.display = "inherit";
      randomWord.style.display = "none";
      let randomWordContent = await getRandomWord();
      newObject.randomWord = randomWordContent;
      randomWord.innerHTML = randomWordContent;
      randomWord.style.display = "inherit";
      buttonStatus = "captureAudio";
      button.innerHTML = "weiter";
      break;
    case "captureAudio":
      getRandomWordContainer.style.display = "none";
      getMessageContainer.style.display = "inherit";
      buttonStatus = "last";
      break;
    case "last":
      getMessageContainer.style.display = "none";
      let json = JSON.stringify(newObject);
      // console.log("sended: " + json);
      buttonStatus = "start";
      button.innerHTML = "zum Anfang";

      fetch("/ressource", {
        method: "POST",
        body: json,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (myJson) {
          console.log(myJson);
        });
      // fetch("/ressource", {method: "POST", body: json}).then(response => {
      //     console.log(response);
      // })
      // buttonStatus = "start";
      // button.innerHTML = "zum Anfang";
      break;
    case "start":
      getMessageContainer.style.display = "none";
      getObjContainer.style.display = "inherit";
      buttonStatus = "newObj";
      button.innerHTML = "neues Objekt scannen";
      // training.objectList.push(newObject);
      // console.log(training.objectList);
      break;
  }
});
// addNewObjBtn.addEventListener("click", async () => {

// });

async function getRandomWord() {
  return new Promise(
    async (resolve) => {
      const url = `https://random-words-api.vercel.app/word`;

      const response = await fetch(url);
      if (response.status != 200) {
        // throw error if response status is not Ok
        throw Error("RescueTrack error");
      }

      const data = await response.json();
      resolve(data[0].word);
    },
    (reject) => {
      reject("there was an error");
    }
  );
}

// fetch("/ressource", {method: "POST", body: "daten-die-ich-senden-will"}).then(response => {
//     console.log(response);
// })

//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//https://expressjs.com/en/guide/routing.html
