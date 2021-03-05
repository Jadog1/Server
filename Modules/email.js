const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'adelia.conn@ethereal.email',
        pass: 'xEv1Th1bgVPNnrJvPZ'
    }
});