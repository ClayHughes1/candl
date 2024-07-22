require('dotenv').config();

const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const qs = require('querystring');
const me = require('./src/services/messaging');
const client = require('./components/client');
const fm = require('./components/filemaintenance');
const { Console, error } = require('console');
const soc = require('./src/services/social');
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
const { SlowBuffer } = require('buffer');
const PORT = process.env.PORT || 3000;
const app = express();
const paypal = require('paypal-rest-sdk');
const https = require('https');

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

//CHAT
const formattedDate = currentDate.toISOString().split('T')[0];

// Initialize session middleware
app.use(session({
    secret: '#mySessionSecret',
    resave: true,
    saveUninitialized: true
}));

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

/**
 * Handles the /error route.
 * 
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.use((err, req, res, next) => {
    // Handle errors here
    res.status(500).send('Internal Server Error');
});


//Get CSR and SSL 
// Define request options
// const options = {
//     hostname: 'http://localhost:4000',
//     port: 443, // HTTPS default port
//     path: '/api/submitpayment',
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     //   'Content-Length': postData.length
//     }
//   };

// Create the request
// let req = https.request(options, (res) => {
  
//     res.on('data', (d) => {
//     //   process.stdout.write(d);
//     });
// });

// // Create HTTPS server
// https.createServer(options, app).listen(443, () => {
//     console.log('Server running on https://localhost:443');
// });


// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.EMAIL_CLIENT_ID,
    clientSecret: process.env.EMAIL_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    // You can perform user creation or login here using profile data
    return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {done(null, user);});
passport.deserializeUser((user, done) => {done(null, user);});

//GET REQUESTS
// Route to start Google OAuth authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


//CHAT
// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     (req, res) => {
//         res.redirect('/admin/dashboard.html');
//     }
// );

// Callback route after Google OAuth authentication
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect to home page or any other page
        res.redirect('/admin/dashboard.html');
    }
);

// Configure PayPal with your client ID and secret
//moved to palfunc.js
// paypal.configure({
//     mode: 'sandbox', // Change to 'live' for production
//     client_id: 'YOUR_CLIENT_ID',
//     client_secret: 'YOUR_CLIENT_SECRET'
// });

// Route to logout
app.get('/api/admin/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/admin.html');
    });
});

/**
 * Handles the /api/client/logout request.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/api/client/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/clientportal.html');
    }).catch((err) => {
        dbOps.logSiteError(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Handles the rot directory main page request.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/',function(req,res){
    try {
        const  requestData = createLogObj(req);
        dbOps.logLogData(requestData);
        res.render('admin.html');
    } catch (error) {
        dbOps.logSiteError(err);
        res.status(500).json({error: 'An error occurred while retireveing this page. Please try again later. '})
    }
});

/**
 * Handles the /admin request.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/admin/',function(req,res){
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);
    res.redirect('dashboard.html');
});

/**
 * Handles the /admin main page request.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/', (req, res) => {
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);
    res.redirect('admin/dashboard.html');
});

/**
 * Handles the creation browser cookie to store # of times client comes to site.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/api/cookie',function(req, res){
    let minute = 3600 * 1000 * 24 * 365;
    let hits = 1;
    if(typeof(req.cookies['__visits']) === 'undefined' || req.cookies['__visits'] === 'undefined')
    {
        res.cookie('__visits', hits.toString(), { maxAge: minute,HttpOnly: true });
    }    else{
        hits = parseInt(req.cookies['__visits'])+1;
        res.clearCookie('__visits');
        res.cookie('__visits', hits.toString(), { maxAge: minute,HttpOnly: true });
    }
    fm.readVisits();
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);
    return res.send('cookie has been set!');
});

/**
 * Handles the  request for detailed charting of business metrics .
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The response object.
 * @param {string} chartname - The chartname string (req param)
 */
