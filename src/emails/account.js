const nodemailer = require("nodemailer");

const senderEmail = "ilya_prikaz@mail.ru";

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: senderEmail,
    pass: "Z7WrHTP5M77H7j5DJed8",
  },
});

/** Send welcome email to user */
const sendWelcomeEmail = function (userEmail, userName) {
  const options = {
    from: senderEmail,
    to: userEmail,
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${userName}. Let me know how you get along with the app.`,
  };

  transporter.sendMail(options, (err, info) => {
    if (err) {
      return console.log(err);
    }

    console.log("Sent: " + info.response);
  });
};

/** Send cancelation email to user */
const sendCancelationEmail = function (userEmail, userName) {
  const options = {
    from: senderEmail,
    to: userEmail,
    subject: "Sorry to see you go!",
    text: `Goodbye, ${userName}. I hope to see you back sometime soon.`,
  };

  transporter.sendMail(options, (err, info) => {
    if (err) {
      return console.log(err);
    }

    console.log("Sent: " + info.response);
  });
};

module.exports = { sendWelcomeEmail, sendCancelationEmail };
