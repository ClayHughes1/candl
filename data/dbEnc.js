const crypto = require('crypto');


// Encrypt password
function encryptPassword(password) {
    const cipher = crypto.createCipher('aes-256-cbc', 'encryptionKey');
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}


// Decrypt password
function decryptPassword(encryptedPassword) {
    const decipher = crypto.createDecipher('aes-256-cbc', 'encryptionKey');
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}