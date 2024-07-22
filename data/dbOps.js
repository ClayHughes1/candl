
const clientConfig               = require('./dbConfig').clientConfig;
const adminConfig                = require('./dbConfig').adminConfig;
const sql = require('mssql');
const bcrypt = require('bcrypt');

let contactId;
let CustomerAddressId;
let ClientId;
let Id;
let logId;



// Configuration for the first database (CLE_Client)
const clientDbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
      encrypt: false, // If you're using Windows Azure
      enableArithAbort: true // Important for SQL Server
    },
    pool: {
      max: 15, // Maximum number of connections in the pool
      min: 2,  // Minimum number of connections in the pool
      idleTimeoutMillis: 30000 // How long a connection is allowed to be idle before being closed
    }
};
  
// Configuration for the second database (CLE_Admin)
const adminDbConfig = {
    user: process.env.ADMIN_DB_USERNAME,
    password: process.env.ADMIN_DB_PASSWORD,
    server: process.env.ADMIN_DB_SERVER,
    database: process.env.ADMIN_DB_NAME,
    options: {
      encrypt: false, // If you're using Windows Azure
      enableArithAbort: true // Important for SQL Server
    },
    pool: {
      max: 15, // Maximum number of connections in the pool
      min: 2,  // Minimum number of connections in the pool
      idleTimeoutMillis: 30000 // How long a connection is allowed to be idle before being closed
    }
};

// Create a connection pool for CLE_Client
const clientPool = new sql.ConnectionPool(clientDbConfig);

// Create a connection pool for CLE_Admin
const adminPool = new sql.ConnectionPool(adminDbConfig);

/**
 *Executes SQL stored procedure based on request type and returns record Id from specific table 
 *
 * @param {*} idType
 * @param {*} object
 * @return {*} SelectedId
 */
const getId = async(idType,object) => {
    await clientPool.connect()
    // Connect to the database
    const request = await clientPool.request();
    console.log(JSON.stringify(object));
    try {
        // idType = 'CQ';

        let dbParams;

        switch(idType){
            case 'C':
                //Client
                request.input('srchType', sql.VarChar(50),'C');
                dbParams = {srchValue1:object.FirstName,srchValue2:object.LastName,srchValue3:object.CompanyName,srchValue4:NULL,srchStart:NULL,srchEnd:NULL}
                break;
            case 'ICA':
                //Client address
                request.input('srchType', sql.VarChar(50),'ICA');
                dbParams = {srchValue1:object.FirstName,srchValue2:object.LastName,srchValue3:object.CompanyName,srchValue4:NULL,srchStart:NULL,srchEnd:NULL}

                break;
            case 'ICC':
                //Client contact
                request.input('srchType', sql.VarChar(50),'ICC');
                dbParams = {srchValue1:object.FirstName,srchValue2:object.LastName,srchValue3:object.CompanyName,srchValue4:NULL,srchStart:NULL,srchEnd:NULL}

                break;
            case 'CL':
                //Client Login
                request.input('srchType', sql.VarChar(50),'CL');
        
                break;
            case 'CS':
                //Company services
                request.input('srchType', sql.VarChar(50),'CS');
        
                break;
            case 'CO':
                //Client offer
                request.input('srchType', sql.VarChar(50),'CO');
        
                break;
            case 'CQ':
                //Client qoute
                // console.log('GETTING THE QOUTE ID ......................... \n');
                request.input('srchType', sql.VarChar(50),'CQ');
                dbParams = {
                    srchValue1:object.EmailAddress,
                    srchValue2:object.FirstName,
                    srchValue3:object.LastName,
                    srchValue4:object.CompanyName,
                    srchStart:new  Date(),
                    srchEnd:new  Date()
                };
                break;
            case 'CA':
                console.log('does ca id exist');
                //Client Assistance Request
                request.input('srchType', sql.VarChar(50),'CA');
                dbParams = {
                    srchValue1:object.EmailAddress,
                    srchValue2:object.FirstName,
                    srchValue3:object.LastName,
                    srchValue4:object.CompanyName,
                    srchStart:new  Date(),
                    srchEnd:new  Date()
                };

                console.log('dbparams   \n'+JSON.stringify(dbParams));
                break;
            default:
                break;
        }

        request.input('srchValue1', sql.VarChar(50), dbParams.srchValue1);
        request.input('srchValue2', sql.VarChar(50), dbParams.srchValue2);
        request.input('srchValue3', sql.VarChar(50), dbParams.srchValue3);
        request.input('srchValue4', sql.VarChar(50), dbParams.srchValue4);
        request.input('srchStart', sql.Date, dbParams.srchStart);
        request.input('srchEnd', sql.Date, dbParams.srchEnd);


        result = await request.execute('GetIdFromTables');
        console.log(request.parameters);
        // console.log('THE RESULTS ARE ...........   \n'+JSON.stringify(result.recordsets[0][0].SelectedID));
        return result.recordsets[0][0].SelectedID;
    }catch(err){
        await logSiteError(err);
        throw err;
    }
}

