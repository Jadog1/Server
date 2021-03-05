const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'adelia.conn@ethereal.email',
        pass: 'xEv1Th1bgVPNnrJvPZ'
    }
});

let message = {
    from: 'adelia.conn@ethereal.email',
    to: 'steijr03@pfw.edu',
    subject: 'Nodemailer is unicode friendly ?',
    text: 'Hello to myself!',
    html: '<p><b>Hello</b> to myself!</p>'
};

exports.sendEmail = () => {
    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
}