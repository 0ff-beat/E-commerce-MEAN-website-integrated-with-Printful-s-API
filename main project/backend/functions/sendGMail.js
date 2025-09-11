const nodeMailer = require("nodemailer");
const sendGMail = async (recipient_email, subject, text) => {
    //creating a transporter
    var transporter = await nodeMailer.createTransport({
        service: "gmail",
        secure:true,
        auth: {
            user: "gocoolmalhotra@gmail.com",
            pass: "ctks glia iahe wodv"
        },
        tls:{
            rejectUnauthorized:false
        }
    });
    //creating mailOptions
    var mailOptions = {
        from: "gocoolmalhotra@gmail.com",
        to: recipient_email,
        subject: subject,
        text: text
    }
    try{
        //sending email to the user
        await transporter.sendMail(mailOptions);
        return true;
    }catch(err){
        console.log(err)
        return false;
    }
}
module.exports = sendGMail