//Client db opereations
/**
 *Execute SQL stored procedure for special offer object
 *
 * @return {*} special offer object
 */
const getClient = async() =>{
    try{

        const request = await clientPool.connect();
        const result  = await request.query('uspGetSpecialOfferAsJSON');

        // console.log('Client Results...................  \n'+JSON.stringify(result));

        // return userMap;

    }catch(err)
    {
        await logSiteError(err);
        throw err;
    }
}

/**
 *Execute SQL stored procedure to get client object
 *
 * @return {*} 
 */
const getClientsAsJSON = async() =>{
    try {
        const request = await clientPool.connect();
        const result  = await request.query('uspGetClientsAsJSON');
        // Return the data as JSON object
        // console.log('records     \n'+JSON.stringify(result.recordsets[0]));
    } catch (err) {
        await logSiteError(err);
        throw err;
    } finally {
        // Close the database connection
        await clientPool.close();
        return await result
    }
}

// Async function to execute stored procedure and return JSON
/**
 *Execute specific SQL stored procedure based on data request
 *
 * @param {*} storedProcedureName
 * @param {*} [params={}]
 * @return {*} 
 */
const executeStoredProcedure = async(storedProcedureName, params = {}) =>{
    await clientPool.connect();
    const request = clientPool.request();

    try {
        // Add parameters to the request
        if(params){
            for (const paramName in params) {
                request.input(paramName, params[paramName]);
            }
        }
        // Execute the stored procedure
        const result = await request.execute(storedProcedureName);

        // Return the result set as JSON
        return result.recordset;
    } catch (err) {
        await logSiteError(err);
        throw err;
    }
}

//Get SQL functionality
/**
 *Execute SQL stored procedure based on request data object
 *
 * @param {*} tyepData
 * @param {*} params
 * @return {*} 
 */