app.get('/api/getchartdata?',function(req,resp){
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
    //             resp.json(visitsData);
    //         }).catch((err) => {
                //     dbOps.logSiteError(err);
                //     resp.status(500).json({ error: 'Internal Server Error' });
                // });
    //     }
    //     default: break;
    // }
});

/**
 * Handles the request for client qoute requests.
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 */
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
    // }).catch((err) => {
    //     dbOps.logSiteError(err);
    //     response.status(500).json({ error: 'Internal Server Error' });
    // });
});

/**
 * Handles the request for client request for free service requests.
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The response object.
 */
app.get('/api/freeservicedata',function(req,resp){
    let freeserv = [];
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    ch.getFreeServiceData().then(res => {
        return res;
    }).then((res) =>{
        freeserv = res;
        resp.json(freeserv);
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Handles the request to redirect to company instagram page.
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 */
app.get('/api/instagram',function(req,response){
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData).then((res) =>{
        response.redirect(process.env.INST_URL);
    }).catch((err) => {
        dbOps.logSiteError(err);
        response.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Handles the request to redirect to company facebook page.
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 */
app.get('/api/facebook',function(req,response){
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData).then((res) =>{
        response.redirect(process.env.FACEOOK_PAGE);
    }).catch((err) => {
        dbOps.logSiteError(err);
        response.status(500).json({ error: 'Internal Server Error',err });
    });
});


/**
 * Handles the error response object when error occurs in logging into facebook.
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The resp object.
 */
app.get('/error',(req,res) => res.send('Error logging into Facebook'));


/**
 * Handles the request to redirect to company linkedin page.
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 */
app.get('/api/linkedin',function(req,response){
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData).then((res) =>{
        response.redirect(process.env.LINKEDIN_URL);
    }).catch((err) => {
        dbOps.logSiteError(err);
        response.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Handles the request to check date in relation to specialo offers provided by company to 
 * ensure the offer is still valid.
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 */
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
            dbOps.logSiteError(err);
            response.status(500).json({ error: 'Internal Server Error' });
        }
    }).catch((err) => {
        dbOps.logSiteError(err);
        response.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Handles the request to capture visitor to the site.
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 */
app.post('/api/postVisit', (req,response) => {
    const ipAddress = req.ip; // Assuming the IP address is stored in req.ip property
    const pageVisited = req.url;
    // Call the dbOps.insertVisit function with the calling IP address
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    dbOps.insertVisit(ipAddress,pageVisited).then((res)=>{
        response.status(200).json({ success: true, message: 'Visit recorded successfully.' });
    }).catch((err) => {
        dbOps.logSiteError(err);
        response.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Handles the logging of site data .
 * 
 * @param {Object} req - The request object.
 * @param {Object} results - The results object.
 * @param {string} id - The id (req string).
 */
app.get('/api/getdatarequest?',function(req,results){
    const id = req.query.id;
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);
});

/**
 * Handles the request for the client portal.
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The resp object.
 */
app.get('/clientportal',function(req,resp){
    const referrer = req.get('Referrer');
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    if (referrer && referrer.includes('passreset')) {
        const parsedUrl = new URL(referrer);
        const email = parsedUrl.searchParams.get('email');
        dbOps.getDataByType('CBE',{email:email}).then((res) => {
            resp.redirect('clientportal.html?clientid='+res[0].ClientId);

        }).catch((err) => {
            dbOps.logSiteError(err);
            resp.status(500).json({ error: 'Internal Server Error' });
        });
    } else {
        resp.redirect('clientportal.html?clientid=0');
    }
});


/**
 * Handles the request to acquire country data.
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The resp object.
 */
app.get('/api/getcountrydata', async (req, resp) => {
    let nameArr = [];
    // Call dbOps.getCountryData to fetch country data
    await dbOps.getDataByType('COU').then((res) => {
        return res;
    }).then((res) => {
        for (const key in res[0]) {
            let a = JSON.parse(res[0][key]);
            for (var b in a)
            {
                let ccode = a[b].CountryCode;
                let cname = a[b].CountryName
                nameArr.push(cname);
            }
        }      
        resp.json(nameArr);
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * Handles the post request to validaton of user login.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The res object.
 * @param {string} userid - The userid (req string)).
 * @param {string} password - The password (req string).
 */
app.post('/api/validatelogin',function(req,res){
    const { userid, password} = req.body;
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);
    res.redirect('/admin/dashboard.html');
});

/**
 * Handles the client login process .
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The resp object.
 * @param {string} userid - The userid (req string) .
 * @param {string} userpassword - The userpassword (req string) .
 */
app.post('/api/clientlogin',function(req,resp){
    const { userid, userpassword} = req.body;
    const  requestData = createLogObj(req);

    dbOps.logLogData(requestData);

    dbOps.authenticateUser(userid,userpassword).then((res) => {
        if (res){
            resp.json({loggedIn: true,clientId: res});
        } else {resp.json({loggedIn: false,clientId: 0})};
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

/**
 * Handles the creation of user login object and captures the data for dbms.
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The resp object.
 * @param {string} cuserid - The cuserid (req string).
 * @param {string } cnfemail - The cnfemail (req string).
 * @param {string } cpass - The cpass (req string).
 * @param {string } cnfpass - The cnfpass (req string).
 */
app.post('/api/createlogin',function(req,response){
    const { cuserid,cnfemail, cpass,cnfpass } = req.body;

    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData).then(() => {
        return;
    });

    dbOps.insertClientLogin(cuserid,cpass)
    .then((res) => {
        response.status = 200;
        response.json({message: 'success',Id:res});
    })
    .catch((err) => {
        dbOps.logSiteError(err);
        response.status(500).send('Internal Server Error');
    });
});

/**
 * Handles the request to reset a user password.
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The resp object.
 * @param {string} email - The email (req string).
 */
app.get('/api/passreset?',function(req,resp){
    const email = req.query.email;
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    dbOps.getDataByType('CBE',email).then((res) => {
        if(res){
            me.sendPassReset(email)
            .catch((err) => {
                dbOps.logSiteError(err);
                resp.status(500).json({ error: 'Internal Server Error' });
            });
        }
        else {
            resp.json({message:'failed'})
        }
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).json({ error: 'Internal Server Error' });
    });

    let redUrl = '/clientportal/passreset.html?email='+email;
    resp.redirect(redUrl);
    //'/clientportal/passreset.html?email=${email}'
});

/**
 * Handles the reset password request.
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The resp object.
 * @param {string } email - The cnfemail (req string).
 */
app.post('/api/passreset',function(req,resp){
    const email = req.body;
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    dbOps.getDataByType('CBE',{email:email.email}).then((res) => {
        if( typeof res[0] === 'undefined'){
            resp.json({message: 'failed'});
        }
        else {
            me.sendPassReset(email.email).then((req) =>{
                resp.json({message: 'An email has been sent to the provided email. Please check your email for password reset instructions.'});
            });
        }
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

/**
 * Handles the update password request.
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The resp object.
 * @param {string } resemail - The resemail (req string).
 * @param {string } cnfresetpass - The cnfresetpass (req string).
 * @param {string } cnfpass - The cnfpass (req string).
 */
app.post('/api/updatepass',function(req,resp){
    const { resemail,cnfresetpass, cnfpass } = req.body;
    
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    dbOps.resetPass(resemail,cnfresetpass).then((res) => {
        if(typeof res !== undefined){
            resp.json({message: 'success'});
        }
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

/**
 * Handles the request for a qoute.
 * 
 * @param {Object} req - The request object.
 * @param {Object} resp - The resp object.
 * @param {string} qemail - The qemail (req string).
 * @param {string } fname - The fname (req string).
 * @param {string } lname - The lname (req string).
 * @param {string } compname - The compname (req string).
 * @param {string } qphone - The qphone (req string).
 * @param {string } qservType - The qservType (req string).
 * @param {string } qdesc - The qdesc (req string).
 * @param {string } qext - The qext (req string).
 * @param {string } prefEmail - The prefEmail (req string).
 * @param {string } prefPhone - The prefPhone (req string).
 */
app.post('/api/submitquoterequest',async(req,response) => {
    const {qemail,fname,lname,compname,qphone,qservType,qdesc,qext,prefEmail,prefPhone}= req.body;
    let results;
    const pref =  (req.body.prefEmail === undefined)?req.body.prefPhone: req.body.prefEmail ;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let Id;
    let logId;


    const  requestData = createLogObj(req);

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
        dbOps.insertObjectToSql('CQ',qouteObj)
        .then((res) =>{
            if(!isNaN(res)){
                Id = res;
                me.sendQouteMail(qemail).then((req) =>{
                    dbOps.logLogData(requestData).catch((err) => {
                        response.status(600).send('Internal Server Error Has Occurred');
                    });
                }).then(() => {
                    me.sendEmailToCompAccount(qouteObj,'qoute',res).catch((err) => {
                        response.status(700).send('Internal Server Error Has Occurred');
                    });
                }).catch((err) => {
                    dbOps.logSiteError(err);
                    response.status(100).send('Internal Server Error Has Occurred \n'+err);
                });
            }else {
                msg = [{message:'There is already a record for this item..  '}]
            }
        })
        .then(() => {
            dbOps.logLogData(requestData)
            .then((res) => {
                logId = res.LogId;
            })
            .then(() => {
                response.json(msg);
            }).catch((err) => {
                dbOps.logSiteError(err);
                response.status(200).send('Internal Server Error Once Again\n'+err+'  \n'+JSON.stringify(requestData));
            });
        }).catch((err) => {
            dbOps.logSiteError(err);
            response.status(300).send('Internal Server Error For The Last TIme \n'+err);
        });
    }
});

/**
 * Handles the request for assistance .
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 * @param {string} hDesc - The qemail (req string).
 * @param {string } hCompName - The hCompName (req string).
 * @param {string } hFirst - The hFirst (req string).
 * @param {string } hLast - The hLast (req string).
 * @param {string } hEmail - The hEmail (req string).
 * @param {string } hPhone - The hPhone (req string).
 * @param {string } hExt - The hExt (req string).
 */
app.post('/api/requsthelp',function(req,response){
    const {hDesc,hCompName,hFirst,hLast,hEmail,hPhone,hExt}= req.body;
    let msg = [{message:'Your request for assistance has been sent. You shold recieve an email from us soon..  '}];

    const  requestData = createLogObj(req);

    const helpObj = {
        "CompanyName": hCompName,
        "FirstName": hFirst,
        "LastName": hLast,
        "EmailAddress": hEmail,
        "BusinessPhone": hPhone,
        "Extension":hExt,
        "Description":hDesc,
    };

    let recip = {
        recipientName: hFirst +' '+ hLast
    };

    dbOps.insertObjectToSql('CA',helpObj).then((res) => {
        if(!isNaN(res)){
             me.sendConHelpEmail(hEmail,recip).then((req) =>{
                 me.sendEmailToCompAccount(helpObj,'Help',hCompName.toString());
             }).then(() => {
                 dbOps.logLogData(requestData)
                 .then(() => {
                    response.json(msg);
                 }).catch((err) => {
                    dbOps.logSiteError(err);
                    response.status(500).send('Internal Server Error again \n'+err);
                });
             }).catch((err) => {
                dbOps.logSiteError(err);
                response.status(500).send('Internal Server Error one more time\n'+err);
            });
        }else {
             dbOps.logLogData(requestData)
             .then(() => {
                msg = [{message:'There is already a record for this item..  '}]
                response.json(msg);
             }).catch((err) => {
                dbOps.logSiteError(err);
                response.status(500).send('Internal Server Error last time \n'+err);
            });
        }
    });
});

/**
 * Handles the request for assistance .
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 * @param {string} email - The email (req string).
 * @param {string } phone - The phone (req string).
 * @param {string } firstname - The firstname (req string).
 * @param {string } compname - The compname (req string).
 * @param {string } lastname - The lastname (req string).
 */
app.post('/api/registerfree',function(req,resp) {
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
    me.createBody(aClient).then(res =>{
        let htmlBody = res;
        me.mailOptions(htmlBody,subject);
    }).then((err) => {
        if(!err){
            fm.createData(aClient).then((res,err) =>{
            fm.writeToRegister(res);
            });
        }
    }).then(() => {
        dbOps.logLogData(requestData);
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});


// POST route to handle the AJAX request
/**
 * Handles the request to get client profile.
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 * @param {string} clientId - The clientId (req string).
 */
app.post('/api/getclientprofile', (req, resp) => {
    const clientId = req.body.clientId; // Assuming the client ID is sent in the request body
    dbOps.getDataByType('CPBCID',{ClientId:clientId}).then((res) => {
        return res;
    }).then((res) =>{
        resp.json(res);
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

//getclientbillinginfo
/**
 * Handles the request to get client billing details.
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 * @param {string} clientId - The clientId (req string).
 */
app.post('/api/getclientbillinginfo', (req, resp) => {
    const clientId = req.body.clientId; // Assuming the client ID is sent in the request body
    dbOps.getDataByType('BINF',{clientid:clientId}).then((res) => {
        let parsObj = JSON.parse(res[0].BillingInfo);
        return parsObj[0];
    }).then((res) =>{
        resp.json(res);
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

//api/getclientinvoicedetailbyid
/**
 * Handles the request to get client invoice details.
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 * @param {string} clientId - The clientId (req string).
 */
app.post('/api/getclientinvoicedetailbyid', (req, resp) => {
    const clientId = req.body.clientId; // Assuming the client ID is sent in the request body
    let invObj = [];
    let parObj = [];

    dbOps.getDataByType('CBID',{clientid:clientId}).then((res) => {
        let parseData = JSON.parse(res[0].ClientById);
        let jsonObj = {CompanyName: parseData[0].CompanyName };

        invObj.push(jsonObj);
    }).then(() => {
        dbOps.getDataByType('BICI',{clientid:clientId}).then((res) => {
            // let parsObj = JSON.parse(res[0].BillInvClientId);
            JSON.parse(res[0].BillInvClientId).forEach(obj => {
                parObj.push(obj);  ;
            });

            invObj.push(parObj);
            return invObj;
        }).then((res) =>{
            resp.json(res);
        }).catch((err) => {
            dbOps.logSiteError(err);
            resp.status(500).send('Internal Server Error');
        });
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

/**
 * Handles the request to create client account details.
 * 
 * @param {Object} req - The request object.
 * @param {Object} response - The response object.
 * @param {string} clientId - The clientId (req string).
 */
app.post('/api/createacctdetail',(req,resp) => {
    dbOps.insertAccountDetail(req.body).then((res) => {
        if(res > 0){resp.json({message: 'success'})};
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

// app.post('/api/submitpayment', (req,resp) => {
// });

/**
 * Handles the creation of the request object for logging purposes
 *
 * @param {*} req
 * @return {*} 
 */
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

/**
 * Handles the parsing of the request object in order to create a logging object for db insertion purposes.
 *
 * @param {*} formData
 * @return {*} 
 */
function parseFormData(formData) {
    // Object to store parsed form data
    const parsedData = {};

    // Iterate over each key-value pair in the form data
    Object.entries(formData).forEach(([key, value]) => {
        // Add the key-value pair to the parsed data object
        parsedData[key] = value;
    });
    // Return the parsed form data
    return parsedData;
}

/**
 * Handles the App launch.
 * 
 * @param {Object} PORT - The PORT object.
 */
app.listen(PORT, () =>{
    debug('listening on port ${PORT}');
});