const fs = require("fs");

async function getTrainingFromList(name) {
    // return new Promise(resolve => {
    let trainingList = await getTrainingList();
    //get every single training in the trainingList
    for (let i = 0; i < trainingList.length; i++){
        if (trainingList[i].name === name) {
            //do something with the training :)
            console.log(trainingList[i]);
            return trainingList[i];
            // resolve(trainingList[i])
        }
    }
    console.log("get training");
    // });
}
async function sendTraining(training) {
    console.log("send training")
}
async function changeTraining(name) {
    let training = await getTrainingList().then(getTraining(name));
    //change something the specific training
    console.log(training)
}
async function createNewTraining() {
    let trainingList = await getTrainingList();
    console.log("create new training")
}

function getTrainingList() {
    return new Promise(resolve => {
        fs.readFile("./src/trainingList/trainingList.json", (err, data)=>{
            if (err){
                console.log("there was an error while reading trainingList.txt: " + err);
                resolve(err)
            }
            else {
                resolve(JSON.parse(data).trainingList)
            // return data.toString();
            }
        })
    }); 
}

module.exports = {
    getTrainingFromList,
    sendTraining,
    changeTraining,
    createNewTraining,
    getTrainingList
}