const fs = require("fs");

function getData(data){
    let training;
    let d = JSON.parse(data);
    console.log(d);
}

module.exports = {
    getData
}