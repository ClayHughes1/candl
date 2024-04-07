const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fileman = require('../../components/filemaintenance');
const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const charting = express();
const fs = require('fs');
const csv = require('csv-parser');
const readline = require('readline');
const { LinearScale } = require('chart.js');


charting.use(express.static(path.join(__dirname,'/src/utils')));
let visit = path.join('src','util', 'visits.csv');
// let quote = path.join('src','util', 'clientqoutedata.csv');
// let freeService = path.join('src','util', 'registerforfreeservice.csv');

const getVisitsData = async() =>{
    // let data;
    // const jsonData = [];
    // try {
    //     const fileStream = fs.createReadStream(visit);

    //     const rl = readline.createInterface({
    //       input: fileStream,
    //       crlfDelay: Infinity
    //     });
    //     // Note: we use the crlfDelay option to recognize all instances of CR LF
    //     // ('\r\n') in input.txt as a single line break.
      
    //     for await (const line of rl) {
    //       // Each line in input.txt will be successively available here as `line`.
    //       if(line.includes('Date')){continue;}
    //       else{
    //             data = {
    //                 Date: line.split(',')[0],
    //                 Visits: line.split(',')[1]
    //             }
    //             jsonData.push(data);
    //         }
    //     }
    //   } catch (err) {
    //     console.error(err);
    //   }
    // return jsonData;
}

const getQuoteData = async() => {
    // let data;
    // const jsonData = [];
    // try {
    //     const fileStream = fs.createReadStream(quote);

    //     const rl = readline.createInterface({
    //       input: fileStream,
    //       crlfDelay: Infinity
    //     });
    //     // Note: we use the crlfDelay option to recognize all instances of CR LF
    //     // ('\r\n') in input.txt as a single line break.
      
    //     for await (const line of rl) {
    //       // Each line in input.txt will be successively available here as `line`.
    //       if(line.includes('Date')){continue;}
    //       else{
    //             data = {
    //                 Date: line.split(',')[0],
    //                 FirstName: line.split(',')[1],
    //                 LastName: line.split(',')[2],
    //                 Email: line.split(',')[3],
    //                 Phone: line.split(',')[4],
    //                 CompanyName: line.split(',')[5],
    //                 Service: line.split(',')[6],
    //                 Description: line.split(',')[7]
    //             }
    //             // console.log(data);
    //             jsonData.push(data);
    //         }
    //     }
    //   } catch (err) {
    //     console.error(err);
    //   }
    // //   console.log(jsonData);
    // return jsonData;

}

const getFreeServiceData = async() => {
    // let data;
    // const jsonData = [];
    // try {
    //     const fileStream = fs.createReadStream(freeService);

    //     const rl = readline.createInterface({
    //       input: fileStream,
    //       crlfDelay: Infinity
    //     });
    //     // Note: we use the crlfDelay option to recognize all instances of CR LF
    //     // ('\r\n') in input.txt as a single line break.
      
    //     for await (const line of rl) {
    //       // Each line in input.txt will be successively available here as `line`.
    //       if(line.includes('Date')){continue;}
    //       else{
    //             data = {
    //                 Date: line.split(',')[0],
    //                 FirstName: line.split(',')[1],
    //                 LastName: line.split(',')[2],
    //                 Email: line.split(',')[3],
    //                 Phone: line.split(',')[4],
    //                 CompanyName: line.split(',')[5]
    //             }
    //             // console.log(data);
    //             jsonData.push(data);
    //         }
    //     }
    //   } catch (err) {
    //     console.error(err);
    //   }
    // //   console.log(jsonData);
    // return jsonData;

}

        //    ... // See https://www.chartjs.org/docs/latest/configuration

module.exports = {
    getVisitsData,
    getQuoteData,
    getFreeServiceData
}

