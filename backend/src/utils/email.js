// Transactional email via Nodemailer (FR10/FR13 confirmation + staff
// notification emails). In development, falls back to a free Ethereal
// test account — emails are captured in a web UI, not actually delivered.
// When SMTP env vars are set, uses those as the real provider.
//
// Per FR25 / UC-2's exception handling: an email failure must NEVER block
// storing a submission or performing a status update. Every call site
// awaits this but treats a thrown error as non-fatal — see routes/contact.js,
// routes/applications.js, and routes/admin.js.

import nodemailer from "nodemailer";

let transporter = null;
let etherealUrl = null;

async function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 587,
      secure: (Number(smtpPort) || 587) === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
    console.log("[email] using configured SMTP server");
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    etherealUrl = "https://ethereal.email/login";
    console.log("[email] using Ethereal test account — view emails at " + etherealUrl);
  }

  return transporter;
}

export async function sendEmail({ to, subject, body }) {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || '"Sof2eze" <noreply@sof2eze.com>',
    to,
    subject,
    text: body,
  });

  if (etherealUrl) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("[email] preview: " + previewUrl);
    }
  }

  return { delivered: true, messageId: info.messageId };
}
