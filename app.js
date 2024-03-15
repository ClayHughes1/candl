require('dotenv').config();

const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const PORT = 4000 || 3000;
const qs = require('querystring');
const me = require('./src/services/messaging');
const client = require('./components/client');
const fm = require('./components/filemaintenance');
const { Console } = require('console');
const soc = require('./src/services/social');
const passport = require('passport');
const fb = require('passport-facebook');
const LocalStrategy    = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();
// var index = require('../public/routes/index.html');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname,'/')));
app.use(express.static(path.join(__dirname,'/src/')));
app.use(express.static(path.join(__dirname,'/public/routes/')));

// app.use(express.static(path.join(__dirname,'/src/routes/')));

app.get('/public/routes/',function(req,res){
        me.sendEmail('clayhughes1113@gmail.com','hello','hello');


    console.log("getting index page");
    res.render('index.html');
});

app.post('/api/submitquoterequest',function(req,res) {
    let aClient;
    let subject = 'Qoute requestt';
    let option = 'quote';

    const email = req.body.conemail
    const conphone = req.body.conphone;
    const firstname  = req.body.confirstname;
    const lastname = req.body.conlastname;
    const compname = req.body.compname;
    const phone = req.body.conphone;
    const servicetype = req.body.servicetype;
    const servicedescription =  req.body.servicedescription;
    aClient = new client(firstname,lastname,compname,email,phone,servicetype,servicedescription);

    try{
        me.createBody(aClient).then((res,err) =>{
            let htmlBody = res;
            console.log(res);
            me.mailOptions(htmlBody,subject);
        }).then((err) => {
            if(!err){
              fm.createData(aClient,option).then((res,err) =>{
                fm.writeToQoute(res);
              });
            }
        });
    }catch(err){
        console.log('error    '+err);
    }
});

app.post('/api/registerfree',function(req,res) {
    let aClient;
    let subject = 'Free service applicant';
    let option = 'free';

    const email = req.body.conemail
    const phone = req.body.conphone;
    const firstname  = req.body.confirstname;
    const lastname = req.body.conlastname;
    const compname = req.body.compname;
    aClient = new client(firstname,lastname,compname,email,phone);
    try{
        me.createBody(aClient).then(res =>{
            let htmlBody = res;
            console.log('results from create body    '+res);
            me.mailOptions(htmlBody,subject);
        }).then((err) => {
            if(!err){
              fm.createData(aClient).then((res,err) =>{
                fm.writeToRegister(res);
              });
            }
        });
    }catch(err){
        console.log('error    '+err);
    }
});

app.get('/api/instagram',function(req,res){
    console.log('sending to instagram...............    '+req);
    console.log('URL..................'+process.env.INSTAGRAM_URL);
    res.redirect('https://www.instagram.com/socialcandl');
});

app.get('/api/facebook',function(req,res){
    console.log('sending to facebook...............    '+req);
    console.log('URL..................'+process.env.INSTAGRAM_URL);
    res.redirect('https://www.facebook.com/socialcandlenterprises');
});


app.get('/api/linkedin',function(req,res){
    console.log('sending to linkedin...............    '+req);
    console.log('URL..................'+process.env.INSTAGRAM_URL);
    res.redirect('https://www.linkedin.com/company/c-l-enterprises-usa/');
});

app.get('/api/requsthelp',function(req,res){
    res.redirect();
});

app.get('/error',(req,res) => res.send('Eror logging in to Facebook'));

app.listen(PORT, () =>{
    debug('listening on port ${PORT}')
});

// module.exports = app;