require('dotenv').config();

const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const PORT = 4000 || 3000;
const qs = require('querystring');
const me = require('./src/services/messaging');
const client = require('./components/client');
const fm = require('./components/filemaintenance');
const { Console } = require('console');
const soc = require('./src/services/social');
// const admin = require('./admin');
const passport = require('passport');
const fb = require('passport-facebook');
const LocalStrategy    = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const cookieParser = require('cookie-parser');
const { truncate } = require('fs');
const ch = require('./src/services/charting.js');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dbOps    = require('./data/dbOps');

const log = require('./src/services/logging');
const { connect } = require('http2');
const { promisify } = require('util');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname,'/')));
app.use(express.static(path.join(__dirname,'/src/')));
app.use(express.static(path.join(__dirname,'/public/routes/')));
app.use(express.static(path.join(__dirname,'/public/')));
app.use(express.static(path.join(__dirname,'/admin/')));
app.use(express.static(path.join(__dirname,'/clientportal/')));

app.use(cookieParser());

const currentDate = new Date();

const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month as it's zero-based
const day = String(currentDate.getDate()).padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;


// Initialize session middleware
app.use(session({
    secret: '#mySessionSecret',
    resave: true,
    saveUninitialized: true
}));

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.EMAIL_CLIENT_ID,
    clientSecret: process.env.EMAIL_SECRET,
    callbackURL: 'http://localhost:4000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // You can perform user creation or login here using profile data
    return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Route to start Google OAuth authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route after Google OAuth authentication
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        console.log('successfully logged in...........');
        // Successful authentication, redirect to home page or any other page
        res.redirect('/admin/dashboard.html');
    }
);

// Route to logout
app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/admin.html');
    });
   
    // req.logout();
    // res.redirect('/admin.html');
});

app.get('/',function(req,res){
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    res.render('admin.html');
});

app.get('/admin/',function(req,res){
    console.log('here....................');
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    res.redirect('dashboard.html');
});

app.get('/clientportal',function(req,res){
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    res.render('clientportal.html');
});

app.get('/', (req, res) => {
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    res.redirect('admin/dashboard.html');
});

app.post('/api/validatelogin',function(req,res){
    const { userid, password} = req.body;
    console.log(userid+'    '+password);
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    res.redirect('/admin/dashboard.html');


    // res.json({
    //     'loggedin': 'true'
    // })

});

app.post('/api/clientlogin',function(req,res){
    const { userid, password} = req.body;
    console.log(userid+'    '+password);
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    res.redirect('/admin/dashboard.html');


    // res.json({
    //     'loggedin': 'true'
    // })

});

app.post('/api/passreset',function(req,res){
    const {useremail} = req.body;
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    console.log(userid+'    '+useremail);
    // res.redirect('/admin/dashboard.html');


    // res.json({
    //     'loggedin': 'true'
    // })

});

// create browser cookie to store # of times client comes to site
app.get('/api/cookie',function(req, res){
    let minute = 3600 * 1000 * 24 * 365;
    let hits = 1;
    if(typeof(req.cookies['__visits']) === 'undefined' || req.cookies['__visits'] === 'undefined')
    {
        // console.log('cookie does not exists...............................'+req.cookies['__visits']);
        res.cookie('__visits', hits.toString(), { maxAge: minute,HttpOnly: true });
    }    else{
        hits = parseInt(req.cookies['__visits'])+1;
        res.clearCookie('__visits');
        res.cookie('__visits', hits.toString(), { maxAge: minute,HttpOnly: true });
    }
    fm.readVisits();
    // ch.getVisitsChart();
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    return res.send('cookie has been set!');
});

app.get('/api/getchartdata?',function(req,results){
    let chartname = req.query.chartname;
    let visitsData = [];
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    // switch(chartname){
    //     case 'visits':
    //     {
    //         ch.getVisitsData().then(res => {
    //             return res;
    //         }).then((res) =>{
    //             visitsData = res;
    //             results.json(visitsData);
    //         });
    //     }
    //     default: break;
    // }
});

app.get('/api/getquotedata',function(req,response){
    let qouteData = [];

    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    
    // ch.getQuoteData().then(res => {
    //     return res;
    // }).then((res) =>{
    //     qouteData = res;
    // }).then(() => {
    //     dbOps.logLogData(requestData)
    //     .then(() => {
    //         response.json(qouteData);
    //     });
    // });
});

app.get('/api/freeservicedata',function(req,results){
    let freeserv = [];
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    // ch.getFreeServiceData().then(res => {
    //     return res;
    // }).then((res) =>{
    //     freeserv = res;
    //     results.json(freeserv);
    // });
});

