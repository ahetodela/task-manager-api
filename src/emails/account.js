const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "aheto.dela@gmail.com",
        subject: "Welcome on board",
        text: `Welcome to the task manager app ${name}. Let us know what you think about the app.😉`,
    });
};
const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "aheto.dela@gmail.com",
        subject: "Cancellation",
        text: `Sad to see you leave the task manager app ${name}. Let us know what went wrong or why you are leaving us 😪.`,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail,
};
