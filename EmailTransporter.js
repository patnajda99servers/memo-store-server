const nodemailer = require('nodemailer')
const dotenv = require('dotenv')

dotenv.config()

class EmailTransporter {

    constructor(email, subject, link) {
        this.email_ = email
        this.subject_ = subject
        this.link_ = link
    }

    transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: process.env.EMAIL_TO_SMTP,
            pass: process.env.PASSWORD_EMAIL
        }
    })

    sendRegisterEmail() {
        this.transporter.sendMail({
            from: `"NoteApp" <${process.env.EMAIL_TO_SMTP}>`,
            to: this.email_,
            subject: this.subject_,
            html: `<p>Activation link is available to click below. It will cause activating your account and redirecting to the login page.<br/>${this.link_}<p>`
        }).then(() => {
            console.log('activate link sent!')
        })
    }
    
    sendRecoverPasswordEmail() {
        this.transporter.sendMail({
            from: `"NoteApp" <${process.env.EMAIL_TO_SMTP}>`,
            to: this.email_,
            subject: this.subject_,
            html: `<p>Link to recover password is available to click below. It will cause redirecting to the page where you could set your new password.<br/>${this.link_}<p>`
        })
    }   
}


module.exports = EmailTransporter