const nodemailer = require('nodemailer');
const fs = require('fs');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://velvorax.tech';

/**
 * Sends an email with an attachment
 * @param {Object} options - Email options (to, subject, text, html, attachments)
 */
const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: `"Velvorax CRM" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments || []
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
};

/**
 * Sends a notification to the business client when a new lead is captured
 */
const sendLeadNotificationToAdmin = async (adminEmail, leadData) => {
    const emailOptions = {
        to: adminEmail,
        subject: `🔔 New Lead Captured: ${leadData.name}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: #fafafa;">
                <h2 style="color: #FFD700; text-align: center; background: #000; padding: 15px; border-radius: 8px;">New Lead Alert</h2>
                <p>Hello,</p>
                <p>A new lead has just submitted a form on your website/LinkedIn post.</p>
                <div style="background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Name:</strong> ${leadData.name}</p>
                    <p><strong>Email:</strong> ${leadData.email || 'Not provided'}</p>
                    <p><strong>Phone:</strong> ${leadData.phone || 'Not provided'}</p>
                    <p><strong>Company:</strong> ${leadData.company || 'Not provided'}</p>
                    <p><strong>Requirement:</strong> ${leadData.requirement || 'Not provided'}</p>
                </div>
                <p>Please log in to your dashboard to view more details and take action.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/leads.html"
                       style="background: #FFD700; color: black; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Lead in CRM</a>
                </div>
                <p style="font-size: 12px; color: #777; margin-top: 30px; text-align: center;">Velvorax Enterprise CRM Automation</p>
            </div>
        `
    };
    return await sendEmail(emailOptions);
};

/**
 * Sends an auto-response email to the lead
 */
const sendLeadAutoResponseToLead = async (leadEmail, leadName) => {
    const emailOptions = {
        to: leadEmail,
        subject: 'Thank you for your inquiry - Velvorax',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #FFD700; text-align: center;">We've Received Your Inquiry!</h2>
                <p>Hello ${leadName},</p>
                <p>Thank you for reaching out to us. We have successfully received your inquiry and our team is currently reviewing your requirements.</p>
                <p>One of our representatives will contact you shortly via email or WhatsApp to discuss this further.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p><b>What's next?</b></p>
                <ul>
                    <li>Our team reviews your request</li>
                    <li>We prepare a customized response/proposal</li>
                    <li>We get in touch for a quick discovery call</li>
                </ul>
                <p style="font-size: 12px; color: #777; margin-top: 30px;">Best Regards,<br>The Team</p>
            </div>
        `
    };
    return await sendEmail(emailOptions);
};

/**
 * Sends registration notification to all super admins
 * @param {Object} registrationData - The data submitted in the form
 * @param {string} pdfPath - Path to the generated PDF
 */
const sendRegistrationNotification = async (registrationData, pdfPath) => {
    const adminEmails = process.env.SUPER_ADMIN_EMAILS ? process.env.SUPER_ADMIN_EMAILS.split(',') : [];
    
    if (adminEmails.length === 0) {
        console.warn('No super admin emails configured. Skipping notification.');
        return;
    }

    const emailOptions = {
        to: adminEmails,
        subject: `[AWAITING APPROVAL] New Project Registration: ${registrationData.companyName}`,
        text: `A new client has registered and is awaiting your approval: ${registrationData.name} from ${registrationData.companyName}. Details are attached in the PDF.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #FFD700; text-align: center;">New Lead: Action Required</h2>
                <p>Hello Super Admin,</p>
                <p>A new client has just completed the <b>Get Started</b> form on Velvorax Software Solutions and is <b>awaiting your approval</b>.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p><b>Client Name:</b> ${registrationData.name}</p>
                <p><b>Company:</b> ${registrationData.companyName}</p>
                <p><b>Email:</b> ${registrationData.email}</p>
                <p><b>Status:</b> <span style="color: #f59e0b; font-weight: bold;">Pending Approval</span></p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p>Please log in to the Super Admin dashboard to <b>Accept</b> or <b>Decline</b> this registration. The full details are attached as a PDF.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${FRONTEND_URL}/accounts.html"
                    style="background: #FFD700; color: black; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Registration</a>
                </div>
                <p style="font-size: 12px; color: #777; margin-top: 30px;">Automated by Velvorax Backend Services</p>
            </div>
        `,
        attachments: [
            {
                filename: `Registration_${registrationData.companyName.replace(/\s+/g, '_')}.pdf`,
                path: pdfPath
            }
        ]
    };

    return await sendEmail(emailOptions);
};

