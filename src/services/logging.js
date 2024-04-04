require('dotenv').config();

const createLogData = async(req,err) => {
    console.log('Request JSON\n'+req);
let reqData;
if(err){
    console.log('We have received an error     '+err);
        reqData = {
            Timestamp: new Date(),
            IPAddress: req.ip, // Get IP address of the client
            RequestURL: req.url,
            HttpMethod: req.method,
            StatusCode: req.statusCode,
            ResponseSize: req.ResponseSize,
            UserAgent: req.get('user-agent'), // Get user-agent header
            Referer: req.get('referer'), // Get referer header
            ErrorMsg: err,
            QueryString: req.body
        };
    }
    else 
    {
        console.log('We are creating the request data object');
        reqData = {
            Timestamp: new Date(),
            IPAddress: req.ip, // Get IP address of the client
            RequestURL: req.url,
            HttpMethod: req.method,
            StatusCode: req.statusCode,
            ResponseSize: req.ResponseSize,
            UserAgent: req.get('user-agent'), // Get user-agent header
            Referer: req.get('referer'), // Get referer header
            ErrorMsg: err,
            QueryString: req.body
        };
    }
    console.log('Here is the request data object............    \n'+JSON.stringify(reqData));
    return reqData;
}

module.exports = {
    createLogData
}