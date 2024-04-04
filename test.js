const axios = require('axios');
const assert = require('assert');
const { response } = require('express');
// const txtrec = require('./testing/test_records.csv');
const fs = require('fs');
const path = require('path');


let txtrec = path.join(__dirname, '..', 'candl','testing', 'test_records.csv');

const options = {
    // year: 'numeric',
    // month: '2-digit',
    // day: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
};

describe('API Tests', function () {
    this.timeout(320000);
    // Number of concurrent requests
    const concurrency = 10;

     //Home Page Get Test
    tstHomeGet(concurrency);

    //Qoute Post Test
    // tstQRSubmit(concurrency);

    //Home Get and Qoute Post
    // tstHomeGetAndQoutePost(concurrency);

    //GET Qoute Requests
    // tstQRGet(concurrency);

    //POST Asitance Request
    // tstRHPost(concurrency);

});

// Function to write data to a CSV file
const writeToCSV = async(data)=> {
    const headers = ['responseUrl', 'data', 'roundtrip', 'requestBodyLength', 'path', 'method','status','timestamp'];
    const headerString = headers.join(',') + '\n';
    const dataToAppend = `${data.responseUrl},${data.data},${data.roundtrip},${data.requestBodyLength},${data.path},${data.method},${data.status},${data.timestamp}\n`;
    const writeStream = fs.createWriteStream(txtrec, { flags: 'a' });
    try {
        // Append header if file doesn't exist or is empty
        if (!fs.existsSync(txtrec) || fs.readFileSync(txtrec, 'utf8').trim() === '') {
            fs.writeFileSync(txtrec, headerString);
        }
    
        // Append data
        writeStream.write(dataToAppend, 'utf8');      
        writeStream.end();

    } catch (error) {
        console.log(error);
    }
    finally{
        return;
    }
}

function tstHomeGet(concurrency){
    console.log('GETTING HOME');
    //Get qoute submissions perf sec
    it('Gets the qoute request living in DB', async function (done) {
        // Create an array to store promises for concurrent requests
        const requests = [];
        for (let i = 0; i <= concurrency; i++) {
            let startTime;

            const requestPromise = new Promise((resolve, reject) => {
                startTime = performance.now();
                axios.get('http://localhost:4000/')
                .then(response => {
                    const endTime = performance.now();
                    // Calculate the round-trip time in milliseconds
                    const roundTripTime = endTime - startTime;
                    
                    const responseData = {
                        responseUrl: response.request.res.responseUrl,
                        data: response,
                        roundtrip: roundTripTime, // Round-trip time in milliseconds
                        requestBodyLength: '8',
                        method:'GET',
                        path:'/',  // Request body length
                        status: response.status,
                        timestamp: new Date().toLocaleString('en-US', options)
                    };

                    //Write some response data to a csv file for testing purposes
                    writeToCSV({ ...responseData});

                    // Resolve the promise with the response
                    resolve(response);
                }).catch(error => {
                    console.log("ERROR \n"+error);
                    // Reject the promise with the error
                    reject(error);
                });
            });
            requests.push(requestPromise);
        }
        const responses = await Promise.all(requests).then((done) => {
            done();
        });
    });
}

function tstHomeGetAndQoutePost(concurrency){
    console.log('GETTING HOME AN POSTING');

    //Get qoute submissions perf sec
    it('Gets the qoute request living in DB', async function (done) {
        // Create an array to store promises for concurrent requests
        const requests = [];
        for (let i = 0; i <= concurrency; i++) {
            let startTime;

            const requestPromise = new Promise((resolve, reject) => {
                startTime = performance.now();
                axios.get('http://localhost:4000/')
                .then(response => {
                    const endTime = performance.now();
                    // Calculate the round-trip time in milliseconds
                    const roundTripTime = endTime - startTime;
                    
                    const responseData = {
                        responseUrl: response.request.res.responseUrl,
                        data: response,
                        roundtrip: roundTripTime, // Round-trip time in milliseconds
                        requestBodyLength: '8',
                        method:'GET',
                        path:'/',  // Request body length
                        status: response.status,
                        timestamp: new Date().toLocaleString('en-US', options)
                    };

                    //Write some response data to a csv file for testing purposes
                    writeToCSV({ ...responseData});

                    const aPromise = new Promise((resolve, reject) => {
                        startTime = performance.now();
                        axios.post('http://localhost:4000/api/submitquoterequest', {
                            qemail: 'test'+(i++)+'@example.com',
                            fname: 'John',
                            lname: 'Doe',
                            compname: 'Test Company',
                            qphone: '1234567890',
                            qservType: 1,
                            qdesc: 'Service Description',
                            qext: '1234',
                            prefEmail: 'undefined',
                            prefPhone: 'true',
                        }).then(response => {
                            const endTime = performance.now();
                            // Calculate the round-trip time in milliseconds
                            const roundTripTime = endTime - startTime;
                            const responseData = {
                                responseUrl: response.request.res.responseUrl,
                                data: response.data,
                                roundtrip: roundTripTime, // Round-trip time in milliseconds
                                requestBodyLength: response.request._redirectable._requestBodyLength,
                                method:response.request.method,
                                path:'api/submitquoterequest',  // Request body length
                                status: response.status,
                                timestamp: new Date().toLocaleString('en-US', options)
                            };
                
                            // Resolve the promise with the response
                            writeToCSV({ ...responseData}).then((done) => {
                                done();
                            });
                
                
                            resolve(response);
                        }).catch(error => {
                            console.log("ERROR \n"+error);
                            // Reject the promise with the error
                            reject(error);
                        });
                    });
                
                    requests.push(aPromise);
                    

                    // Resolve the promise with the response
                    resolve(response);
                }).catch(error => {
                    console.log("ERROR \n"+error);
                    // Reject the promise with the error
                    reject(error);
                });
            });
            requests.push(requestPromise);
        }
        const responses = await Promise.all(requests).then((done) => {
            done();
        });
    });
}