const getDataByType = async(tyepData,params) => {
    let results;

    try {
        switch(tyepData){
            case 'CA':
                return executeStoredProcedure('uspGetCustomerAddressAsJSON');
                break;
            case 'CBBDR':
                return executeStoredProcedure('uspGetCustomerBillingInfoByDateRangeAsJSON', { startDate, endDate });
                break;
            case 'CBI':
                return executeStoredProcedure('uspGetCustomerBillingInformationAsJSON');
                break;
            case 'OR':
                return executeStoredProcedure('uspGetOfferRateAsJSON');
                break;
            case 'PS':
                return executeStoredProcedure('uspGetPaymentStatusAsJSON');
                break;
            case 'QO':
                return executeStoredProcedure('uspGetQuoteInformationAsJSON');
                break;
            case 'QIBD':
                return executeStoredProcedure('uspGetQuoteInformationByDateRangeAsJSON', { startDate, endDate });
                break;
            case 'SO':
                return executeStoredProcedure('uspGetSpecialOfferAsJSON');
                break;
            case 'SODR':
                results = await executeStoredProcedure('uspGetSpecialOfferByDateRangeAsJSON', {StartDate:params.StartDate,EndDate: params.EndDate });
                break;
            case 'SOBD':
                return executeStoredProcedure('uspGetSpecialOffersByDate', { date });
                break;
            case 'QBCID':
                return executeStoredProcedure('uspGetAllQouteDataByClientIdInJSON', { clientid: clientId });
                break;
            case 'BI':
                return executeStoredProcedure('uspGetBillingInvoiceAsJSON');
                break;
            case 'BINF':
                return executeStoredProcedure('uspGetClientBillingInfoById', params);
                break;
            case 'BICI':
                return executeStoredProcedure('uspGetBillingInvoiceByClientID', params);
                //{ clientid: clientid }
                break;
            case 'BIBDR':
                return executeStoredProcedure('uspGetBillingInvoiceByDateRangeAsJSON', { startdate: startdate, enddate: enddate });
                break;
            case 'BIBIVD':
                return executeStoredProcedure('uspGetBillingInvoiceByInvoiceId', { Id: Id });
                break;
            case 'BIBPS':
                return executeStoredProcedure('uspGetBillingInvoicesByPaymentStatus', {status : status });
                break;
            case 'BIPSID':
                return executeStoredProcedure('uspGetBillingInvoicesByPaymentStatusID', { statusid: statusid });
                break;
            case 'CBID':
                return executeStoredProcedure('uspGetClientByIdAsJSON', params);
                break;
            case 'CC':
                return executeStoredProcedure('uspGetClientContactAsJSON');
                break;
            case 'CCBE':
                return executeStoredProcedure('uspGetClientContactByEmailAsJSON', { email: email });
                break;
            case 'CCBI':
                return executeStoredProcedure('uspGetClientContactByIdAsJSON', { id: id });
                break;
            case 'CDBCID':
                return executeStoredProcedure('uspGetClientDataByClientId', { clientid: clientid });
                break;
            case 'CLBE':
                return executeStoredProcedure('uspGetClientLogByEmailAsJSON', { email: email });
                break;
            case 'CLBID':
                return executeStoredProcedure('uspGetClientLogByIdAsJSON', { id: id });
                break;
            case 'CL':
                return executeStoredProcedure('uspGetClientLoginAsJSON');
                break;
            case 'CLBCI':
                return executeStoredProcedure('uspGetClientLoginByClientIdAsJSON', { clientid: clientid });
                break;
            case 'C':
                return executeStoredProcedure('uspGetClientsAsJSON');
                break;
            case 'CSOBCI':
                return executeStoredProcedure('uspGetClientSpecialOfferByClientIdAsJSON', { clientid: clientid});
                break;
            case 'CSOBDR':
                return executeStoredProcedure('uspGetClientSpecialOfferByDateRangeAsJSON', { startdate: startdate, enddate: enddate });
                break;
            case 'CSOBID':
                return executeStoredProcedure('uspGetClientSpecialOfferByIdAsJSON', { id: id});
                break;
            case 'CSOBOID':
                return executeStoredProcedure('uspGetClientSpecialOfferByOfferIdAsJSON', { offerid: offerid });
                break;
            case 'CPBCID':
                return executeStoredProcedure('upsGetClientProfileById', params);
                break;
            case 'COU':
                return executeStoredProcedure('uspGetCountryCodesAsJSON');
                break;
            case 'CBE':
                return executeStoredProcedure('uspGetClientIdByEmail',params);
                break;
            default:
                break;
        }
        return results;
    } catch (err) {
        await logSiteError(err);
        throw err;
    }
}

// //Insert SQL funtionality
/**
 *Execute SQL stored procedure to insert data based on data type
 *
 * @param {*} typeData
 * @param {*} object
 * @return {*} 
 */
