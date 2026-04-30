import MailGen from 'mailgen';
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const mailGenerator = new MailGen({
        theme: "default",
        product: {
            name: "Leetlab",
            link: "https://leetlab.app"
        }
    })

    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAITRAP_SMTP_PASS
        }
    })

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml
    }


    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service failed ")
        console.error("Error", error);
    }

}


/**
 *
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {Mailgen.Content}
 * @description It designs the email verification mail
 */
const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our app! We're very excited to have you on board.",
            action: {
                instructions:
                    "To verify your email please click on the following button:",
                button: {
                    color: "#22BC66", // Optional action button color
                    text: "Verify your email",
                    link: verificationUrl,
                },
            },
            outro:
                "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};

/**
 *
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {Mailgen.Content}
 * @description It designs the forgot password mail
 */
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    
    return {
    body: {
            name: username,
            intro: "We got a request to reset the password of our account",
            action: {
                instructions:
                    "To reset your password click on the following button or link:",
                button: {
                    color: "#22BC66", // Optional action button color
                    text: "Reset password",
                    link: passwordResetUrl,
                },
            },
            outro:
                "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
};