function tstQRSubmit(concurrency){
    console.log('POSTING ');

    //Qoute submission perf sec
    it('Posts qoute request data to DB', async function (done) {
        console.log('HERE');
        // Create an array to store promises for concurrent requests
        const requests = [];
        for (let i = 0; i <= concurrency; i++) {
            const startTime = performance.now();

            const requestPromise = new Promise((resolve, reject) => {
                axios.post('http://localhost:4000/api/submitquoterequest', {
                    qemail: 'test'+(i++)+'@example.com',
                    fname: 'John',
                    lname: 'Doe',
                    compname: 'Test Company',
                    qphone: '1234567890',
                    qservType: 1,
                    qdesc: 'Service Description',
                    qext: '1234',
                    prefEmail: 'undefined',
                    prefPhone: 'true',
                }).then(response => {
                    const endTime = performance.now();
                    // Calculate the round-trip time in milliseconds
                    const roundTripTime = endTime - startTime;
                    const responseData = {
                        responseUrl: response.request.res.responseUrl,
                        data: response.data,
                        roundtrip: roundTripTime, // Round-trip time in milliseconds
                        requestBodyLength: response.request._redirectable._requestBodyLength,
                        method:response.request.method,
                        path:'api/submitquoterequest',  // Request body length
                        status: response.status,
                        timestamp: new Date().toLocaleString('en-US', options)
                    };
console.log(response.request.path);
                    // Resolve the promise with the response
                    writeToCSV({ ...responseData}).then((done) => {
                        done();
                    });


                    resolve(response);
                }).catch(error => {
                    console.log("ERROR \n"+error);
                    // Reject the promise with the error
                    reject(error);
                });
            });

            requests.push(requestPromise);
        }
        const responses = await Promise.all(requests).then((done) => {
            done();
        });
    });
}

function tstQRGet(concurrency){
    console.log('GETTING QOUTE');

    //Get qoute submissions perf sec
    it('Gets the qoute request living in DB', async function (done) {
        // Create an array to store promises for concurrent requests
        const requests = [];
        for (let i = 0; i <= concurrency; i++) {
            const startTime = performance.now();

            const requestPromise = new Promise((resolve, reject) => {
                axios.get('http://localhost:4000/api/getquotedata')
                .then(response => {
                    const endTime = performance.now();
                    // Calculate the round-trip time in milliseconds
                    const roundTripTime = endTime - startTime;
                    
                    const responseData = {
                        responseUrl: response.request.res.responseUrl,
                        data: response,
                        roundtrip: roundTripTime, // Round-trip time in milliseconds
                        requestBodyLength: '8',
                        method:'GET',
                        path:'api/getquotedata',  // Request body length
                        status: response.status,
                        timestamp: new Date().toLocaleString('en-US', options)
                    };

                    //Write some response data to a csv file for testing purposes
                    writeToCSV({ ...responseData});

                    // Resolve the promise with the response
                    resolve(response);
                }).catch(error => {
                    console.log("ERROR \n"+error);
                    // Reject the promise with the error
                    reject(error);
                });
            });
            requests.push(requestPromise);
        }
        const responses = await Promise.all(requests).then((done) => {
            done();
        });
    });
}

function tstRHPost(concurrency)
{
    console.log('POSTING HELP');

    //Request help perf submission sec
    //hDesc,hCompName,hFirst,hLast,hEmail,hPhone,hExt
    it('Post requst asistance data to DB', async function (done) {
        // Create an array to store promises for concurrent requests
        const requests = [];
        for (let i = 0; i <= concurrency; i++) {
            const startTime = performance.now();
            const requestPromise = new Promise((resolve, reject) => {
                axios.post('http://localhost:4000/api/requsthelp', {
                    hEmail: 'test'+(i++)+'@example.com',
                    hFirst: 'John',
                    hLast: 'Doe',
                    hCompName: 'Test Company',
                    hPhone: '1234567890',
                    hDesc: 'Service Description',
                    hExt: '1234',
                }).then(response => {
                    const endTime = performance.now();
                    // Calculate the round-trip time in milliseconds
                    const roundTripTime = endTime - startTime;
                    const responseData = {
                        responseUrl: response.request.res.responseUrl,
                        data: response.data,
                        roundtrip: roundTripTime, // Round-trip time in milliseconds
                        requestBodyLength: response.request._redirectable._requestBodyLength,
                        method:response.request.method,
                        path:'api/requsthelp',  // Request body length
                        status: response.status,
                        timestamp: new Date().toLocaleString('en-US', options)
                    };
        
                    // Resolve the promise with the response
                    writeToCSV({ ...responseData});
        
        
                    resolve(response);
                }).catch(error => {
                    console.log("ERROR \n"+error);
                    // Reject the promise with the error
                    reject(error);
                });
            });
        
            requests.push(requestPromise);

        }
        const responses = await Promise.all(requests).then((done) => {
            done();
        });;
    });
}

