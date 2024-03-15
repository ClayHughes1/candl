const fs = require('fs');
const path = require('path');

let data = '';
let register = path.join(__dirname, '..', 'src', 'util', 'registerforfreeservice.csv');
let qoute = path.join(__dirname, '..', 'src', 'util', 'clientqoutedata.csv');

const readRegisterFile = async() =>{
    if (fs.existsSync(register)) {
        fs.readFile(register,function(err,buff){
            if(err) {console.log(err);}
            console.log(buff.toString());
        });
    }
}    

const readQuoteFile = async() =>{
    if (fs.existsSync(qoute)) {
        fs.readFile(qoute,function(err,buff){
            if(err) {console.log(err);}
            console.log(buff.toString());
        });
    }
}    

const writeToRegister = async(data) =>{
    if (fs.existsSync(register)) {
        fs.open(register, 'r', (err, fd) => {
            fs.appendFile(register, data, function (err) {
                if (err) {console.log('an error has occurred     '+err); throw err;}
                console.log('Saved!');
            });
        });
    }
}

const writeToQoute = async(data) =>{
    if (fs.existsSync(qoute)) {
        fs.open(qoute, 'r', (err, fd) => {
            fs.appendFile(qoute, data, function (err) {
                if (err) {console.log('an error has occurred     '+err); throw err;}
                console.log('Saved!');
            });
        });
    }
}

const createData = async(client,option) => {
    let data;
    if(option === 'free')
    {
        data = new Date().toLocaleString()+','+client.firstname+','+client.lastname+','+client.email+','+client.phone+','+ client.companyname+'\n';
    }else{
        data = new Date().toLocaleString()+','+client.firstname+','+client.lastname+','+client.email+','+client.phone+','+ client.companyname+','+client.servicetype+','+client.servicedescription+'\n';
    }
    return data;
}

module.exports = {
    readRegisterFile,
    readQuoteFile,
    writeToRegister,
    writeToQoute,
    createData
}