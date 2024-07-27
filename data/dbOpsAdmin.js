const adminConfig                = require('./dbConfig').adminConfig;
const recJson = {};
const { BREADCRUMB_KEY } = require('instagram-private-api/dist/core/constants');
const sql = require('mssql');


const logLogData = async(log) => {
        
    const adminDbConfig = {
        user: process.env.ADMIN_DB_USERNAME,
        password: process.env.ADMIN_DB_PASSWORD,
        server: process.env.ADMIN_DB_SERVER,
        database: process.env.ADMIN_DB_NAME,
        options: {
            encrypt: false, // If you're using Windows Azure
        },
    };
    // Connect to the database
    await sql.connect(adminDbConfig);

    const request = new sql.Request();
    let result;
console.log(request);
    try {
            // Add parameters to the request
            request.input('Timestamp', sql.Date, log.Timestamp);
            request.input('IPAddress', sql.VarChar(50), log.IPAddress);
            request.input('RequestURL', sql.VarChar(255), log.RequestURL);
            request.input('HttpMethod', sql.VarChar(10), log.HttpMethod);
            request.input('StatusCode', sql.Int, log.StatusCode);
            request.input('ResponseSize', sql.VarChar(3), log.ResponseSize);
            request.input('UserAgent', sql.VarChar(255), log.UserAgent);
            request.input('Referer', sql.VarChar(255), log.Referer);
            request.input('ErrorMsg', sql.VarChar(500), log.ErrorMsg);
            request.input('QueryString', sql.VarChar(500), JSON.stringify(log.QueryString));


            try {
                result = await request.execute('uspInsertWebsiteLog');
            } catch (error) {
                console.log('AN ERROR OCCURRED:    \N'+error);
            }finally{
                await sql.close();
            }
            // Execute the stored procedure
            result = await request.execute('uspInsertWebsiteLog');
        
    } catch (error) {
        // console.log('Error has occurred   '+error);
    }
    await sql.close();
}

module.exports = {
    logLogData
}
