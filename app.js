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

//Error handling
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
//     console.log(`statusCode: ${res.statusCode}`);
  
//     res.on('data', (d) => {
//         console.log('post data \n'+JSON.stringify(d));
//     //   process.stdout.write(d);
//     });
// });

// // Create HTTPS server
// https.createServer(options, app).listen(443, () => {
//     console.log('Server running on https://localhost:443');
// });

// console.log('THE HTTPS REQUEST \n'+JSON.stringify(req));

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
        // console.log('successfully logged in...........');
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

app.get('/api/client/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/clientportal.html');
    }).catch((err) => {
        dbOps.logSiteError(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.get('/',function(req,res){
    try {
        const  requestData = createLogObj(req);
        dbOps.logLogData(requestData);
        res.render('admin.html');
    } catch (error) {
        // console.log('ERROR   \n'+error);
        dbOps.logSiteError(err);
        res.status(500).json({error: 'An error occurred while retireveing this page. Please try again later. '})
    }
});

app.get('/admin/',function(req,res){
    // console.log('here....................');
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);
    res.redirect('dashboard.html');
});

app.get('/', (req, res) => {
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);
    res.redirect('admin/dashboard.html');
});

// create browser cookie to store # of times client comes to site
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

app.get('/api/freeservicedata',function(req,resp){
    let freeserv = [];
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    // ch.getFreeServiceData().then(res => {
    //     return res;
    // }).then((res) =>{
    //     freeserv = res;
    //     resp.json(freeserv);
    // }).catch((err) => {
    //     dbOps.logSiteError(err);
    //     resp.status(500).json({ error: 'Internal Server Error' });
    // });
});

app.get('/api/instagram',function(req,response){
    // console.log('sending to instagram...............    '+req);
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData).then((res) =>{
        response.redirect(process.env.INST_URL);
    }).catch((err) => {
        dbOps.logSiteError(err);
        response.status(500).json({ error: 'Internal Server Error' });
    });
});

app.get('/api/facebook',function(req,response){
    // console.log('sending to facebook...............    '+req);
    // console.log('URL..................'+process.env.INSTAGRAM_URL);
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData).then((res) =>{
        response.redirect(process.env.FACEOOK_PAGE);
    }).catch((err) => {
        // console.log('AN ERROR ORRCURRED   \n'+err);
        dbOps.logSiteError(err);
        response.status(500).json({ error: 'Internal Server Error' });
    });
});

app.get('/api/linkedin',function(req,response){
    // console.log('sending to linkedin...............    '+req);
    // console.log('LINKEDIN URL..................'+process.env.LINKEDIN_URL);
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData).then((res) =>{
        response.redirect(process.env.LINKEDIN_URL);
    }).catch((err) => {
        dbOps.logSiteError(err);
        response.status(500).json({ error: 'Internal Server Error' });
    });
});

// Define API endpoint
app.get('/api/check-date', async(req, response) => {
    const startDate = new Date('2024-04-01');
    const endDate = new Date('2024-08-01'); // August 1, 2024
    let currentUTCDate = new Date(startDate.toISOString());
    let isBeforeCutoff;
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);
    // console.log('CHECKGIN DATE...............    ');
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

//clientportal 
app.get('/api/getdatarequest?',function(req,results){
    const id = req.query.id;
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    // console.log('id passed in header..........  '+id);

});

app.get('/clientportal',function(req,resp){
    const referrer = req.get('Referrer');
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    if (referrer && referrer.includes('passreset')) {
        const parsedUrl = new URL(referrer);
        const email = parsedUrl.searchParams.get('email');
        // console.log('Email:', email);
        dbOps.getDataByType('CBE',{email:email}).then((res) => {
            // console.log('RESPONSE \n'+res[0].ClientId);
            resp.redirect('clientportal.html?clientid='+res[0].ClientId);

        }).catch((err) => {
            dbOps.logSiteError(err);
            resp.status(500).json({ error: 'Internal Server Error' });
        });
    } else {
        resp.redirect('clientportal.html?clientid=0');

        // console.log('No referrer provided or referrer does not contain code');
        // Handle case where no referrer is provided or referrer does not contain 'code'
    }

    // resp.redirect('clientportal.html');
});

app.get('/api/passreset?',function(req,resp){
    const email = req.query.email;
    // console.log('GETTING PASSWORD REST REQUEST  \n'+email);
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);
    // console.log(email);

    me.sendPassReset(email).then((res) =>{
        // console.log('SENT PASSWORD RESET EMAIL   \n'+res);
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).json({ error: 'Internal Server Error' });
    });
    let redUrl = '/clientportal/passreset.html?email='+email;
    // console.log('REDIRECT URL       \n'+redUrl);
    res.redirect(redUrl);
    //'/clientportal/passreset.html?email=${email}'
});

// Define your API endpoint
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

app.get('/error',(req,res) => res.send('Eror logging in to Facebook'));

//POST REQUESTS
app.post('/api/validatelogin',function(req,res){
    const { userid, password} = req.body;
    // console.log(userid+'    '+password);
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);
    res.redirect('/admin/dashboard.html');
});

