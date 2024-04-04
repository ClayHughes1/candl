require('dotenv').config();




// client config 
const clientConfig = {
    user:process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database:process.env.DB_NAME,
    options:{
        trustServerCertificate: true,
        trustedConnection: false,
        instancename: 'LAPTOP-8SHVUJ6V'
    },
    port:1433
}

//admin config
const adminConfig = {
    user:process.env.ADMIN_DB_USERNAME,
    password: process.env.ADMIN_DB_PASSWORD,
    server: process.env.ADMIN_DB_SERVER,
    database:process.env.ADMIN_DB_NAME,
    options:{
        trustServerCertificate: true,
        trustedConnection: false,
        instancename: 'LAPTOP-8SHVUJ6V'
    },
    port:1433
}

console.log(adminConfig.database);

module.exports = {
    clientConfig,
    adminConfig
};