require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
// const dbOps = require('././data/dbOps');

let htmlBody;

//create html body section 
const qouteEmailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Quote Request Received</title>
</head>
<body>

<!-- Header -->
<h1 style="font-size: 24px; font-weight: bold;">C&amp;L Enterprises</h1>

<!-- Message -->
<p>Dear Valued Client,</p>
<p>We have received your quote request. Our team at C&amp;L Enterprises is currently working diligently on it and will contact you as soon as the estimates have been created based on your specific service needs.</p>

<!-- Contact Information -->
<p>For any urgent inquiries, please feel free to contact us at: <strong>220-215-0612</strong>.</p>

</body>
</html>
`;

const conEmailBody = async(rqstor) => {
  const confEmail = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Request For Assistance Confirmation</title>
  </head>
  <body>
      <h4>Request For Assistance  Received</h4>
      <p>Dear ${rqstor.recipientName},</p>
      <p>We have received your request for assistance. Our team will review your request and get back to you shortly.</p>
      <p>Thank you for choosing our services.</p>
      <p>Best regards,</p>
      <p>C&L Enterprises</p>
  </body>
  </html>
`;

return confEmail;
}

const crspEmailBody = async(mssgParams,qouteId,type) => {
  let compEmailBody = 
  `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Inquiry Information ${type}: #${qouteId}</title>
    </head>
    <body>
        <h2>Project Inquiry Details</h2>
        <p><strong>Qoute Id:</strong> ${qouteId}</p>
        <p><strong>Service Type:</strong> ${mssgParams.ServiceTypeId}</p>
        <p><strong>Project Description:</strong> ${mssgParams.ProjectDescription}</p>
        <p><strong>Estimated Cost:</strong> ${mssgParams.EstimatedCost}</p>
        <p><strong>Additional Notes:</strong> ${mssgParams.AdditionalNotes}</p>
        <hr>
        <h3>Contact Information</h3>
        <p><strong>Company Name:</strong> ${mssgParams.CompanyName}</p>
        <p><strong>First Name:</strong> ${mssgParams.FirstName}</p>
        <p><strong>Last Name:</strong> ${mssgParams.LastName}</p>
        <p><strong>Email Address:</strong> ${mssgParams.EmailAddress}</p>
        <p><strong>Business Phone:</strong> ${mssgParams.BusinessPhone}</p>
        <p><strong>Contact Preference:</strong> ${mssgParams.ContactPreference}</p>
        <p><strong>Extension:</strong> ${mssgParams.Extension}</p>
    </body>
    </html>
  `;
  return compEmailBody;
}

const crspEmailAssistBody = async(mssgParams,senderName) => {
  let compEmailBody = 
  `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assistance requrest - ${senderName}</title>
    </head>
    <body>
        <h3>Contact Information</h3>
        <p><strong>Company Name:</strong> ${mssgParams.CompanyName}</p>
        <p><strong>First Name:</strong> ${mssgParams.FirstName}</p>
        <p><strong>Last Name:</strong> ${mssgParams.LastName}</p>
        <p><strong>Email Address:</strong> ${mssgParams.EmailAddress}</p>
        <p><strong>Business Phone:</strong> ${mssgParams.BusinessPhone}</p>
        <p><strong>Extension:</strong> ${mssgParams.Extension}</p>
        <p><strong>Extension:</strong> ${mssgParams.Description}</p>
    </body>
    </html>
  `;
  return compEmailBody;
}

// Create a transporter with your email service provider's SMTP settings
const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., 'gmail'
    host:'smtp.gmail.com',
    port:587,//can use 465 as well, but is deprecated and is an outdated protocol
    secure:false,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.APP_PASS,
    }
});

//Create email body
const createBody = async(client) => {
  htmlBody = '<div><p>'+client.firstname+'</p><p>'+client.lastname+'</p><p>'+client.companyname+'</p><p>'+client.email+'</p><p>'+client.phone+'</p></div>';
  console.log('html body   '+htmlBody);
  return htmlBody;
}

// Function to send an email
const sendQouteMail = async (emailTo) => {
    try {
      // Send mail with defined transport object
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM, // Sender's email address
        to: emailTo, // Recipient's email address
        subject: 'Your service qoute', // Subject line
        text: 'Your service qoute has been recieved', // Plain text body
        html: qouteEmailBody,
        attachments:[{
          filename: 'C.jpg',
          path: 'public/images/C.jpg',
          contentType: 'application/jpg'
        }]
      }).catch((err) => {
          dbOps.logSiteError(err);
          response.status(500).json({ error: 'Internal Server Error' });
      });
      console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
    }
};

// Send assistance request cnofrimation email
const sendConHelpEmail = async(emailTo,recipient) => {
  let emailBody = (await conEmailBody(recipient)).toString();
  try {
    console.log('RECIPIENT    \n'+JSON.stringify(recipient));
    console.log(emailBody);

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Sender's email address
      to: emailTo, // Recipient's email address
      subject: 'Your request for assistance', // Subject line
      text: 'We have recieved your request for assistance', // Plain text body
      html: emailBody,
      attachments:[{
        filename: 'C.jpg',
        path: 'public/images/C.jpg',
        contentType: 'application/jpg'
      }]
    }).catch((err) => {
        dbOps.logSiteError(err);
        response.status(500).json({ error: 'Internal Server Error' });
    });
    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

const sendEmailToCompAccount = async(inpValues,reqType,keyVal) => {
  console.log('sending email to company account  \n'+JSON.stringify(inpValues));
  console.log(keyVal);
  let reqEmail = reqType === 'qoute'?await crspEmailBody(inpValues,keyVal,reqType):
  await  crspEmailAssistBody(inpValues,reqType,keyVal);

  console.log(reqEmail);
  try{
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Sender's email address
      to: process.env.EMAIL_ADD, // Recipient's email address
      subject: reqType, // Subject line
      text: 'Client request type ${reqType}', // Plain text body
      html: reqEmail,
      attachments:[{
        filename: 'C.jpg',
        path: 'public/images/C.jpg',
        contentType: 'application/jpg'
      }]
    }).catch((err) => {
        dbOps.logSiteError(err);
        response.status(500).json({ error: 'Internal Server Error' });
    });
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
}

const sendPassReset = async(emailTo) => {
  console.log('EMAIL RESET \n'+emailTo);
  // Construct the reset password link with the recipient's email address
  const resetPasswordLink = `http://localhost:4000/api/passreset?email=${emailTo}`;
  const htmlBody = `<p>Hello,</p><p>Please click on the following link to reset your password:</p><a href="${resetPasswordLink}">Reset Password</a>` 

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM, // Sender's email address
    to: emailTo, // Recipient's email address
    subject: 'Password Reset', // Subject line
    text: 'You have requested to reset your password.', // Plain text body
    html: htmlBody
  }).catch((err) => {
      dbOps.logSiteError(err);
      response.status(500).json({ error: 'Internal Server Error' });
  });
  console.log('INFO              \n'+JSON.stringify(info));

}

module.exports = {
  // sendMail,
  createBody,
  sendQouteMail,
  sendConHelpEmail,
  sendPassReset,
  sendEmailToCompAccount
};
