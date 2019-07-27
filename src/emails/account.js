const sgMail = require("@sendgrid/mail")
const apiKey = process.env.EMAIL_API_KEY

sgMail.setApiKey(apiKey)

const sendWelcomeEmail = (name, email) =>{
    sgMail.send({
        to : email,
        from : "mukulmahaur@gmail.com",
        subject : "Welcome to Mukul's App",
        text: `Welcome ${name}, Thanks for signing in.` 
    })
}

const sendCancellationMail = (name, email) =>{
    sgMail.send({
        to : email,
        from : "mukulmahaur@gmail.com",
        subject : "Sorry to see you go",
        text: `Goodbye ${name}. We will try to improve.` 
    })

}

module.exports = {
    sendWelcomeEmail,
    sendCancellationMail
}