const insertObjectToSql = async(typeData,object) => {
    await clientPool.connect();
    // Connect to the database
    const request = await clientPool.request();

    let Id;
    let result;
    try{
        const id = await getId(typeData,object);
        console.log('ID   \n'+id);
        if(id > 0)
        {
            return 'There is  already a record for this item';
        }
        else{
            switch(typeData)
            {
                case 'IBI':
                    console.log('inserting the data ');
                    // Add parameters to the request
                    request.input('ClientID', sql.Int, object.clientID);
                    request.input('InvoiceDate', sql.Date, object.invoiceDate);
                    request.input('DueDate', sql.Date, object.dueDate);
                    request.input('Amount', sql.Decimal(18, 2), object.amount);
                    request.input('CurBalance', sql.Decimal(18, 2), object.curBalance);
                    request.input('AdjustBalance', sql.Decimal(18, 2), object.adjustBalance);
                    request.input('StatusId', sql.Int, object.statusId);
                    request.input('PaymentDate', sql.Date, object.paymentDate);
                    request.input('Notes', sql.Text, object.notes);
                    result = await request.execute('EXEC uspInsertIntoBillingInvoice');
                    break;
                case 'ICL':
                    // Add parameters to the request
                    request.input('FirstName', sql.VarChar(100), object.firstName);
                    request.input('LastName', sql.VarChar(100), object.lastName);
                    request.input('CompanyName', sql.VarChar(255), object.companyName);
                    request.input('ClientContactId', sql.Int, contactId);
                    request.input('CustomerAddressId', sql.Int, CustomerAddressId);
                    request.input('DateCreated', sql.Date, object.DateCreated);

                    // Execute the stored procedure
                    result = await request.execute('uspInsertIntoClient');
                    ClientId = result.recordsets[0][0].ClientId
                    break;
                case 'ICA':
                    // Add parameters to the request
                    request.input('AddressLine1', sql.VarChar(255), object.AddressLine1);
                    request.input('AddressLine2', sql.VarChar(255), object.AddressLine2);
                    request.input('City', sql.VarChar(100), object.City);
                    request.input('State', sql.VarChar(100), object.State);
                    request.input('ZipCode', sql.VarChar(20), object.ZipCode);
                    request.input('CountryCodeId', sql.VarChar(3), object.CountryCodeId);
                    request.input('DateCreated', sql.Date, object.DateCreated);

                    // Execute the stored procedure
                    result = await request.execute('uspInsertIntoCustomerAddress');
                    Id = result.recordsets[0][0].Address;
                    break;
                case 'ICC':
                    // Add parameters to the request
                    request.input('EmailAddress', sql.VarChar(255), object.EmailAddress);
                    request.input('BusinessPhone', sql.VarChar(20), object.BusinessPhone);
                    request.input('PersonalPhone', sql.VarChar(20), object.PersonalPhone);
                    request.input('CellPhone', sql.VarChar(20), object.CellPhone);
                    request.input('ContactPreference', sql.VarChar(50), object.ContactPreference);
                    request.input('Extension', sql.VarChar(10), object.Extension);
                    request.input('CreatedDate', sql.VarChar(10), object.CreatedDate);

                    result = await request.execute('uspInsertIntoClientContact');
                    contactId = result.recordsets[0][0].ContactId;
                    break;
                case 'CQ':
                    // Input parameters for the stored procedure
                    request.input('ServiceTypeId', sql.Int, object.ServiceTypeId);
                    request.input('ProjectDescription', sql.NVarChar, object.ProjectDescription);
                    request.input('EstimatedCost', sql.Decimal, object.EstimatedCost);
                    request.input('EstimatedTimeline', sql.NVarChar, object.EstimatedTimeline);
                    request.input('AdditionalNotes', sql.NVarChar, object.AdditionalNotes);
                    request.input('DateCreated', sql.DateTime, object.DateCreated);
                    request.input('CompanyName', sql.NVarChar, object.CompanyName);
                    request.input('FirstName', sql.NVarChar, object.FirstName);
                    request.input('LastName', sql.NVarChar, object.LastName);
                    request.input('EmailAddress', sql.NVarChar, object.EmailAddress);
                    request.input('BusinessPhone', sql.NVarChar, object.BusinessPhone);
                    request.input('ContactPreference', sql.NVarChar, object.ContactPreference);
                    request.input('Extension', sql.NVarChar, object.Extension);

                    result = await request.execute('uspInsertIntoQuoteInformation');
                    Id = result.recordsets[0][0].Id;
                    break;
                case 'CA':
                    // Input parameters for the stored procedure
                    request.input('CompanyName', sql.NVarChar, object.CompanyName);
                    request.input('FirstName', sql.NVarChar, object.FirstName);
                    request.input('LastName', sql.NVarChar, object.LastName);
                    request.input('EmailAddress', sql.NVarChar, object.EmailAddress);
                    request.input('BusinessPhone', sql.NVarChar, object.BusinessPhone);
                    request.input('Description', sql.NVarChar, object.Description);
                    request.input('Extension', sql.NVarChar, object.Extension);

                    result = await request.execute('uspInsertIntoClientAssist');
                    Id = result.recordsets[0][0].Id;
                    break;
    
                default:
                    break;
            }
        }
        return Id;
    }catch(err){
        await logSiteError(err);
        throw err;
    }
}

/**
 *Execute SQL stored procedure to insret client account details
 *
 * @param {*} frnData
 * @return {*} 
 */
