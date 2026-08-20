// Transactional email via Resend's HTTPS API (not raw SMTP). Railway blocks
// outbound SMTP ports (25/465/587/2525) on the Free/Trial/Hobby plans, so
// Nodemailer + SMTP can never succeed there — the HTTPS API isn't affected
// by that block. See https://docs.railway.com/networking/outbound-networking
//
// In development (no RESEND_API_KEY set), emails are just logged to the
// console instead of actually sent.
//
// Per FR25 / UC-2's exception handling: an email failure must NEVER block
// storing a submission or performing a status update. Every call site
// awaits this but treats a thrown error as non-fatal — see routes/contact.js,
// routes/applications.js, routes/newsletter.js, and routes/admin.js.

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendEmail({ to, subject, body }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SMTP_FROM || '"Sof2eze" <onboarding@resend.dev>';

  if (!apiKey) {
    console.log(`[email] no RESEND_API_KEY set — logging instead of sending:\nTo: ${to}\nSubject: ${subject}\n${body}`);
    return { delivered: false, dev: true };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text: body }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Resend API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return { delivered: true, messageId: data.id };
}