
const clientConfig               = require('./dbConfig').clientConfig;
const adminConfig                = require('./dbConfig').adminConfig;
const sql = require('mssql');

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

const getId = async(idType,object) => {
    // console.log('ID TYPE   \n'+idType);
    await clientPool.connect()
    // Connect to the database
    const request = await clientPool.request();
    try {
        idType = 'CQ';

        object = {
            srchValue1:'candl.ent.email@canl-enterprises.com',
            srchValue2:'Clay',
            srchValue3:'Hughes',
            srchValue4:'The Company',
            srchStart:new  Date(),
            srchEnd:new Date()
        };

        switch(idType){
            case 'C':
                //Client
                request.input('srchType', sql.VarChar(50),'C');
                break;
            case 'ICA':
                //Client address
                request.input('srchType', sql.VarChar(50),'ICA');
                break;
            case 'ICC':
                //Client contact
                request.input('srchType', sql.VarChar(50),'ICC');
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
                break;
            case '':
                break;
            default:
                break;
        }

        request.input('srchValue1', sql.VarChar(50), object.srchValue1);
        request.input('srchValue2', sql.VarChar(50), object.srchValue2);
        request.input('srchValue3', sql.VarChar(50), object.srchValue3);
        request.input('srchValue4', sql.VarChar(50), object.srchValue4);
        request.input('srchStart', sql.Date, object.srchStart);
        request.input('srchEnd', sql.Date, object.srchEnd);


        result = await request.execute('GetIdFromTables');
        // console.log('THE RESULTS ARE ...........   \n'+JSON.stringify(result.recordsets[0][0].SelectedID));
        return result.recordsets[0][0].SelectedID;
    }catch(err){
        // console.log('an error has occurred     '+err);
    }finally{
        // await clientPool.close();
    }
}

// //Client db opereations
const getClient = async() =>{
    try{

        const request = await clientPool.connect();
        const result  = await request.query('uspGetSpecialOfferAsJSON');

        // console.log('Client Results...................  \n'+JSON.stringify(result));

        // return userMap;

    }catch(err)
    {
        console.error("an error occurred while trying to connect ot the db server  "+err)
    }finally{
        await clientPool.close();
    }
}

const getClientsAsJSON = async() =>{
    try {
        const request = await clientPool.connect();
        const result  = await request.query('uspGetClientsAsJSON');
        // Return the data as JSON object
        // console.log('records     \n'+JSON.stringify(result.recordsets[0]));
    } catch (err) {
        console.error('Error occurred:', err);
        throw err; // Propagate the error
    } finally {
        // Close the database connection
        await clientPool.close();
        return await result
    }
}

// Async function to execute stored procedure and return JSON
const executeStoredProcedure = async(storedProcedureName, params = {}) =>{
    console.log('params........   '+JSON.stringify(params));
    await clientPool.connect();
    const request = clientPool.request();

    try {
        // Connect to the database
        // await sql.connect(clientDbConfig);
        // Create a new request object
        // const request = new sql.Request();

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
        // Handle errors
        console.error('Error occurred:', err);
        throw err; // Propagate the error
    }
    finally{
        await clientPool.close();
    }
    // return await result.recordset;
}

// //Get SQL functionality
const getDataByType = async(tyepData,params) => {
    // console.log('type of data........    '+tyepData);
    // console.log('data........    '+JSON.stringify(params));
    let results;

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
            return executeStoredProcedure('uspGetClientByIdAsJSON', { Id: Id });
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
        default:
            break;
    }
    return results;
}

// //Insert SQL funtionality
const insertObjectToSql = async(typeData,object) => {
    await clientPool.connect()
    // Connect to the database
    const request = await clientPool.request();

    let Id;
    let result;
    try{
        const id = await getId('CQ');

        // console.log('THERE IS AN ID PRESENT               \n'+id);
        
        if(id > 0)
        {
            return 'There is  already a record for this item';
        }
        else{
            // console.log('NO ID IS PRESENT SO WE ARE INSERTING DATA \n');
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
                    // return executeStoredProcedure('InsertIntoBillingInvoice',request);
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
                    // console.log(JSON.stringify(ClientId));
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
                    // console.log('Address Id............   \n'+JSON.stringify(result));

                    // console.log('Address Id............   \n'+addrId);
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
                    // console.log('Contact Id............   \n'+contactId);

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

                    // console.log('THe request object...........              \n'+request);
                    result = await request.execute('uspInsertIntoQuoteInformation');
                    Id = result.recordsets[0][0].Id;
// console.log("THIS IS HTE ID    \n"+Id);
                    break;
                default:
                    break;
            }
        }
        // Close the database connection
        // await sql.close();
        // Return success message or any other data
        // return await result;
        return Id;
        //result.recordsets[0][0];

    }catch(err){
        console.log('an error has occurred     '+err);
    }finally{
        // await clientPool.close();
    }
    // return await result.recordsets[0][0];
}

const updateSqlObject = async() => {

}

// //Admin db operations
const getAdmin = async() =>{
    let result;
    try{
        const request = await adminPool.connect();
        result  = await request.query('uspGetWebsiteLogData');
    }catch(err)
    {
        console.error("an error occurred while trying to connect ot the db server  "+err)
    }finally{
        await adminPool.close();
        return  await result;
    }
}

const logLogData = async(log) => {

    // console.log("LOG DATA \n\n"+log);
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
    } catch (error) {
        console.log('Error has occurred   '+error);
    }
    finally{
        // await adminPool.close();
        // return await result;
    }
    return await result.recordsets[0][0];
}

const insertVisit = async(IPAddress,PageVisited) => {
    await adminPool.connect()
    const request = await adminPool.request();
    try {
        request.input('PageVisited', sql.VarChar(255), PageVisited);
        request.input('IPAddress', sql.VarChar(50), IPAddress);

        result  = await request.execute('uspInsertWebSiteVisit');
        // console.log(result.recordsets[0][0].LogId);
    } catch (error) {
        console.log('Error in inserting visit   \n'+error);
    }

}

module.exports = {
    getClient,
    getAdmin,
    getClientsAsJSON,
    getDataByType,
    insertObjectToSql,
    updateSqlObject,
    logLogData,
    insertVisit
}