const insertAccountDetail = async(frnData) => {
    await clientPool.connect();
    // Connect to the database
    const request = await clientPool.request();

    try {
        // Add input parameters for each value
        request.input('FirstName', sql.NVarChar(50), frnData.cfirstName);
        request.input('LastName', sql.NVarChar(50), frnData.clastName);
        request.input('CompanyName', sql.NVarChar(100), frnData.ccompanyname);
        request.input('EmailAddress', sql.NVarChar(100), frnData.cemailaddress);
        request.input('BusinessPhone', sql.NVarChar(20), frnData.cbusinessphone);
        request.input('PersonalPhone', sql.NVarChar(20), frnData.cpersonalphone);
        request.input('CellPhone', sql.NVarChar(20), frnData.ccellphone);
        request.input('ContactPreference', sql.NVarChar(50), frnData.cpref);
        request.input('Extension', sql.NVarChar(10), frnData.cextension);
        request.input('AddressLine1', sql.NVarChar(100), frnData.caddressline1);
        request.input('AddressLine2', sql.NVarChar(100), frnData.caddressline2);
        request.input('City', sql.NVarChar(50), frnData.ccity);
        request.input('State', sql.NVarChar(50), frnData.cstate);
        request.input('ZipCode', sql.NVarChar(20), frnData.czipcode);
        request.input('CountryCodeId', sql.Int, frnData.ccountry);
        request.input('ClientLogId', sql.Int, frnData.clientId);

        const result = await request.execute('uspInsertClientAndContactDetails');
        return result.recordset.map(item => item.Id);
    } catch (err) {
        await logSiteError(err);
        throw err;
    }
}

/**
 *Execute SQL stored procedure to update specific data object based on request
 *
 * @param {*} type
 * @param {*} params
 */
const updateSqlObject = async(type,params) => {
    let results;
    try {

    } catch (err) {
        await logSiteError(err);
        throw err;
    }

}

/**
 *Execute SQL stored procedure to updpate password 
 *
 * @param {*} username
 * @param {*} newpass
 * @return {*} 
 */
const resetPass = async(username, newpass) => {
    await clientPool.connect();
    // Connect to the database
    const request = await clientPool.request();

    try {
        const encryptedPassword = await encryptPassword(newpass);
       
        request.input('UserEmail', sql.VarChar, username);
        request.input('NewUserPassword', sql.VarChar, encryptedPassword);
        const result = await request.execute('uspUpdateClientLoginPassByEmail');
        return result.recordsets[0][0].ID; 
    } catch (err) {
        await logSiteError(err);
        throw err;
    }
}

/**
 *Execute SQL stored procedure to query client password for login validation
 *
 * @param {*} email
 * @return {*} 
 */
const getClientPassword = async(email) => {
    await clientPool.connect();
    // Connect to the database
    let request = await clientPool.request();

    try {
        request.input('username', sql.VarChar, email);
        const result = await request.execute('uspGetClientPasswordByUserName');
        return JSON.parse(result.recordsets[0][0].ClientPass).map(item => item.userPassword);
    } catch (err) {
        await logSiteError(err);
        throw err;
    }
}

/**
 *Execute SQL stored procedure to create client log in data
 *
 * @param {*} username
 * @param {*} password
 * @return {*} 
 */
const insertClientLogin = async(username,password) => {
    await clientPool.connect();
    // Connect to the database
    const request = await clientPool.request();
    try{
        const encryptedPassword = await encryptPassword(password);
        request.input('username', sql.VarChar, username);
        request.input('userpassword', sql.VarChar, encryptedPassword);
        const result = await request.execute('uspInsertIntoClientLogin');
        return result.recordset.map(item => item.Id);
    } catch (err) {
        await logSiteError(err);
        throw err;
    }
}

/**
 *Execute SQL stored procedure to authenticate user during login process
 *
 * @param {*} username
 * @param {*} password
 * @return {*} 
 */
const authenticateUser = async(username,password) => {
    console.log(username+'              '+password);
    await clientPool.connect();
    // Connect to the database
    const request = await clientPool.request();
    try {
        request.input('username', sql.VarChar, username);
        const result = await request.execute('uspGetClientPasswordByUserName');
        const passJson = JSON.parse(result.recordsets[0][0].ClientPass).map(item => item.userPassword);
        if (result.recordset.length === 0) {
            return false; // User not found
        }

        const encryptedPassword = passJson.toString().trim();
        const isMatch = await decryptPassword(encryptedPassword, password.trim());
        if(isMatch){
            return getClientIdByEmail(username);
        }
    } catch (err) {
        await logSiteError(err);
        return 0;
    }
}

//Admin db operations
/**
 *Execute SQL stored procedure to get site logs
 *
 * @return {*} 
 */
