const nodemailer = require("nodemailer");

const connectEmail = nodemailer.createTransport({
  host: "smtp.office365.com", // hostname
  secureConnection: false, // use SSL
  port: 587, // port for secure SMTP
  auth: {
    user: "allsolution@tlogical.com",
    pass: "RA28d8Jj",
  },
  tls: {
    ciphers: "SSLv3",
  },
});



module.exports = connectEmail;

