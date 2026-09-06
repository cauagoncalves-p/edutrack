// nodemailer: biblioteca usada para enviar emails via SMTP
const nodemailer = require('nodemailer');

// "Transporter" é o objeto que sabe como se conectar e enviar
// emails através do serviço configurado — aqui, o Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // a senha de app, não a senha normal da conta
    }
});

module.exports = transporter;