const getSiteLogs = async() =>{
    let result;
    try{
        const request = await adminPool.connect();
        result  = await request.query('uspGetWebsiteLogData');
    }catch(err)
    {
        await logSiteError(err);
    }finally{
        await adminPool.close();
        return  await result;
    }
}

/**
 *Execute SQL stored procedure to ccreate site log record in db
 *
 * @param {*} log
 * @return {*} 
 */
const logLogData = async(log) => {

    // Connect to the database
    await adminPool.connect()
    const request = await adminPool.request();
    let result;
    try {
            // Add parameters to the request
            request.input('Timestamp', sql.Date, new Date());
            request.input('IPAddress', sql.VarChar(50), log.IPAddress);
            request.input('RequestURL', sql.VarChar(255), log.RequestURL);
            request.input('HttpMethod', sql.VarChar(10), log.HttpMethod);
            request.input('StatusCode', sql.Int, log.StatusCode);
            request.input('ResponseSize', sql.VarChar(3), log.ResponseSize);
            request.input('UserAgent', sql.VarChar(255), log.UserAgent);
            request.input('Referer', sql.VarChar(255), log.Referer);
            request.input('ErrorMsg', sql.VarChar(500), log.ErrorMsg);
            request.input('QueryString', sql.VarChar(500), JSON.stringify(log.QueryString));
            
            result  = await request.execute('uspInsertWebsiteLog');
            return await result.recordsets[0][0];

    } catch (err) {
        await logSiteError(err);
        throw err;
    }
}

/**
 *Execute SQL stored procedure to create and insert site error log into db
 *
 * @param {*} errObj
 */
const logSiteError = async(errObj) => {
    await adminPool.connect()
    const request = await adminPool.request();
    try {
        request.input('ErrorCode', sql.Int, errObj.code);
        request.input('ErrorMessage', sql.VarChar(25), errObj.message);
        request.input('ErrorDetails', sql.VarChar(255), errObj.stack.toString());
        
        await request.execute('uspInsertWebsiteErrorLog');

    } catch (err) {
        console.log('Error \n'+err);
    }
}

/**
 *Execute SQL stored procedure to capture site visitor log into db
 *
 * @param {*} IPAddress
 * @param {*} PageVisited
 */
const insertVisit = async(IPAddress,PageVisited) => {
    await adminPool.connect()
    const request = await adminPool.request();
    try {
        request.input('PageVisited', sql.VarChar(255), PageVisited);
        request.input('IPAddress', sql.VarChar(50), IPAddress);

        result  = await request.execute('uspInsertWebSiteVisit');
    } catch (err) {
        await logSiteError(err);
        throw err;
    }

}

// Function to encrypt the password
/**
 *Performs user password encryption prior to db insertion
 *
 * @param {*} password
 * @return {*} 
 */
async function encryptPassword(password) {
   try {
    const saltRounds = 10; // Number of salt rounds for bcrypt
    return bcrypt.hash(password, saltRounds);

   } catch (err) {
    await logSiteError(err);
    throw err;
   }
}
// Function to decrypt the password
/**
 *Performs decryption process for site user password to validate user login data
 *
 * @param {*} encryptedPassword
 * @param {*} userPassword
 * @return {*} 
 */
async function decryptPassword(encryptedPassword, userPassword) {
    try {
        let answer = await bcrypt.compare(userPassword, encryptedPassword);
        return answer;
    } catch (err) {
        await logSiteError(err);
        throw err;
    }
    //bcrypt.compare(userPassword, encryptedPassword);
}

/**
 *Execute SQL stored procedure to get client id by email
 *
 * @param {*} username
 * @return {*} 
 */
async function getClientIdByEmail(username){
    await clientPool.connect();
    // Connect to the database
    const request = await clientPool.request();
    try {
        request.input('email', sql.VarChar, username);
        const result = await request.execute('uspGetClientIdByEmail');
        const clientId = result.recordsets[0];
        return JSON.stringify(clientId[0].ClientId);
    } catch (err) {
        await logSiteError(err);
        return 0;
    }
}

module.exports = {
    authenticateUser,
    decryptPassword,
    encryptPassword,
    getClient,
    getSiteLogs,
    getClientsAsJSON,
    getDataByType,
    getClientPassword,
    insertObjectToSql,
    insertVisit,
    insertClientLogin,
    insertAccountDetail,
    logLogData,
    logSiteError,
    resetPass,
    updateSqlObject
}