app.post('/api/clientlogin',function(req,resp){
    const { userid, userpassword} = req.body;
    // console.log(userid+'    '+userpassword);
    const  requestData = createLogObj(req);

    dbOps.logLogData(requestData);

    dbOps.authenticateUser(userid,userpassword).then((res) => {
        // console.log('RESPONSE \n'+res);
        if (res){
            resp.json({loggedIn: true,clientId: res});
        } else {resp.json({loggedIn: false,clientId: 0})};
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

app.post('/api/createlogin',function(req,response){
    const { cuserid,cnfemail, cpass,cnfpass } = req.body;

    const  requestData = createLogObj(req);
    // console.log('REQUEST DATA  \n'+JSON.stringify(requestData));
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

app.post('/api/passreset',function(req,resp){
    const email = req.body;
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    dbOps.getDataByType('CBE',{email:email.email}).then((res) => {
        // console.log('THE RESULTS CLIENT ID \n'+res[0]);
        if( typeof res[0] === 'undefined'){
            resp.json({message: 'failed'});
        }
        else {
            // console.log('EMAIL \n'+email.email)
            me.sendPassReset(email.email).then((req) =>{
                // console.log('SENT EMAIL  \n'+res);
                resp.json({message: 'An email has been sent to the provided email. Please check your email for password reset instructions.'});
                // console.log('SENT PASSWORD RESET EMAIL   \n'+res);
            });
        }
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

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
        // console.log('inserting qoute......................................................');
        dbOps.insertObjectToSql('CQ',qouteObj)
        .then((res) =>{
            console.log('RESULTS FROM INSERTING THE DATA INTO THE TABLE \n'+res);
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
                // console.log('sending email stuff');
                msg = [{message:'There is already a record for this item..  '}]
            }
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
            }).catch((err) => {
                dbOps.logSiteError(err);
                response.status(200).send('Internal Server Error Once Again\n'+err+'  \n'+JSON.stringify(requestData));
            });
        }).catch((err) => {
            dbOps.logSiteError(err);
            response.status(300).send('Internal Server Error For The Last TIme \n'+err);
        });
    }
    // console.log('MESSAGE....................           \n'+msg);
});

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
        // console.log('RESULTS FROM INSERTING THE DATA INTO THE TABLE \n'+res);
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
                //  console.log('sending email stuff');
                msg = [{message:'There is already a record for this item..  '}]
                response.json(msg);
             }).catch((err) => {
                dbOps.logSiteError(err);
                response.status(500).send('Internal Server Error last time \n'+err);
            });
        }
    });
});

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
        // console.log('results from create body    '+res);
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

app.post('/api/updatepass',function(req,resp){
    const { resemail,cnfresetpass, cnfpass } = req.body;
    
    const  requestData = createLogObj(req);
    dbOps.logLogData(requestData);

    dbOps.resetPass(resemail,cnfresetpass).then((res) => {
        // console.log('RESET CONPLETE   \n'+res);
        if(typeof res !== undefined){
            resp.json({message: 'success'});
        }
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

// POST route to handle the AJAX request
app.post('/api/getclientprofile', (req, resp) => {
    const clientId = req.body.clientId; // Assuming the client ID is sent in the request body
    // You can replace this with your actual data retrieval logic from the database
    dbOps.getDataByType('CPBCID',{ClientId:clientId}).then((res) => {
        return res;
    }).then((res) =>{
        // console.log("res                      \n"+JSON.stringify(res));
        resp.json(res);
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

//getclientbillinginfo
app.post('/api/getclientbillinginfo', (req, resp) => {
    const clientId = req.body.clientId; // Assuming the client ID is sent in the request body
    // You can replace this with your actual data retrieval logic from the database
    dbOps.getDataByType('BINF',{clientid:clientId}).then((res) => {
        let parsObj = JSON.parse(res[0].BillingInfo);
        return parsObj[0];
    }).then((res) =>{
        // console.log("res                      \n"+JSON.stringify(res));
        resp.json(res);
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

//api/getclientinvoicedetailbyid
app.post('/api/getclientinvoicedetailbyid', (req, resp) => {
    const clientId = req.body.clientId; // Assuming the client ID is sent in the request body
    let invObj = [];
    let parObj = [];

    dbOps.getDataByType('CBID',{clientid:clientId}).then((res) => {
        let parseData = JSON.parse(res[0].ClientById);
        let jsonObj = {CompanyName: parseData[0].CompanyName };

        invObj.push(jsonObj);
    }).then(() => {
        // You can replace this with your actual data retrieval logic from the database
        dbOps.getDataByType('BICI',{clientid:clientId}).then((res) => {
            // let parsObj = JSON.parse(res[0].BillInvClientId);
            JSON.parse(res[0].BillInvClientId).forEach(obj => {
                parObj.push(obj);  ;
            });

            invObj.push(parObj);
            // console.log(JSON.stringify(invObj));
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

app.post('/api/createacctdetail',(req,resp) => {
    // console.log('RESPONSE BODY   \n'+JSON.stringify(req.body));
    // let formData = req.body;

    dbOps.insertAccountDetail(req.body).then((res) => {
        // console.log('RESULTS AFTER INSRTING DETAILS \n'+res);
        if(res > 0){resp.json({message: 'success'})};
    }).catch((err) => {
        dbOps.logSiteError(err);
        resp.status(500).send('Internal Server Error');
    });
});

app.post('/api/submitpayment', (req,resp) => {
    // console.log('FORM DATA \n'+JSON.stringify(req.body));
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

function parseFormData(formData) {
    // Object to store parsed form data
    const parsedData = {};

    // Iterate over each key-value pair in the form data
    Object.entries(formData).forEach(([key, value]) => {
        // Add the key-value pair to the parsed data object
        parsedData[key] = value;
    });
// console.log(JSON.stringify(parsedData));
    // Return the parsed form data
    return parsedData;
}

// dbOps.getDataByType('CPBCID',{ClientId:2}).then((res) => {
//     console.log("res                      \n"+JSON.stringify(res));
// });

app.listen(PORT, () =>{
    debug('listening on port ${PORT}');
});