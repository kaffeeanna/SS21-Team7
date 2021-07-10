const headline = document.getElementById("headline");
const getObjContainer = document.getElementById("getObject");
const scanObjContainer = document.getElementById("scanObject");
const showObjectContainer = document.getElementById("showObject");
const getRandomWordContainer = document.getElementById("getRandomWord");
const getMessageContainer = document.getElementById("getMessage");
const showMessageContainer = document.getElementById("showMessage");

const videoPlayer = document.getElementById("videoPlayer");
const audioPlayer = document.getElementById("audioPlayer");

const canvas = document.getElementById("canvas");
const audioOutput = document.getElementById("audioOutput");
const randomWord = document.getElementById("randomWord");

const captureVideoBtn = document.getElementById("captureVideoBtn");
const stopRecordingBtn = document.getElementById("stopRecording");

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
showMessageContainer.style.display = "none";

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
    showMessageContainer.style.display = "none";
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
      let img = await getImageData();
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
      let audioData = await getAudioData();
      let audioURL = window.URL.createObjectURL(audioData);
      let formData = new FormData(audioData);
      newObject.audioData = formData;
      console.log(formData);
      audioOutput.src = audioURL;
      //   console.log(audioOutput);
      buttonStatus = "showAudio";
      break;
    case "showAudio":
      getMessageContainer.style.display = "none";
      showMessageContainer.style.display = "inherit";
      buttonStatus = "last";
      break;
    case "last":
      showMessageContainer.style.display = "none";
      newObject.alreadyKnown = true;
      let json = JSON.stringify(newObject);
      // console.log("sended: " + json);
      buttonStatus = "start";
      button.innerHTML = "zum Anfang";
      sendBack(json);
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

function getImageData() {
  return new Promise((resolve) => {
    const constraints = {
      video: true,
    };
    // Attach the video stream to the video element and autoplay.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      videoPlayer.srcObject = stream;
      // console.log(stream);
    });
    captureVideoBtn.addEventListener("click", () => {
      let context = canvas.getContext("2d");
      // Draw the video frame to the canvas.
      context.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
      imgData = canvas.toDataURL("image/jpeg", 0.5);
      newObject.objectData = imgData;
      resolve(imgData);
    });
  });
}

async function getAudioData() {
  return new Promise(async (resolve) => {
    let constraints = {
      audio: true,
      video: false,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStreamObject) => {
        if ("srcObject" in audioPlayer) {
          audioPlayer.srcObject = mediaStreamObject;
          //   console.log(mediaStreamObject);
          //   resolve(mediaStreamObject);
        }
        // let start = document.getElementById("startRecording");
        // let stop = document.getElementById("stopRecording");
        let mediaRecorder = new MediaRecorder(mediaStreamObject);
        let chunks = [];

        mediaRecorder.start();
        console.log(mediaRecorder.state);

        stopRecordingBtn.addEventListener("click", () => {
          mediaRecorder.stop();
          console.log(mediaRecorder.state);
        });

        mediaRecorder.ondataavailable = function (ev) {
          chunks.push(ev.data);
        };
        mediaRecorder.onstop = (ev) => {
          let blob = new Blob(chunks, { type: "mp3/ogg;" });
          chunks = [];
          resolve(blob);
        };
      })
      .catch((e) => {
        console.log("there was an error :" + e);
      });
  }).catch((e) => {
    console.log("there was an error " + e);
  });
}

// getAudioData();

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

async function sendBack(json) {
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
}
// addNewObjBtn.addEventListener("click", async () => {

// });

// fetch("/ressource", {method: "POST", body: "daten-die-ich-senden-will"}).then(response => {
//     console.log(response);
// })

//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//https://expressjs.com/en/guide/routing.html
