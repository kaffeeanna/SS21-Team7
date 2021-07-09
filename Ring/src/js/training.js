const fs = require("fs");
const fetch = require("node-fetch");

function saveTraining(training) {
    return new Promise(resolve => { 
        let data = JSON.stringify(training);
        // console.log(data);
        fs.writeFile('./src/training/training.json', data, (err) => {
            if (err) {
                console.log("there was an error while saving the List: " + err);
            } else {
                console.log('Data saved');
            }
            resolve("saved.");
        });
        }),(reject => {
            console.log("something went wrong while saving the list: " + reject)
        });
}

function getTraining() {
    return new Promise(resolve => {
        fs.readFile("./src/training/training.json", (err, data) => {
            if (err){
                console.log("there was an error while reading trainingList: " + err);
                resolve(err)
            }
            else {
                resolve(JSON.parse(data))
            }
        })
    }, (reject) => {
        console.log("there was an error while getting the trainingList: " + reject)
    }); 
}

async function getRandomWord(){
    return new Promise(async (resolve)=>{
        const url = `https://random-words-api.vercel.app/word`;
  
        const response = await fetch(url);
        if (response.status != 200) {
          // throw error if response status is not Ok
          throw Error("RescueTrack error");
        }
      
        const data = await response.json();
        resolve(data[0].word);
    },
    (reject)=>{
        reject("there was an error");
    });
}

module.exports = {
    saveTraining,
    getTraining,
    getRandomWord,
}
