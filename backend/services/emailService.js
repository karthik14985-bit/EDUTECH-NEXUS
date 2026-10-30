// Email Service for EDUTECH NEXUS
// Supports Password Reset and Internship Application Notifications

async function sendPasswordResetEmail(email, resetUrl) {
  if (!process.env.SMTP_HOST && !process.env.EMAIL_HOST) {
    console.log(`[EMAIL] Password reset URL for ${email}: ${resetUrl}`);
    return true;
  }
  try {
    const nodemailer = require('nodemailer');
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;
    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || user || 'no-reply@edutechnexus.com',
      to: email,
      subject: 'EDUTECH NEXUS password reset',
      text: `Reset your password using this link: ${resetUrl}`
    });
    return true;
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to send password reset:', err.message);
    return false;
  }
}

async function sendInternshipNotificationEmail(appData) {
  const targetEmail = process.env.INTERNSHIP_NOTIFICATION_EMAIL || 'sudku567@gmail.com';
  const { applicationId, fullName, email, phone, college, department, internshipTitle, companyName } = appData;

  const subject = `[EDUTECH NEXUS] New Internship Application: ${applicationId} - ${fullName}`;
  const textBody = `
New Internship Application Received:
------------------------------------
Application ID: ${applicationId}
Applicant Name: ${fullName}
Applicant Email: ${email}
Phone Number:   ${phone}
Institution:    ${college || 'N/A'}
Department:     ${department || 'N/A'}
Role Applied:   ${internshipTitle}
Company:        ${companyName}
Submission Time: ${new Date().toISOString()}

This application is now available for review in the EDUTECH NEXUS Admin Portal.
  `.trim();

  console.log(`[EMAIL NOTIFICATION] Dispatched for ${applicationId} to configured admin email: ${targetEmail}`);

  if (!process.env.SMTP_HOST && !process.env.EMAIL_HOST) {
    // When SMTP host not configured in development, notification is logged safely without error
    return true;
  }

  try {
    const nodemailer = require('nodemailer');
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;
    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || user || 'recruitment@edutechnexus.com',
      to: targetEmail,
      subject,
      text: textBody
    });
    return true;
  } catch (err) {
    console.warn('[EMAIL WARNING] SMTP transport notice:', err.message);
    return false;
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendInternshipNotificationEmail
};
