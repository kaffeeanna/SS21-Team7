const fs = require("fs");

async function getTrainingFromList(list, identification) {
    //checks if identifications the id or the name of a valid training
    return new Promise((resolve, reject) => {
        let data;
        if (isNaN(identification)){
            for (let i = 0; i < list.trainingList.length; i++){
                if (list.trainingList[i].name === identification){
                    // console.log(" " + list.trainingList[i].name);
                    data = 1;
                    resolve(list.trainingList[i]);
                }
            }
        }
        else {
            for (let i = 0; i < list.trainingList.length; i++){
                if (list.trainingList[i].id === identification){
                    data = 1;
                    resolve(list.trainingList[i]);
                }
            }
       }
       if (!data){
           resolve(null);
        }
    });
}
async function sendTraining(emitter, list, identification) {
    //creates an interval that emits the training every second to the websocket, so the ws can send it to the ring
    //interval should be removed in final version
    // console.log(list.trainingList[0].name);
    //if id is not a Number, it must be the name
    let data;
    if (isNaN(identification)){
        for (let i = 0; i < list.trainingList.length; i++){
            if (list.trainingList[i].name === identification){
                console.log("this is the training which will be sended: " + list.trainingList[i].name);
                data = list.trainingList[i];
            }
        }
    }
    else {
        for (let i = 0; i < list.trainingList.length; i++){
            if (list.trainingList[i].id === identification){
                console.log("this is the training which will be sended: " + list.trainingList[i].name);
                data = list.trainingList[i];
            }
        }
    }
    if (!data){
        console.log("Identification is incorrect. Nothing will be sended.")
        data = "nothing";
    }
    let d = setInterval(()=>{
        emitter.emit('sendData', data);
        // console.log("emitted");
    }, 1000);
}
async function deleteTraining(list, training) {
        // console.log(list.trainingList);
        for (let i = 0; i < list.trainingList.length; i++){
            if (training.id === list.trainingList[i].id) {
                list.trainingList.splice(i,1);
            }
        }
        return list
}
async function createNewTraining(training) {
    //get the trainingList
    let list = await getTrainingList();
    //push the training into the List
    list.trainingList.push(training);
    console.log("create new training")
    return list;
}
//savetraining
async function saveTrainingList(list){
    return new Promise(resolve => { 
    let data = JSON.stringify(list, null, 2);
    // console.log(data);
    fs.writeFile('./src/trainingList/trainingList.json', data, (err) => {
        if (err) {
            console.log("there was an error while saving the List: " + err);
        } else {
            console.log('Data written to file');
        }
        resolve("saved.");
    });
    }),(reject => {
        console.log("something went wrong while saving the list: " + reject)
    });

}

function getTrainingList() {
    return new Promise(resolve => {
        fs.readFile("./src/trainingList/trainingList.json", (err, data) => {
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

function resetTrainingList(){
    return new Promise(resolve => {
        fs.readFile("./src/trainingList/trainingListSafe.json", (err, data) => {
            if (err){
                console.log("there was an error while reading trainingList: " + err);
                resolve(err)
            }
            else {
                resolve(data)
            }
        });
    }).then((data)=>{
        fs.writeFile('./src/trainingList/trainingList.json', data, (err) => {
            if (err) {
                console.log("there was an error while saving the List: " + err);
            } else {
                console.log('Data written to file');
            }
        });
    });
}

module.exports = {
    getTrainingFromList,
    sendTraining,
    deleteTraining,
    saveTrainingList,
    createNewTraining,
    getTrainingList,
    resetTrainingList
}