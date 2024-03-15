require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
let htmlBody;

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

//Create emaikl body
const createBody = async(client) => {
  htmlBody = '<div><p>'+client.firstname+'</p><p>'+client.lastname+'</p><p>'+client.companyname+'</p><p>'+client.email+'</p><p>'+client.phone+'</p></div>';
  console.log('html body   '+htmlBody);
  return htmlBody;
}

// Function to send an email
const mailOptions = async (subject) => {
    try {
      // Send mail with defined transport object
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM, // Sender's email address
        to: process.env.EMAIL_FROM, // Recipient's email address
        subject: 'Test email', // Subject line
        text: 'hellow world', // Plain text body
        html: htmlBody,
        attachments:[{
          filename: 'C.jpg',
          path: 'public/images/C.jpg',
          contentType: 'application/jpg'
        }]
      });
  //path.join(_dirname,'c.jpg')
      console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
    }
  };


// const sendMail = async (transport,mailOptions) => {
//   try {
//   //  await transporter.sendMail(transport,mailOptions);
//   } catch (error) {
//     console.error(error);
//   }
// }

// sendMail(transporter,mailOptions);

module.exports = {
  // sendMail,
  createBody,
  mailOptions
};
