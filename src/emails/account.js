const nodemailer = require("nodemailer");

const senderEmail = "ilya_prikaz@mail.ru";

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: senderEmail,
    pass: process.env.MAIL_PASS,
  },
});

/** Send email to user */
const emailUser = function (options) {
  transporter.sendMail(options, (err, info) => {
    if (err) {
      return console.log(err);
    }

    console.log("Sent: " + info.response);
  });
};

/** Send welcome email to user */
const sendWelcomeEmail = function (userEmail, userName) {
  const options = {
    from: senderEmail,
    to: userEmail,
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${userName}. Let me know how you get along with the app.`,
  };

  emailUser(options);
};

/** Send cancelation email to user */
const sendCancelationEmail = function (userEmail, userName) {
  const options = {
    from: senderEmail,
    to: userEmail,
    subject: "Sorry to see you go!",
    text: `Goodbye, ${userName}. I hope to see you back sometime soon.`,
  };

  emailUser(options);
};

module.exports = { sendWelcomeEmail, sendCancelationEmail };
