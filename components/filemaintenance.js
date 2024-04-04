const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { resourceLimits } = require('worker_threads');

const fileData = [];
const grpDate = [];
const res = [];

let data = '';
let register = path.join(__dirname, '..', 'src', 'util', 'registerforfreeservice.csv');
let qoute = path.join(__dirname, '..', 'src', 'util', 'clientqoutedata.csv');
let visit = path.join(__dirname, '..', 'src', 'util', 'visits.csv');

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

const readVisits = async() =>{

    const data = []
    
    try {
        data.push(fs.readFileSync(visit, 'utf8'));
      } catch (err) {
        console.error(err);
      }
    //   console.log('data in the maintenance file.........   '+data);
    return data;
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

const writeVisits =  async() =>{
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    let visitData;
    visitData = new Date().toLocaleDateString('en-US', options)+','+1+'\n';

    if (fs.existsSync(visit)) {
        fs.open(visit, 'r', (err, fd) => {
            fs.appendFile(visit, visitData, function (err) {
                if (err) {console.log('an error has occurred     '+err); throw err;}
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

const getValueFromCSV = async(row, column, callback, file)=> {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return callback(err);
        }

        // Splitting the data into rows
        const rows = data.trim().split('\n');

        // Extracting the specific row
        const rowData = rows[row];

        // Splitting the row data into columns
        const columns = rowData.split(',');

        // Extracting the value from the specified column
        const value = columns[column];

        callback(null, value);
    });
}

function readFileToJSON(filePath) {
    try {
        // Read file synchronously
        const fileData = fs.readFileSync(filePath, 'utf8');

        // Parse JSON data
        const jsonData = JSON.parse(fileData);
        console.log(jsonData);

        return jsonData;
    } catch (error) {
        console.error('Error reading file:', error);
        return null;
    }
}

module.exports = {
    readRegisterFile,
    readQuoteFile,
    readVisits,
    writeToRegister,
    writeVisits,
    writeToQoute,
    createData,
}