/**
 * Sends a confirmation email to the user who just registered
 * @param {string} toEmail - User's email
 * @param {string} userName - User's name
 */
const sendRegistrationConfirmation = async (toEmail, userName) => {
    const emailOptions = {
        to: toEmail,
        subject: 'Registration Successful - Velvorax AI',
        text: `Hello ${userName}, Thank you for registering with Velvorax. Your account has been created successfully and is currently pending approval by our administration team. We will notify you once your account is ready.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #FFD700; text-align: center;">Registration Successful!</h2>
                <p>Hello ${userName},</p>
                <p>Thank you for choosing <b>Velvorax AI</b>. Your registration has been received successfully.</p>
                <div style="background: #fff8e1; border-left: 5px solid #FFD700; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;"><b>Status: Pending Approval</b></p>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">Our administration team is currently reviewing your application. You will receive another email as soon as your account is approved.</p>
                </div>
                <p>In the meantime, feel free to explore our website and learn more about our services.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message, please do not reply to this email.</p>
                <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2024 Velvorax AI. All rights reserved.</p>
            </div>
        `
    };

    return await sendEmail(emailOptions);
};

/**
 * Sends approval or rejection notification to the client
 * @param {string} toEmail - Client's email
 * @param {string} userName - Client's name
 * @param {string} status - 'Approved' or 'Rejected'
 */
const sendApprovalNotification = async (toEmail, userName, status) => {
    const isApproved = status === 'Approved';
    const subject = isApproved ? 'Welcome to Velvorax - Your Account is Approved!' : 'Velvorax Account Status Update';
    
    const emailOptions = {
        to: toEmail,
        subject: subject,
        text: isApproved 
            ? `Hello ${userName}, Great news! Your account on Velvorax Software Solutions has been approved. You can now log in to access your dashboard.`
            : `Hello ${userName}, We regret to inform you that your registration request on Velvorax Software Solutions has been declined at this time.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: ${isApproved ? '#FFD700' : '#ef4444'}; text-align: center;">${isApproved ? 'Account Approved!' : 'Account Update'}</h2>
                <p>Hello ${userName},</p>
                <p>${isApproved 
                    ? 'Great news! Your account on <b>Velvorax Software Solutions</b> has been reviewed and <b>approved</b> by our team.'
                    : 'Thank you for your interest in Velvorax. We have reviewed your registration request, and unfortunately, we are unable to approve your account at this time.'}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p><b>Status:</b> <span style="color: ${isApproved ? '#10b981' : '#ef4444'}; font-weight: bold;">${status}</span></p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                ${isApproved ? `
                <p>You can now log in to your dashboard to start managing your projects and data.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${FRONTEND_URL}/login.html"
                    style="background: #FFD700; color: black; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
                </div>
                ` : `
                <p>If you believe this is a mistake or would like to provide more information, please reply to this email.</p>
                `}
                <p style="font-size: 12px; color: #777; margin-top: 30px;">Best Regards,<br>The Velvorax Team</p>
            </div>
        `
    };

    return await sendEmail(emailOptions);
};

module.exports = {
    sendEmail,
    sendRegistrationNotification,
    sendRegistrationConfirmation,
    sendApprovalNotification,
    sendLeadNotificationToAdmin,
    sendLeadAutoResponseToLead
};
