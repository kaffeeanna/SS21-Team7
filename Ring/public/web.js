const headline = document.getElementById("headline");
const getObjContainer = document.getElementById("getObject");
const scanObjContainer = document.getElementById("scanObject");
const showObjectContainer = document.getElementById("showObject");
const getRandomWordContainer = document.getElementById("getRandomWord");
const getMessageContainer = document.getElementById("getMessage");
const showMessageContainer = document.getElementById("showMessage");
const showInfoContainer = document.getElementById("showInfo");
const infoToRemember = document.getElementById("infoToRemember");
const msg = document.getElementById("msg");

const videoPlayer = document.getElementById("videoPlayer");
const audioPlayer = document.getElementById("audioPlayer");

const canvas = document.getElementById("canvas");
const audioOutput = document.getElementById("audioOutput");
const randomWord = document.getElementById("randomWord");

const captureVideoBtn = document.getElementById("captureVideoBtn");
const stopRecordingBtn = document.getElementById("stopRecording");

const button = document.getElementById("btn");
const content = document.getElementById("content");

//EMPTY OBJECT
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
  //every second the html Content will be updated
  setInterval(async () => {
    const response = await fetch("/data", { method: "GET" });

    //if express delivers no training
    const isContentEmpty = response.headers.get("Content-Length") === "0";
    if (isContentEmpty) {
      updateHTML("no-content");
      return;
    }

    const data = await response.json();
    updateHTML(data);
    //overwrite training
    training = data;
  }, 1000);
}

updateContent();

function updateHTML(training) {
  //manages if there is a training delivered by express OR not
  if (training === "no-content") {
    headline.innerHTML = "kein Training";
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
  }
}

btn.addEventListener("click", async () => {
  //different states of the button / of the content
  //checks if its a new OR an old training
  if (training.objectList.length > 0) {
    console.log(training.objectList[0].audioData);
    if (
      (training.objectList[0].informationToRemember !== null &&
        training.objectList[0].audioData === null) ||
      (training.objectList[0].informationToRemember !== null &&
        training.objectList[0].audioData === undefined)
    ) {
      newTraining();
      console.log("3");
    } else {
      //old training
      oldTraining();
      console.log("2");
    }
  } else {
    //new Training
    newTraining();
    console.log("1");
  }
});

//WORKS
async function newTraining() {
  msg.innerHTML = "new Training";
  switch (buttonStatus) {
    case "newObj":
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
      if (getInformationToRemember(training, id)) {
        buttonStatus = "showInfo";
      } else {
        buttonStatus = "captureAudio";
      }
      newObject.id = id;
      newObject.alreadyKnown = false;
      id = id + 1;
      button.innerHTML = "weiter";
      break;
    case "showInfo":
      getRandomWordContainer.style.display = "none";
      showInfoContainer.style.display = "inherit";
      newObject.informationToRemember =
        training.objectList[id - 1].informationToRemember;
      infoToRemember.innerHTML =
        training.objectList[id - 1].informationToRemember;
      buttonStatus = "captureAudio";
      break;
    case "captureAudio":
      showInfoContainer.style.display = "none";
      getRandomWordContainer.style.display = "none";
      getMessageContainer.style.display = "inherit";
      // let fd = new FormData();
      let audioData = await getAudioData();
      let audioURL = window.URL.createObjectURL(audioData);
      let blob64 = await blobToB64(audioData);
      newObject.audioData = blob64;
      // console.log(newObject);
      audioOutput.src = audioURL;
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
      console.log(newObject);
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
}

//WORKS
async function oldTraining() {
  msg.innerHTML = "old Training";
  switch (buttonStatus) {
    case "newObj":
      let image = document.getElementById("displayObject");
      // btn.innerHTML = "neues Objekt";
      getObjContainer.style.display = "none";
      scanObjContainer.style.display = "inherit";
      canvas.style.display = "none";
      let img = await getImageData();
      image.src = img;
      canvas.style.display = "inherit";
      scanObjContainer.style.display = "none";
      let fakeAi = await getFakeAIAnswerIfObjectIsKnown(training);
      if (fakeAi.status) {
        buttonStatus = "showAudio";
        msg.innerHTML = "das Objekt wurde erkannt";
        console.log(fakeAi.val.audioData);
        // let d = window.URL.createObjectURL(fakeAi.val.audioData);
        // console.log(d);
        showObjectContainer.style.display = "inherit";
        audioOutput.src = fakeAi.val.audioData;
      } else {
        msg.innerHTML = "das Objekt wurde nicht erkannt";
      }

      button.innerHTML = "weiter";
      break;
    case "showAudio":
      showObjectContainer.style.display = "none";
      showMessageContainer.style.display = "inherit";
      buttonStatus = "start";
      break;
    case "start":
      showMessageContainer.style.display = "none";
      getObjContainer.style.display = "inherit";
      buttonStatus = "newObj";
      button.innerHTML = "neues Objekt scannen";
      // training.objectList.push(newObject);
      // console.log(training.objectList);
      break;
  }
}
//https://developers.google.com/web/fundamentals/media/recording-audio#access_the_microphone_interactively
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

//https://developers.google.com/web/fundamentals/media/recording-audio#access_the_microphone_interactively
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
          audioPlayer.style.display = "none";
        }
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

function getFakeAIAnswerIfObjectIsKnown(training) {
  return new Promise((resolve) => {
    let fakeAIArray = ["no"];
    //the chance for the AI to "find" the object is 1/objectlist.length
    for (let i = 0; i < training.objectList.length; i++) {
      fakeAIArray.push(training.objectList[i]);
      // fakeAIArray.push("no");
    }
    let val = fakeAIArray[Math.floor(Math.random() * fakeAIArray.length)];
    if (val === "no") {
      resolve({ status: false });
    } else {
      resolve({ status: true, val: val });
    }
  }).catch((e) => {
    console.log("there was an error: " + e);
  });
}

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

async function getInformationToRemember(training, state) {
  // for (let i = 0; i < training.objectList.length; i++) {
  if (training.objectList[state].informationToRemember) {
    console.log(training.objectList[state].informationToRemember);
    return training.objectList[state].informationToRemember;
  }
  // }
}

//https://stackoverflow.com/questions/27232604/json-stringify-or-how-to-serialize-binary-data-as-base64-encoded-json
async function blobToB64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      resolve(reader.result);
    };
  });
}
// (async () => {
// const b64 = await blobToBase64(blob);
// const jsonString = JSON.stringify({ blob: b64 });
// console.log(jsonString)
// })();

async function sendBack(json) {
  //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  //https://expressjs.com/en/guide/routing.html
  fetch("/ressource", {
    method: "POST",
    body: json,
    headers: {
      "Content-Type": "application/json",
    },
  }).then(function (response) {
    return response.json();
  });
}