app.post('/api/submitquoterequest',async(req,response) => {
    const {qemail,fname,lname,compname,qphone,qservType,qdesc,qext,prefEmail,prefPhone}= req.body;
    let results;
    const pref =  (req.body.prefEmail === undefined)?req.body.prefPhone: req.body.prefEmail ;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let Id;
    let logId;

    try {

    const  requestData = createLogObj(req);
    //  =
    // {
    //     Timestamp: new Date(),
    //     IPAddress: req.ip, // Get IP address of the client
    //     RequestURL: req.url,
    //     HttpMethod: req.method,
    //     StatusCode: req.statusCode,
    //     ResponseSize: req.ResponseSize,
    //     UserAgent: req.get('user-agent'), // Get user-agent header
    //     Referer: req.get('referer'), // Get referer header
    //     ErrorMsg: "",
    //     QueryString: req.body
    // };

    const qouteObj = {
        "ServiceTypeId": qservType,
        "ProjectDescription":qdesc,
        "EstimatedCost": 0.00,
        "EstimatedTimeline": "",
        "AdditionalNotes": "",
        "DateCreated": new Date(),
        "CompanyName": compname,
        "FirstName": fname,
        "LastName": lname,
        "EmailAddress": qemail,
        "BusinessPhone": qphone,
        "ContactPreference": pref,
        "Extension":qext
    };

    let msg = [{message:'Service qoute request has been sent successfully..  '}]

        if(emailRegex.test(qemail))
        {
            console.log('inserting qoute......................................................');
            dbOps.insertObjectToSql('CQ',qouteObj)
            .then((res) =>{
                if(!isNaN(res))
                    Id = res;
                    // me.qouteMail(qemail).then((req) =>{
                    // });
                else 
                    msg = [{message:'There is already a record for this item..  '}]
            })
            .then(() => {
                dbOps.logLogData(requestData)
                .then((res) => {
                        logId = res.LogId;
                })
                .then(() => {
                    // console.log('QOUTE ID2...................  \n'+Id);
                    // console.log('LOG ID2...................  \n'+logId);
                    response.json(msg);
                });
            });
        }
        console.log('MESSAGE....................           \n'+msg);
    } catch (error) {
        console.log('Error '+error)
    }
});

app.post('/api/requsthelp',function(req,response){
    const {hDesc,hCompName,hFirst,hLast,hEmail,hPhone,hExt}= req.body;
    let msg = [{message:'Your request for assistance has been sent. You shold recieve an email from us soon..  '}];

    const  requestData = createLogObj(req);

    let recip = {
        recipientName: hFirst +' '+ hLast
    };

    try {
        me.sendConHelpEmail(hEmail,recip).then((req) =>{
        }).then(() => {
            dbOps.logLogData(requestData)
            .then(() => {
                response.json(msg);
            });
        });
    } catch (error) {
       console.log('AN ERROR HAS OCCURRED.............  \n'+error); 
    }
});

app.post('/api/registerfree',function(req,res) {
    let aClient;
    let subject = 'Free service applicant';
    let option = 'free';
    const  requestData = createLogObj(req);

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
        }).then(() => {
            dbOps.logLogData(requestData);
        });
    }catch(err){
        console.log('error    '+err);
    }
});

app.get('/api/instagram',function(req,response){
    console.log('sending to instagram...............    '+req);
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData).then((res) =>{
        response.redirect('https://www.instagram.com/socialcandl');
    }).catch((err) => {
        console.log("ERROR ..................  \n"+err);
    });
});

app.get('/api/facebook',function(req,response){
    console.log('sending to facebook...............    '+req);
    console.log('URL..................'+process.env.INSTAGRAM_URL);
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData).then((res) =>{
        response.redirect('https://www.facebook.com/socialcandlenterprises');
    }).catch((err) => {
        console.log("ERROR ..................  \n"+err);
    });
});

app.get('/api/linkedin',function(req,response){
    console.log('sending to linkedin...............    '+req);
    console.log('URL..................'+process.env.INSTAGRAM_URL);
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData).then((res) =>{
        response.redirect('https://www.linkedin.com/company/c-l-enterprises-usa/');
    }).catch((err) => {
        console.log("ERROR ..................  \n"+err);
    });
});

app.get('/error',(req,res) => res.send('Eror logging in to Facebook'));

//clientportal 
app.get('/api/getdatarequest?',function(req,results){
    const id = req.query.id;
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    console.log('id passed in header..........  '+id);

});

// Define API endpoint
app.get('/api/check-date', async(req, response) => {
    const startDate = new Date('2024-04-01');
    const endDate = new Date('2024-08-01'); // August 1, 2024
    let currentUTCDate = new Date(startDate.toISOString());
    let isBeforeCutoff;
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    dbOps.getDataByType('SODR',{StartDate:startDate,EndDate:endDate})
    .then((res) => {
       return JSON.parse(res[0].SpecOfferByDate).map(item => item.OfferEndDate);
    }).then((res) => { 
        try {
            if(res)
            {
                let convDate = new Date(res);
                let expireDate = new Date(convDate.toISOString());
                isBeforeCutoff = currentUTCDate < expireDate;
                response.json(isBeforeCutoff);
            }
        } catch (error) {
            console.log('ERROR HAS OCCURRED \n'+error);
        }
    }).catch((err) => {
        console.log(err);
    });
});

app.post('/api/postVisit', (req,response) => {
    const ipAddress = req.ip; // Assuming the IP address is stored in req.ip property
    const pageVisited = req.url;
    // Call the dbOps.insertVisit function with the calling IP address
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    dbOps.insertVisit(ipAddress,pageVisited).then((res)=>{
        response.status(200).json({ success: true, message: 'Visit recorded successfully.' });
    }).catch((err) => {
        console.log('ERROR OCCURRED IN FUNCTION CALL  \n'+err);
    });
});

function createLogObj(req){
    const  requestData =
    {
        Timestamp: new Date(),
        IPAddress: req.ip, // Get IP address of the client
        RequestURL: req.url,
        HttpMethod: req.method,
        StatusCode: req.statusCode,
        ResponseSize: req.ResponseSize,
        UserAgent: req.get('user-agent'), // Get user-agent header
        Referer: req.get('referer'), // Get referer header
        ErrorMsg: "",
        QueryString: req.body
    };
    return requestData;
}

app.listen(PORT, () =>{
    debug('listening on port ${PORT}')
});