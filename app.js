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
const ch = require('./src/services/charting');
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
    res.render('admin.html');
});

app.get('/admin/',function(req,res){
    console.log('here....................');
    res.redirect('dashboard.html');
});

app.get('/clientportal',function(req,res){
    res.render('clientportal.html');
});

app.get('/', (req, res) => {
    res.redirect('admin/dashboard.html');
});

app.post('/api/validatelogin',function(req,res){
    const { userid, password} = req.body;
    console.log(userid+'    '+password);
    res.redirect('/admin/dashboard.html');


    // res.json({
    //     'loggedin': 'true'
    // })

});

app.post('/api/clientlogin',function(req,res){
    const { userid, password} = req.body;
    console.log(userid+'    '+password);
    res.redirect('/admin/dashboard.html');


    // res.json({
    //     'loggedin': 'true'
    // })

});

app.post('/api/passreset',function(req,res){
    const {useremail} = req.body;
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

    return res.send('cookie has been set!');
});

app.get('/api/getchartdata?',function(req,results){
    let chartname = req.query.chartname;
    let visitsData = [];

    switch(chartname){
        case 'visits':
        {
            ch.getVisitsData().then(res => {
                return res;
            }).then((res) =>{
                visitsData = res;
                results.json(visitsData);
            });
        }
        default: break;
    }
});

app.get('/api/getquotedata',function(req,response){
    let qouteData = [];

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
    
    ch.getQuoteData().then(res => {
        return res;
    }).then((res) =>{
        qouteData = res;
    }).then(() => {
        dbOps.logLogData(requestData)
        .then(() => {
            response.json(qouteData);
        });
    });
});

app.get('/api/freeservicedata',function(req,results){
    let freeserv = [];
    ch.getFreeServiceData().then(res => {
        return res;
    }).then((res) =>{
        freeserv = res;
        results.json(freeserv);
    });
});

app.post('/api/submitquoterequest',async(req,response) => {
    const {qemail,fname,lname,compname,qphone,qservType,qdesc,qext,prefEmail,prefPhone}= req.body;
    let results;
    const pref =  (req.body.prefEmail === undefined)?req.body.prefPhone: req.body.prefEmail ;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let Id;
    let logId;

    try {

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

app.get('/error',(req,res) => res.send('Eror logging in to Facebook'));

//clientportal 
app.get('/api/getdatarequest?',function(req,results){
    const id = req.query.id;
    console.log('id passed in header..........  '+id);

});

app.listen(PORT, () =>{
    debug('listening on port ${PORT}')
});